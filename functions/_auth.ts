// Admin session: an HMAC-signed expiry in an HttpOnly cookie. The signing key comes from
// ADMIN_PASSWORD, so changing the password signs everyone out.

const enc = new TextEncoder();
export const COOKIE = "tv_admin";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(`techverse-admin:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

/** Compares two strings in time that doesn't depend on where they differ. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(expected: string, given: string): Promise<boolean> {
  const digest = async (s: string) => b64url(await crypto.subtle.digest("SHA-256", enc.encode(s)));
  return safeEqual(await digest(expected), await digest(given));
}

export async function createSession(secret: string): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${exp}.${await hmac(secret, exp)}`;
}

export async function verifySession(secret: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(secret, exp));
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export const sessionCookie = (value: string, maxAge: number) =>
  `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

/** Header the admin page sends on every change, so a form on another site can't trigger one. */
export const ADMIN_HEADER = "x-techverse-admin";
