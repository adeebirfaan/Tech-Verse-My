// GET /api/admin/submissions -> every submission, newest first (the middleware has checked the session).
import { json, type Ctx, type SubmissionRow } from "../../_types";

export const onRequestGet = async ({ env }: Ctx): Promise<Response> => {
  if (!env.DB) return json(503, { ok: false, error: "Submissions are not set up on this server yet.", missing: "DB" });
  const { results } = await env.DB.prepare("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500").all<SubmissionRow>();
  return json(200, {
    ok: true,
    submissions: results.map((r) => ({ ...r, logo_url: r.logo_key ? `/api/admin/logo/${r.id}` : null })),
  });
};
