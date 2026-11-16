// Emails a new submission to the site owner through Resend (https://resend.com/docs/api-reference/emails/send-email).
// Configured with environment variables on the Pages project; see SUBMISSIONS.md.

export interface NotifyEnv {
  RESEND_API_KEY?: string;
  /** Where notifications go, e.g. you@example.com. Several: comma-separated. */
  NOTIFY_TO?: string;
  /** Sender on a domain verified in Resend, e.g. "Techverse MY <submissions@yourdomain.com>". */
  NOTIFY_FROM?: string;
  /** Only for local testing against a mock; defaults to Resend's API. */
  RESEND_API_URL?: string;
}

export interface Submission {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  handle: string;
  email: string;
  website: string;
  android: string;
  ios: string;
  logo: { bytes: ArrayBuffer; ext: string; mime: string } | null;
  logoKey: string | null;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function base64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function logoLine(s: Submission): string {
  if (!s.logo) return "None uploaded";
  return s.logoKey ? `Attached, and saved in R2 as ${s.logoKey}` : "Attached (not stored in R2: no LOGOS bucket is bound)";
}

export function isNotifyConfigured(env: NotifyEnv): boolean {
  return Boolean(env.RESEND_API_KEY && env.NOTIFY_TO && env.NOTIFY_FROM);
}

export async function notifyNewSubmission(env: NotifyEnv, s: Submission): Promise<void> {
  if (!isNotifyConfigured(env)) return;

  const links: [string, string][] = [
    ["Website", s.website],
    ["Google Play", s.android],
    ["App Store", s.ios],
  ].filter(([, url]) => url) as [string, string][];

  const rows: [string, string][] = [
    ["Name", esc(s.name)],
    ["What it does", esc(s.description)],
    ["Category", esc(s.category)],
    ["Type", esc(s.type)],
    ["Maker", `<a href="https://www.threads.com/@${esc(s.handle)}">@${esc(s.handle)}</a>`],
    ["Contact", `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`],
    ...links.map(([label, url]): [string, string] => [label, `<a href="${esc(url)}">${esc(url)}</a>`]),
    ["Logo", esc(logoLine(s))],
  ];

  const approve = `UPDATE submissions SET status = 'approved' WHERE id = '${s.id}';`;

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f6f3;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1e1b17">
<div style="max-width:560px;margin:0 auto;background:#fdfcfa;border:1px solid #e6e3dd;border-radius:14px;padding:24px">
<p style="margin:0 0 4px;font-size:14px;color:#6b665e">New submission on Techverse MY</p>
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.2">${esc(s.name)}</h1>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5">
${rows.map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #eeebe6;color:#6b665e;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:8px 0;border-top:1px solid #eeebe6;word-break:break-word">${v}</td></tr>`).join("\n")}
</table>
<p style="margin:20px 0 6px;font-size:14px;color:#6b665e">Approve it in D1 once it's in products.ts:</p>
<pre style="margin:0;padding:12px;background:#f1efea;border-radius:8px;font-size:13px;white-space:pre-wrap;word-break:break-all">${esc(approve)}</pre>
<p style="margin:16px 0 0;font-size:13px;color:#6b665e">Reply to this email to write to the maker.</p>
</div></body></html>`;

  const text = [
    `New submission on Techverse MY: ${s.name}`,
    "",
    `What it does: ${s.description}`,
    `Category: ${s.category}`,
    `Type: ${s.type}`,
    `Maker: @${s.handle} (https://www.threads.com/@${s.handle})`,
    `Contact: ${s.email}`,
    ...links.map(([label, url]) => `${label}: ${url}`),
    `Logo: ${logoLine(s)}`,
    "",
    "Approve it in D1 once it's in products.ts:",
    approve,
  ].join("\n");

  const body: Record<string, unknown> = {
    from: env.NOTIFY_FROM,
    to: env.NOTIFY_TO!.split(",").map((a) => a.trim()).filter(Boolean),
    reply_to: s.email,
    subject: `New submission: ${s.name}`,
    html,
    text,
    tags: [{ name: "kind", value: "submission" }],
  };
  if (s.logo) body.attachments = [{ filename: `${s.name.replace(/[^\w.-]+/g, "-").slice(0, 40) || "logo"}.${s.logo.ext}`, content: base64(s.logo.bytes) }];

  const res = await fetch(env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `submission-${s.id}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Logged to the Pages Function logs; the submission itself is already saved.
    console.error(`Resend notification failed (${res.status}): ${(await res.text()).slice(0, 500)}`);
  }
}
