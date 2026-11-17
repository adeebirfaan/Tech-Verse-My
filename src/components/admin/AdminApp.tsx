"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { products as builtIn, type Product } from "@/data/products";
import { ProductCard } from "../ProductCard";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";

type Status = "pending" | "approved" | "rejected";

interface Submission {
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
  logo_url: string | null;
  contact_email: string;
}

interface Edits {
  name: string;
  description: string;
  category: string;
  type: string;
  threads: string;
  website: string;
  android: string;
  ios: string;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; fields?: Record<string, string> };

async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { "content-type": "application/json", "x-techverse-admin": "1", ...(init.headers || {}) },
    });
    const body = await res.json().catch(() => null);
    if (res.ok && body?.ok) return { ok: true, data: body as T };
    return { ok: false, status: res.status, error: body?.error ?? "Something went wrong. Try again.", fields: body?.fields };
  } catch {
    return { ok: false, status: 0, error: "Couldn't reach the server. Check your connection." };
  }
}

const fetchSubmissions = () => api<{ submissions: Submission[] }>("/api/admin/submissions");

const TABS: { key: Status; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const toEdits = (s: Submission): Edits => ({
  name: s.name,
  description: s.description,
  category: s.category,
  type: s.type,
  threads: s.creator_handle,
  website: s.website_url ?? "",
  android: s.android_url ?? "",
  ios: s.ios_url ?? "",
});

const formatDate = (iso: string) => {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? iso : d.toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export function AdminApp() {
  const [phase, setPhase] = useState<"loading" | "signin" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Submission[]>([]);
  const [tab, setTab] = useState<Status>("pending");
  const [flash, setFlash] = useState("");

  const apply = useCallback((r: ApiResult<{ submissions: Submission[] }>) => {
    if (r.ok) {
      setItems(r.data.submissions);
      setPhase("ready");
    } else if (r.status === 401) {
      setPhase("signin");
    } else {
      setMessage(r.error);
      setPhase("unavailable");
    }
  }, []);
  const load = useCallback(() => fetchSubmissions().then(apply), [apply]);

  useEffect(() => {
    let alive = true;
    fetchSubmissions().then((r) => {
      if (alive) apply(r);
    });
    return () => {
      alive = false;
    };
  }, [apply]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const s of items) c[s.status]++;
    return c;
  }, [items]);
  const shown = items.filter((s) => s.status === tab);
  const categories = useMemo(
    () => Array.from(new Set([...builtIn.map((p) => p.category), ...items.map((s) => s.category)])).sort(),
    [items],
  );

  const replace = (s: Submission, message: string) => {
    setItems((list) => list.map((x) => (x.id === s.id ? s : x)));
    setFlash(message);
  };
  const remove = (id: string, message: string) => {
    setItems((list) => list.filter((x) => x.id !== id));
    setFlash(message);
  };

  async function signOut() {
    await api("/api/admin/login", { method: "DELETE" });
    setItems([]);
    setPhase("signin");
  }

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="container admin__bar-inner">
          <Link href="/" className="wordmark" aria-label="Techverse MY, home">
            <Logo />
          </Link>
          <span className="admin__badge">Admin</span>
          <div className="admin__bar-actions">
            <ThemeToggle />
            {phase === "ready" && (
              <button type="button" className="btn btn--quiet admin__signout" onClick={signOut}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="container admin__main">
        {phase === "loading" && <p className="admin__note" role="status">Loading submissions…</p>}

        {phase === "unavailable" && (
          <div className="admin__panel">
            <h1 className="admin__title">Admin isn&apos;t available</h1>
            <p className="admin__note">{message}</p>
            <p className="admin__note">Setup steps are in SUBMISSIONS.md.</p>
          </div>
        )}

        {phase === "signin" && <SignIn onDone={() => void load()} />}

        {phase === "ready" && (
          <>
            <div className="admin__head">
              <h1 className="admin__title">Submissions</h1>
              <div className="seg" role="tablist" aria-label="Status">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    className="seg__btn"
                    onClick={() => {
                      setTab(t.key);
                      setFlash("");
                    }}
                  >
                    {t.label} <span className="admin__count">{counts[t.key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="admin__flash" role="status" aria-live="polite">{flash}</p>

            {shown.length === 0 ? (
              <div className="admin__panel admin__empty">
                <p className="admin__note">
                  {tab === "pending" ? "Nothing waiting for review. New submissions show up here." : `No ${tab} submissions.`}
                </p>
              </div>
            ) : (
              <ul className="admin__list">
                {shown.map((s) => (
                  <li key={s.id}>
                    <Review submission={s} categories={categories} onChange={replace} onDelete={remove} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter the admin password.");
      return;
    }
    setBusy(true);
    setError("");
    const r = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    setBusy(false);
    if (r.ok) {
      setPassword("");
      onDone();
    } else {
      setError(r.error);
    }
  }

  return (
    <form className="admin__panel admin__signin" onSubmit={submit} noValidate>
      <h1 className="admin__title">Sign in</h1>
      <div className="form-row">
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "admin-password-error" : undefined}
        />
        {error && <p className="form-row__error" id="admin-password-error" role="alert">{error}</p>}
      </div>
      <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function Review({
  submission: s,
  categories,
  onChange,
  onDelete,
}: {
  submission: Submission;
  categories: string[];
  onChange: (s: Submission, message: string) => void;
  onDelete: (id: string, message: string) => void;
}) {
  const [edits, setEdits] = useState<Edits>(() => toEdits(s));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const original = toEdits(s);
  const dirty = (Object.keys(edits) as (keyof Edits)[]).some((k) => edits[k].trim() !== original[k].trim());

  const set = (k: keyof Edits, v: string) => {
    setEdits((e) => ({ ...e, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };

  const handle = edits.threads.trim().replace(/^@/, "");
  const preview: Product = {
    id: s.id,
    slug: s.id,
    name: edits.name || "Untitled",
    description: edits.description,
    category: edits.category || "Category",
    type: edits.type === "Website" ? "Website" : "App",
    creatorName: handle ? `@${handle}` : "@",
    creatorThreads: handle ? `https://www.threads.com/@${handle}` : "",
    websiteUrl: edits.website,
    androidUrl: edits.android,
    iosUrl: edits.ios,
    logo: s.logo_url ?? "",
    featured: false,
  };

  async function act(action?: "approve" | "reject" | "pending") {
    setBusy(true);
    setNote("");
    const body: Record<string, unknown> = {};
    if (action) body.action = action;
    if (dirty || action === "approve") body.edits = edits;
    const r = await api<{ submission: Submission }>(`/api/admin/submissions/${s.id}`, { method: "PATCH", body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) {
      const name = r.data.submission.name;
      const message =
        action === "approve" ? `Approved ${name}. It's live in the directory now.` :
        action === "reject" ? `Rejected ${name}.` :
        action === "pending" ? `Took ${name} off the site and moved it back to Pending.` :
        `Saved changes to ${name}.`;
      setErrors({});
      setEdits(toEdits(r.data.submission));
      setNote(action ? "" : message);
      onChange(r.data.submission, message);
    } else {
      if (r.fields) setErrors(r.fields);
      setNote(r.error);
    }
  }

  async function del() {
    setBusy(true);
    const r = await api(`/api/admin/submissions/${s.id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) onDelete(s.id, `Deleted ${s.name}.`);
    else setNote(r.error);
  }

  const field = (k: keyof Edits, label: string, props: Record<string, unknown> = {}) => (
    <div className="form-row">
      <label htmlFor={`${s.id}-${k}`}>{label}</label>
      <input
        id={`${s.id}-${k}`}
        type="text"
        value={edits[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${s.id}-${k}-error` : undefined}
        {...props}
      />
      {errors[k] && <p className="form-row__error" id={`${s.id}-${k}-error`}>{errors[k]}</p>}
    </div>
  );

  return (
    <article className="review" aria-labelledby={`${s.id}-title`}>
      <div className="review__fields">
        <header className="review__head">
          <h2 id={`${s.id}-title`} className="review__title">{s.name}</h2>
          <p className="review__meta">
            Submitted {formatDate(s.created_at)} by{" "}
            <a className="text-link" href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
          </p>
        </header>

        <div className="submit__form review__form">
          {field("name", "Name", { maxLength: 80 })}
          <div className="form-row">
            <label htmlFor={`${s.id}-description`}>What it does</label>
            <textarea
              id={`${s.id}-description`}
              rows={3}
              maxLength={300}
              value={edits.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="form-row__error">{errors.description}</p>}
          </div>
          <div className="form-row form-row--split">
            <div>{field("category", "Category", { list: `${s.id}-cats`, maxLength: 40 })}</div>
            <fieldset className="form-seg">
              <legend>Type</legend>
              <div className="seg">
                {(["App", "Website"] as const).map((t) => (
                  <span key={t} className="form-seg__opt">
                    <input type="radio" id={`${s.id}-type-${t}`} name={`${s.id}-type`} value={t} checked={edits.type === t} onChange={() => set("type", t)} />
                    <label htmlFor={`${s.id}-type-${t}`} className="seg__btn">{t}</label>
                  </span>
                ))}
              </div>
            </fieldset>
            <datalist id={`${s.id}-cats`}>
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          {field("threads", "Threads handle", { autoCapitalize: "none", spellCheck: false })}
          {field("website", "Website", { inputMode: "url" })}
          {field("android", "Google Play", { inputMode: "url" })}
          {field("ios", "App Store", { inputMode: "url" })}
        </div>
      </div>

      <div className="review__side">
        <p className="review__label">On the site</p>
        <div inert>
          <ProductCard key={s.logo_url ?? "nologo"} product={preview} />
        </div>

        <div className="review__actions">
          {s.status !== "approved" && (
            <button type="button" className="btn" disabled={busy} onClick={() => act("approve")}>
              {dirty ? "Save and approve" : "Approve"}
            </button>
          )}
          {s.status === "approved" && dirty && (
            <button type="button" className="btn" disabled={busy} onClick={() => act()}>
              Save changes
            </button>
          )}
          {s.status === "pending" && (
            <button type="button" className="btn btn--quiet" disabled={busy} onClick={() => act("reject")}>
              Reject
            </button>
          )}
          {s.status === "approved" && (
            <button type="button" className="btn btn--quiet" disabled={busy} onClick={() => act("pending")}>
              Take off the site
            </button>
          )}
          {s.status !== "approved" && dirty && (
            <button type="button" className="btn btn--quiet" disabled={busy} onClick={() => act()}>
              Save without approving
            </button>
          )}
          {!confirmDelete ? (
            <button type="button" className="btn btn--quiet review__delete" disabled={busy} onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          ) : (
            <span className="review__confirm">
              <button type="button" className="btn btn--danger" disabled={busy} onClick={del}>
                Delete for good
              </button>
              <button type="button" className="btn btn--quiet" disabled={busy} onClick={() => setConfirmDelete(false)}>
                Keep
              </button>
            </span>
          )}
        </div>
        <p className="review__note" role="status" aria-live="polite">{note}</p>
      </div>
    </article>
  );
}
