import type { Product } from "@/data/products";

/** The 256px WebP copy in /logos/sm, made from the 2380px PNG the data points at. */
export function logoSrc(product: Product): string {
  if (!product.logo) return "";
  return product.logo.replace("/logos/", "/logos/sm/").replace(/\.png$/i, ".webp");
}

/** The first link a visitor can open: the website, then Android, then iOS. */
export function primaryUrl(product: Product): string {
  return product.websiteUrl || product.androidUrl || product.iosUrl;
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
