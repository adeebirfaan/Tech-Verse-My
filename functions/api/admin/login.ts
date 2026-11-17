// POST /api/admin/login  { password }  -> sets the session cookie
// DELETE /api/admin/login               -> signs out
import { createSession, passwordMatches, SESSION_SECONDS, sessionCookie } from "../../_auth";
import { json, type Ctx } from "../../_types";

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!env.ADMIN_PASSWORD) {
    return json(503, { ok: false, error: "The admin page isn't set up yet.", missing: "ADMIN_PASSWORD" });
  }
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !(await passwordMatches(env.ADMIN_PASSWORD, password))) {
    // A short pause makes guessing slow.
    await new Promise((r) => setTimeout(r, 800));
    return json(401, { ok: false, error: "That password isn't right." });
  }
  return json(200, { ok: true }, { "set-cookie": sessionCookie(await createSession(env.ADMIN_PASSWORD), SESSION_SECONDS) });
};

export const onRequestDelete = async (): Promise<Response> =>
  json(200, { ok: true }, { "set-cookie": sessionCookie("", 0) });
