// Field rules shared by the public submit endpoint and the admin edit endpoint.

export const LIMITS = { name: 80, description: 300, category: 40, url: 300, email: 200 };

/** "" when empty, null when not a valid https URL (or not on one of `hosts`), else the normalised URL. */
export function httpsUrl(value: string, hosts?: string[]): string | null {
  if (!value) return "";
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))) return null;
    const s = u.toString();
    return s.length > LIMITS.url ? null : s;
  } catch {
    return null;
  }
}

/** Accepts "@name", "name" or a threads.com / threads.net profile URL; returns "name". */
export function threadsHandle(value: string): string | null {
  const m = value.trim().match(/^(?:https?:\/\/(?:www\.)?threads\.(?:com|net)\/)?@?([A-Za-z0-9._]{1,30})\/?$/);
  return m ? m[1] : null;
}

export interface ListingFields {
  name: string;
  description: string;
  category: string;
  type: string;
  threads: string;
  website: string;
  android: string;
  ios: string;
}

export interface CleanListing {
  name: string;
  description: string;
  category: string;
  type: "App" | "Website";
  handle: string;
  website: string;
  android: string;
  ios: string;
}

/** Checks the listing fields; returns the cleaned values, or field errors. */
export function checkListing(f: ListingFields): { ok: true; value: CleanListing } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = f.name.trim();
  const description = f.description.trim();
  const category = f.category.trim();
  const handle = threadsHandle(f.threads);
  const website = httpsUrl(f.website.trim());
  const android = httpsUrl(f.android.trim(), ["play.google.com"]);
  const ios = httpsUrl(f.ios.trim(), ["apps.apple.com"]);

  if (!name || name.length > LIMITS.name) errors.name = `Give the product's name, up to ${LIMITS.name} characters.`;
  if (!description || description.length > LIMITS.description) errors.description = `Describe it in up to ${LIMITS.description} characters.`;
  if (!category || category.length > LIMITS.category) errors.category = "Pick or type a category.";
  if (f.type !== "App" && f.type !== "Website") errors.type = "Choose App or Website.";
  if (!handle) errors.threads = "Write the Threads handle as @name.";
  if (website === null) errors.website = "Use a full link that starts with https://.";
  if (android === null) errors.android = "Use a Google Play link (https://play.google.com/…).";
  if (ios === null) errors.ios = "Use an App Store link (https://apps.apple.com/…).";
  if (!errors.website && !errors.android && !errors.ios && !website && !android && !ios) {
    errors.website = "Add at least one link: a website, Google Play or the App Store.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, description, category, type: f.type as "App" | "Website", handle: handle!, website: website || "", android: android || "", ios: ios || "" },
  };
}
