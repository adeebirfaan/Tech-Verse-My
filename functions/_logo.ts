// Streams a submission's logo from R2.
import { isUuid, type BaseEnv } from "./_types";

export async function serveLogo(env: BaseEnv, id: string, opts: { approvedOnly: boolean }): Promise<Response> {
  const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  if (!env.DB || !env.LOGOS || !isUuid(id)) return notFound();

  const row = await env.DB.prepare("SELECT logo_key, status FROM submissions WHERE id = ?").bind(id).first<{ logo_key: string | null; status: string }>();
  if (!row?.logo_key || (opts.approvedOnly && row.status !== "approved")) return notFound();

  const obj = await env.LOGOS.get(row.logo_key);
  if (!obj) return notFound();
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType || "application/octet-stream",
      etag: obj.httpEtag,
      "x-content-type-options": "nosniff",
      "cache-control": opts.approvedOnly ? "public, max-age=3600" : "private, no-store",
    },
  });
}
