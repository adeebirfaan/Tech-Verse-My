// Shared types and helpers for the Pages Functions. Files starting with "_" are not routes.

export interface D1Result<T> {
  results: T[];
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
export interface R2ObjectBody {
  body: ReadableStream;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
}
export interface R2Bucket {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

export interface BaseEnv {
  DB?: D1Database;
  LOGOS?: R2Bucket;
  /** The password for /admin. Add it as an encrypted secret on the Pages project. */
  ADMIN_PASSWORD?: string;
}

export interface Ctx<E = BaseEnv> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  waitUntil(promise: Promise<unknown>): void;
  next(): Promise<Response>;
}

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export type Status = "pending" | "approved" | "rejected";

export interface SubmissionRow {
  id: string;
  created_at: string;
  status: Status;
  name: string;
  description: string;
  category: string;
  type: "App" | "Website";
  creator_handle: string;
  website_url: string | null;
  android_url: string | null;
  ios_url: string | null;
  logo_key: string | null;
  contact_email: string;
}

/** The shape of src/data/products.ts entries, so the site can show approved submissions as-is. */
export function rowToProduct(row: SubmissionRow) {
  const handle = row.creator_handle.replace(/^@/, "");
  return {
    id: `s-${row.id}`,
    name: row.name,
    slug: `s-${row.id}`,
    description: row.description,
    category: row.category,
    type: row.type,
    creatorName: `@${handle}`,
    creatorThreads: `https://www.threads.com/@${handle}`,
    websiteUrl: row.website_url ?? "",
    androidUrl: row.android_url ?? "",
    iosUrl: row.ios_url ?? "",
    logo: row.logo_key ? `/api/logo/${row.id}` : "",
    featured: false,
  };
}

export const param = (ctx: Ctx, key: string) => {
  const v = ctx.params[key];
  return Array.isArray(v) ? v[0] : v ?? "";
};

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
