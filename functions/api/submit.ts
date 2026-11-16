// Cloudflare Pages Function: POST /api/submit
// Saves a directory submission to D1 (binding DB) and its logo to R2 (binding LOGOS),
// then emails the owner through Resend when it's configured. Setup steps are in SUBMISSIONS.md.

import { notifyNewSubmission, type NotifyEnv } from "../_notify";

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface R2Bucket {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}
interface Env extends NotifyEnv {
  DB?: D1Database;
  LOGOS?: R2Bucket;
}
interface Context {
  request: Request;
  env: Env;
  waitUntil(promise: Promise<unknown>): void;
}

const MAX_LOGO_BYTES = 1024 * 1024;
const LIMITS = { name: 80, description: 300, category: 40, url: 300, email: 200 };

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

function httpsUrl(value: string, hosts?: string[]): string | null {
  if (!value) return "";
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Accepts "@name", "name" or a threads.com / threads.net profile URL; returns "name". */
function threadsHandle(value: string): string | null {
  const m = value.match(/^(?:https?:\/\/(?:www\.)?threads\.(?:com|net)\/)?@?([A-Za-z0-9._]{1,30})\/?$/);
  return m ? m[1] : null;
}

function logoType(bytes: Uint8Array): { ext: string; mime: string } | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  const ascii = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}

export const onRequestPost = async (context: Context): Promise<Response> => {
  const { request, env } = context;
  if (!env.DB) {
    return json(503, { ok: false, error: "Submissions are not set up on this server yet." });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: "The form could not be read. Try again." });
  }

  // Honeypot: real people never see or fill this field.
  if (text(form, "company")) return json(200, { ok: true });

  const errors: Record<string, string> = {};
  const name = text(form, "name");
  const description = text(form, "description");
  const category = text(form, "category");
  const type = text(form, "type");
  const handle = threadsHandle(text(form, "threads"));
  const email = text(form, "email");
  const website = httpsUrl(text(form, "website"));
  const android = httpsUrl(text(form, "android"), ["play.google.com"]);
  const ios = httpsUrl(text(form, "ios"), ["apps.apple.com"]);

  if (!name || name.length > LIMITS.name) errors.name = `Give the product's name, up to ${LIMITS.name} characters.`;
  if (!description || description.length > LIMITS.description) errors.description = `Describe it in up to ${LIMITS.description} characters.`;
  if (!category || category.length > LIMITS.category) errors.category = "Pick or type a category.";
  if (type !== "App" && type !== "Website") errors.type = "Choose App or Website.";
  if (!handle) errors.threads = "Write your Threads handle as @name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > LIMITS.email) errors.email = "Write your email as name@example.com.";
  if (website === null) errors.website = "Use a full link that starts with https://.";
  if (android === null) errors.android = "Use a Google Play link (https://play.google.com/…).";
  if (ios === null) errors.ios = "Use an App Store link (https://apps.apple.com/…).";
  if (!errors.website && !errors.android && !errors.ios && !website && !android && !ios) {
    errors.website = "Add at least one link: a website, Google Play or the App Store.";
  }
  if ([website, android, ios].some((u) => u && u.length > LIMITS.url)) errors.website = "One of the links is too long.";

  let logo: { bytes: ArrayBuffer; ext: string; mime: string } | null = null;
  const file = form.get("logo");
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX_LOGO_BYTES) {
      errors.logo = "The logo must be 1 MB or smaller.";
    } else {
      const bytes = await file.arrayBuffer();
      const kind = logoType(new Uint8Array(bytes.slice(0, 16)));
      if (!kind) errors.logo = "Upload the logo as a PNG, JPG or WebP image.";
      else logo = { bytes, ...kind };
    }
  }

  if (Object.keys(errors).length) return json(422, { ok: false, error: "Some fields need another look.", fields: errors });

  const id = crypto.randomUUID();
  let logoKey: string | null = null;
  if (logo && env.LOGOS) {
    logoKey = `submissions/${id}.${logo.ext}`;
    await env.LOGOS.put(logoKey, logo.bytes, { httpMetadata: { contentType: logo.mime } });
  }

  await env.DB.prepare(
    `INSERT INTO submissions (id, name, description, category, type, creator_handle, website_url, android_url, ios_url, logo_key, contact_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, name, description, category, type, `@${handle}`, website || null, android || null, ios || null, logoKey, email)
    .run();

  // Sent after the response, so the maker isn't kept waiting; a failed email never loses the submission.
  context.waitUntil(
    notifyNewSubmission(env, {
      id, name, description, category, type, handle: handle!, email,
      website: website || "", android: android || "", ios: ios || "",
      logo, logoKey,
    }).catch((e) => console.error("Resend notification error:", e)),
  );

  return json(201, { ok: true, id });
};

export const onRequest = async (): Promise<Response> =>
  json(405, { ok: false, error: "Send the form with POST." });
