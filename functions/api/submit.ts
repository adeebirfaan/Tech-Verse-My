// Cloudflare Pages Function: POST /api/submit
// Saves a directory submission to D1 (binding DB) and its logo to R2 (binding LOGOS),
// then emails the owner through Resend when it's configured. Setup steps are in SUBMISSIONS.md.

import { notifyNewSubmission, type NotifyEnv } from "../_notify";
import { json, type BaseEnv, type Ctx } from "../_types";
import { checkListing, LIMITS } from "../_validate";

type Env = BaseEnv & NotifyEnv;

const MAX_LOGO_BYTES = 1024 * 1024;

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

function logoType(bytes: Uint8Array): { ext: string; mime: string } | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  const ascii = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}

export const onRequestPost = async (context: Ctx<Env>): Promise<Response> => {
  const { request, env } = context;
  if (!env.DB) {
    // The binding name is safe to show and makes a missing binding easy to spot.
    return json(503, { ok: false, error: "Submissions are not set up on this server yet.", missing: "DB" });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: "The form could not be read. Try again." });
  }

  // Honeypot: real people never see or fill this field.
  if (text(form, "company")) return json(200, { ok: true });

  const checked = checkListing({
    name: text(form, "name"),
    description: text(form, "description"),
    category: text(form, "category"),
    type: text(form, "type"),
    threads: text(form, "threads"),
    website: text(form, "website"),
    android: text(form, "android"),
    ios: text(form, "ios"),
  });
  const errors: Record<string, string> = checked.ok ? {} : { ...checked.errors };
  if (errors.threads) errors.threads = "Write your Threads handle as @name.";

  const email = text(form, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > LIMITS.email) errors.email = "Write your email as name@example.com.";

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

  if (!checked.ok || Object.keys(errors).length) {
    return json(422, { ok: false, error: "Some fields need another look.", fields: errors });
  }
  const v = checked.value;

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
    .bind(id, v.name, v.description, v.category, v.type, `@${v.handle}`, v.website || null, v.android || null, v.ios || null, logoKey, email)
    .run();

  // Sent after the response, so the maker isn't kept waiting; a failed email never loses the submission.
  context.waitUntil(
    notifyNewSubmission(env, {
      id, name: v.name, description: v.description, category: v.category, type: v.type, handle: v.handle, email,
      website: v.website, android: v.android, ios: v.ios,
      logo, logoKey,
      adminUrl: `${new URL(request.url).origin}/admin`,
    }).catch((e) => console.error("Resend notification error:", e)),
  );

  return json(201, { ok: true, id });
};

export const onRequest = async (): Promise<Response> =>
  json(405, { ok: false, error: "Send the form with POST." });
