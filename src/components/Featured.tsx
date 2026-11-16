"use client";

import { useRef } from "react";
import { Globe, Download } from "lucide-react";
import { products, type Product } from "@/data/products";
import { logoSrc } from "@/lib/logo";
import { useTilt } from "@/lib/useTilt";

function Pick({ product }: { product: Product }) {
  const well = useRef<HTMLDivElement>(null);
  const tile = useRef<HTMLDivElement>(null);
  useTilt(well, tile, 14);

  return (
    <article className="pick">
      <div className="pick__well" ref={well}>
        <div className="pick__tile" ref={tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc(product)} alt="" width={256} height={256} loading="lazy" />
        </div>
      </div>
      <div className="pick__body">
        <h3 className="pick__name">{product.name}</h3>
        <p className="pick__meta">
          {product.category}, by{" "}
          <a href={product.creatorThreads} target="_blank" rel="noopener noreferrer" className="text-link">
            {product.creatorName}
          </a>
        </p>
        <p className="pick__desc">{product.description}</p>
        <div className="pick__links">
          {product.websiteUrl && (
            <a href={product.websiteUrl} target="_blank" rel="noreferrer" className="chip-link">
              <Globe size={16} aria-hidden="true" /> Visit
            </a>
          )}
          {product.androidUrl && (
            <a href={product.androidUrl} target="_blank" rel="noreferrer" className="chip-link">
              <Download size={16} aria-hidden="true" /> Android
            </a>
          )}
          {product.iosUrl && (
            <a href={product.iosUrl} target="_blank" rel="noreferrer" className="chip-link">
              <Download size={16} aria-hidden="true" /> iOS
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Featured() {
  const picks = products.filter((p) => p.featured);
  return (
    <section className="section picks" aria-labelledby="picks-title">
      <div className="container">
        <div className="section__head">
          <h2 id="picks-title" className="section__title">Four to start with</h2>
          <p className="hand section__note section__note--hover">move your cursor over a logo</p>
        </div>
        <div className="picks__grid">
          {picks.map((p) => (
            <Pick key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
