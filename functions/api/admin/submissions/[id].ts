// PATCH  /api/admin/submissions/:id  { action?: "approve" | "reject" | "pending", ...edits }
// DELETE /api/admin/submissions/:id  -> removes the row and its logo
import { checkListing } from "../../../_validate";
import { isUuid, json, param, type Ctx, type SubmissionRow } from "../../../_types";

const ACTIONS = { approve: "approved", reject: "rejected", pending: "pending" } as const;

interface PatchBody {
  action?: keyof typeof ACTIONS;
  edits?: { name: string; description: string; category: string; type: string; threads: string; website: string; android: string; ios: string };
}

export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
  const { env, request } = ctx;
  const id = param(ctx, "id");
  if (!env.DB) return json(503, { ok: false, error: "Submissions are not set up on this server yet.", missing: "DB" });
  if (!isUuid(id)) return json(404, { ok: false, error: "No submission with that id." });

  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body || (!body.action && !body.edits)) return json(400, { ok: false, error: "Nothing to change." });
  if (body.action && !(body.action in ACTIONS)) return json(400, { ok: false, error: "Unknown action." });

  const row = await env.DB.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first<SubmissionRow>();
  if (!row) return json(404, { ok: false, error: "No submission with that id." });

  const sets: string[] = [];
  const values: unknown[] = [];

  if (body.edits) {
    const checked = checkListing(body.edits);
    if (!checked.ok) return json(422, { ok: false, error: "Some fields need another look.", fields: checked.errors });
    const v = checked.value;
    sets.push("name = ?", "description = ?", "category = ?", "type = ?", "creator_handle = ?", "website_url = ?", "android_url = ?", "ios_url = ?");
    values.push(v.name, v.description, v.category, v.type, `@${v.handle}`, v.website || null, v.android || null, v.ios || null);
  }
  if (body.action) {
    sets.push("status = ?");
    values.push(ACTIONS[body.action]);
  }

  await env.DB.prepare(`UPDATE submissions SET ${sets.join(", ")} WHERE id = ?`).bind(...values, id).run();
  const updated = await env.DB.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first<SubmissionRow>();
  return json(200, { ok: true, submission: { ...updated, logo_url: updated?.logo_key ? `/api/admin/logo/${id}` : null } });
};

export const onRequestDelete = async (ctx: Ctx): Promise<Response> => {
  const { env } = ctx;
  const id = param(ctx, "id");
  if (!env.DB) return json(503, { ok: false, error: "Submissions are not set up on this server yet.", missing: "DB" });
  if (!isUuid(id)) return json(404, { ok: false, error: "No submission with that id." });

  const row = await env.DB.prepare("SELECT logo_key FROM submissions WHERE id = ?").bind(id).first<{ logo_key: string | null }>();
  if (!row) return json(404, { ok: false, error: "No submission with that id." });
  if (row.logo_key && env.LOGOS) await env.LOGOS.delete(row.logo_key);
  await env.DB.prepare("DELETE FROM submissions WHERE id = ?").bind(id).run();
  return json(200, { ok: true });
};
