// Guards every /api/admin/* route except sign-in.
import { ADMIN_HEADER, COOKIE, readCookie, verifySession } from "../../_auth";
import { json, type Ctx } from "../../_types";

export const onRequest = async (ctx: Ctx): Promise<Response> => {
  const { request, env } = ctx;
  if (new URL(request.url).pathname === "/api/admin/login") return ctx.next();

  if (!env.ADMIN_PASSWORD) {
    return json(503, { ok: false, error: "The admin page isn't set up yet.", missing: "ADMIN_PASSWORD" });
  }
  if (!(await verifySession(env.ADMIN_PASSWORD, readCookie(request, COOKIE)))) {
    return json(401, { ok: false, error: "Sign in to continue." });
  }
  if (request.method !== "GET" && request.headers.get(ADMIN_HEADER) !== "1") {
    return json(403, { ok: false, error: "This request didn't come from the admin page." });
  }
  return ctx.next();
};
