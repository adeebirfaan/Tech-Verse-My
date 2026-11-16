"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { products, type Product, type ProductType } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { Scribble } from "./Scribble";

const MAX_LOGO_BYTES = 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

type Fields = {
  name: string;
  description: string;
  category: string;
  type: ProductType;
  threads: string;
  website: string;
  android: string;
  ios: string;
  email: string;
};
type Errors = Partial<Record<keyof Fields | "logo" | "confirm", string>>;
type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; name: string } | { state: "failed"; message: string };

const EMPTY: Fields = { name: "", description: "", category: "", type: "App", threads: "", website: "", android: "", ios: "", email: "" };

const isHttps = (v: string) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

function validate(f: Fields, logo: File | null, confirmed: boolean): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Give the product's name.";
  if (!f.description.trim()) e.description = "Describe what it does in a sentence or two.";
  if (!f.category.trim()) e.category = "Pick or type a category.";
  if (!/^@?[A-Za-z0-9._]{1,30}$/.test(f.threads.trim().replace(/^https?:\/\/(www\.)?threads\.(com|net)\//, "")))
    e.threads = "Write your Threads handle as @name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Write your email as name@example.com.";
  for (const k of ["website", "android", "ios"] as const) {
    if (f[k].trim() && !isHttps(f[k].trim())) e[k] = "Use a full link that starts with https://.";
  }
  if (!e.website && !e.android && !e.ios && !f.website.trim() && !f.android.trim() && !f.ios.trim())
    e.website = "Add at least one link: a website, Google Play or the App Store.";
  if (logo && logo.size > MAX_LOGO_BYTES) e.logo = "The logo must be 1 MB or smaller.";
  if (logo && !LOGO_TYPES.includes(logo.type)) e.logo = "Upload the logo as a PNG, JPG or WebP image.";
  if (!confirmed) e.confirm = "Tick this to confirm you can list the product.";
  return e;
}

export function SubmitForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [logo, setLogo] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), []);

  // A local preview URL for the chosen logo, released when the file changes.
  const logoUrl = useMemo(() => (logo ? URL.createObjectURL(logo) : ""), [logo]);
  useEffect(() => () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }, [logoUrl]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handle = fields.threads.trim().replace(/^https?:\/\/(www\.)?threads\.(com|net)\//, "").replace(/^@/, "");
  const preview: Product = {
    id: "preview",
    slug: "preview",
    name: fields.name.trim() || "Your product",
    description: fields.description.trim() || "A sentence or two on what it does and who it's for.",
    category: fields.category.trim() || "Category",
    type: fields.type,
    creatorName: handle ? `@${handle}` : "@yourname",
    creatorThreads: handle ? `https://www.threads.com/@${handle}` : "",
    websiteUrl: fields.website.trim(),
    androidUrl: fields.android.trim(),
    iosUrl: fields.ios.trim(),
    logo: logoUrl,
    featured: false,
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields, logo, confirmed);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }

    setStatus({ state: "sending" });
    const body = new FormData(e.currentTarget);
    if (!logo) body.delete("logo");
    try {
      const res = await fetch("/api/submit", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: Errors } | null;
      if (res.ok && data?.ok) {
        setStatus({ state: "sent", name: fields.name.trim() });
        window.scrollTo({ top: 0 });
        return;
      }
      if (data?.fields) {
        setErrors(data.fields);
        const firstServer = Object.keys(data.fields)[0];
        formRef.current?.querySelector<HTMLElement>(`[data-field="${firstServer}"]`)?.focus();
      }
      setStatus({ state: "failed", message: data?.error ?? "That didn't go through. Try again in a minute." });
    } catch {
      setStatus({ state: "failed", message: "That didn't go through. Check your connection and try again." });
    }
  }

  if (status.state === "sent") {
    return (
      <section className="section submit-done" aria-labelledby="done-title">
        <div className="container submit-done__inner">
          <p className="hand submit-done__hand">got it!</p>
          <h1 id="done-title" className="submit__title">{status.name} is in the queue</h1>
          <p className="submit__lede">
            Every submission is checked before it goes into the directory. If something needs fixing, you&apos;ll hear back at the email you gave.
          </p>
          <div className="submit-done__actions">
            <Link href="/#explore" className="btn">Back to the directory</Link>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                setFields(EMPTY);
                setLogo(null);
                setConfirmed(false);
                setStatus({ state: "idle" });
              }}
            >
              Submit another
            </button>
          </div>
        </div>
      </section>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p className="form-row__error" id={`${k}-error`}>{errors[k]}</p>
    ) : null;
  const describe = (k: keyof Errors, help?: boolean) =>
    [help ? `${k}-help` : "", errors[k] ? `${k}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <section className="section submit" aria-labelledby="submit-title">
      <div className="container submit__grid">
        <div className="submit__side">
          <h1 id="submit-title" className="submit__title">Add your build to the list</h1>
          <p className="submit__lede">
            Made an app or website in Malaysia? Tell us about it. Every submission is checked before it goes into the directory.
          </p>
          <div className="submit__preview" aria-label="Preview of your listing">
            <p className="hand submit__preview-note">
              your card will look like this
              <Scribble kind="arrow" className="submit__preview-arrow" />
            </p>
            <div inert>
              <ProductCard product={preview} />
            </div>
          </div>
        </div>

        <form ref={formRef} className="submit__form" onSubmit={onSubmit} noValidate aria-describedby="form-status">
          <div className="form-row">
            <label htmlFor="name">Product name</label>
            <input id="name" name="name" data-field="name" type="text" maxLength={80} autoComplete="off" required
              value={fields.name} onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name} aria-describedby={describe("name")} />
            {err("name")}
          </div>

          <div className="form-row">
            <label htmlFor="description">What it does</label>
            <textarea id="description" name="description" data-field="description" rows={4} maxLength={300} required
              value={fields.description} onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description} aria-describedby={describe("description", true)} />
            <p className="form-row__help" id="description-help">
              One or two sentences, up to 300 characters. {300 - fields.description.length} left.
            </p>
            {err("description")}
          </div>

          <div className="form-row form-row--split">
            <div>
              <label htmlFor="category">Category</label>
              <input id="category" name="category" data-field="category" type="text" list="category-list" maxLength={40} required
                value={fields.category} onChange={(e) => set("category", e.target.value)}
                aria-invalid={!!errors.category} aria-describedby={describe("category", true)} />
              <datalist id="category-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
              <p className="form-row__help" id="category-help">Pick one or type your own.</p>
              {err("category")}
            </div>
            <fieldset className="form-seg">
              <legend>It&apos;s a</legend>
              <div className="seg">
                {(["App", "Website"] as const).map((t) => (
                  <span key={t} className="form-seg__opt">
                    <input type="radio" id={`type-${t}`} name="type" value={t} checked={fields.type === t}
                      onChange={() => set("type", t)} data-field={t === "App" ? "type" : undefined} />
                    <label htmlFor={`type-${t}`} className="seg__btn">{t}</label>
                  </span>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="form-group">
            <legend>Where people can get it</legend>
            <p className="form-row__help">At least one link.</p>
            <div className="form-row">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" data-field="website" type="url" inputMode="url" placeholder="https://"
                value={fields.website} onChange={(e) => set("website", e.target.value)}
                aria-invalid={!!errors.website} aria-describedby={describe("website")} />
              {err("website")}
            </div>
            <div className="form-row">
              <label htmlFor="android">Google Play</label>
              <input id="android" name="android" data-field="android" type="url" inputMode="url" placeholder="https://play.google.com/store/apps/details?id=…"
                value={fields.android} onChange={(e) => set("android", e.target.value)}
                aria-invalid={!!errors.android} aria-describedby={describe("android")} />
              {err("android")}
            </div>
            <div className="form-row">
              <label htmlFor="ios">App Store</label>
              <input id="ios" name="ios" data-field="ios" type="url" inputMode="url" placeholder="https://apps.apple.com/my/app/…"
                value={fields.ios} onChange={(e) => set("ios", e.target.value)}
                aria-invalid={!!errors.ios} aria-describedby={describe("ios")} />
              {err("ios")}
            </div>
          </fieldset>

          <div className="form-row">
            <label htmlFor="logo">Logo</label>
            <input id="logo" name="logo" data-field="logo" type="file" accept="image/png,image/jpeg,image/webp" className="file"
              onChange={(e) => {
                setLogo(e.target.files?.[0] ?? null);
                setErrors((x) => ({ ...x, logo: undefined }));
              }}
              aria-invalid={!!errors.logo} aria-describedby={describe("logo", true)} />
            <p className="form-row__help" id="logo-help">Square PNG, JPG or WebP, up to 1 MB. Optional, but listings with a logo stand out.</p>
            {err("logo")}
          </div>

          <div className="form-row form-row--split">
            <div>
              <label htmlFor="threads">Your Threads handle</label>
              <input id="threads" name="threads" data-field="threads" type="text" placeholder="@yourname" autoComplete="off" autoCapitalize="none" spellCheck={false} required
                value={fields.threads} onChange={(e) => set("threads", e.target.value)}
                aria-invalid={!!errors.threads} aria-describedby={describe("threads", true)} />
              <p className="form-row__help" id="threads-help">Shown on your card so people can find you.</p>
              {err("threads")}
            </div>
            <div>
              <label htmlFor="email">Contact email</label>
              <input id="email" name="email" data-field="email" type="email" autoComplete="email" required
                value={fields.email} onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email} aria-describedby={describe("email", true)} />
              <p className="form-row__help" id="email-help">Only used to reach you about this listing. Never shown.</p>
              {err("email")}
            </div>
          </div>

          <div className="hp" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form-row">
            <label className="check">
              <input type="checkbox" name="confirm" data-field="confirm" checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                  setErrors((x) => ({ ...x, confirm: undefined }));
                }}
                aria-invalid={!!errors.confirm} aria-describedby={describe("confirm")} />
              <span>I built this, or I&apos;m submitting it with the maker&apos;s OK.</span>
            </label>
            {err("confirm")}
          </div>

          <div className="submit__actions">
            <button type="submit" className="btn" aria-busy={status.state === "sending"} disabled={status.state === "sending"}>
              {status.state === "sending" ? "Sending…" : "Send for review"}
            </button>
            <p id="form-status" className="form-status" role="status" aria-live="polite">
              {status.state === "failed" ? status.message : ""}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
