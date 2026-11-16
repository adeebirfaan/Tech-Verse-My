"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { Download, Globe, MessageCircle, ChevronDown, ChevronUp, Smartphone } from "lucide-react";
import { logoSrc, initials } from "@/lib/logo";

export function ProductCard({ product }: { product: Product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const src = logoSrc(product);
  const long = Boolean(product.description) && product.description.length > 90;
  const short = long ? product.description.slice(0, 90).replace(/\s+\S*$/, "") + "…" : product.description;

  return (
    <article className="card">
      <header className="card__head">
        <div className="card__logo">
          {src && !logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" width={52} height={52} loading="lazy" onError={() => setLogoFailed(true)} />
          ) : (
            <span aria-hidden="true">{initials(product.name)}</span>
          )}
        </div>
        <div className="card__title">
          <h3 className="card__name" title={product.name}>{product.name}</h3>
          <div className="card__tags">
            <span className="tag">{product.category}</span>
            <span className="tag tag--type">
              {product.type === "App" ? <Smartphone size={13} aria-hidden="true" /> : <Globe size={13} aria-hidden="true" />}
              {product.type}
            </span>
          </div>
        </div>
      </header>

      <div className="card__body">
        <p className="card__desc">{isExpanded ? product.description : short}</p>
        {long && (
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="card__more" aria-expanded={isExpanded}>
            {isExpanded ? "Show less" : "Read more"}
            {isExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
          </button>
        )}
      </div>

      <footer className="card__foot">
        <div className="card__by">
          <span>
            By <strong>{product.creatorName}</strong>
          </span>
          {product.creatorThreads && (
            <a
              href={product.creatorThreads}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn icon-btn--sm"
              title="Visit the creator’s Threads for more info"
              aria-label={`${product.creatorName} on Threads`}
            >
              <MessageCircle size={16} aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="card__actions">
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
      </footer>
    </article>
  );
}
