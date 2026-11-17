// GET /api/listings -> approved submissions, in the same shape as src/data/products.ts (public).
import { json, rowToProduct, type Ctx, type SubmissionRow } from "../_types";

export const onRequestGet = async ({ env }: Ctx): Promise<Response> => {
  if (!env.DB) return json(200, { ok: true, products: [] });
  const { results } = await env.DB.prepare(
    "SELECT * FROM submissions WHERE status = 'approved' ORDER BY created_at ASC LIMIT 500",
  ).all<SubmissionRow>();
  return json(200, { ok: true, products: results.map(rowToProduct) }, { "cache-control": "public, max-age=60" });
};
