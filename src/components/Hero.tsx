"use client";

import { useRef } from "react";
import Link from "next/link";
import { products } from "@/data/products";
import { logoSrc, primaryUrl } from "@/lib/logo";
import { useTilt } from "@/lib/useTilt";
import { Scribble } from "./Scribble";

const SUBMIT_URL = "/submit";

// Depth per tile, in steps of 8px, so the board reads as a raised surface, not a flat sheet.
const DEPTH = [1, 2, 0, 1, 0, 2, 1, 2, 2, 0, 2, 1, 1, 2, 0];

export function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  useTilt(stage, board, 7);

  // 15 tiles plus the "yours next?" tile fill the 4 x 4 board.
  const withLogos = products.filter((p) => p.logo).slice(0, 15);
  const kerisik = products.find((p) => p.slug === "kerisik-app");

  return (
    <section id="home" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title">Apps and websites made in Malaysia</h1>
          <p className="hero__lede">
            {products.length} local builds, each listed with the person who made it.
          </p>
          <div className="hero__actions">
            <a href="#explore" className="btn">Explore local products</a>
            <Link href={SUBMIT_URL} className="btn btn--quiet">
              Submit your product
            </Link>
          </div>
        </div>

        <div className="hero__stage" ref={stage}>
          <p className="hand hero__note">
            every tile opens<br />the real app
            <Scribble kind="arrow" className="hero__note-arrow" />
          </p>

          <div className="board" ref={board}>
            <ul className="board__grid" aria-label="Products in the directory">
              {withLogos.map((p, i) => (
                <li key={p.id} className="tile" style={{ ["--z" as string]: DEPTH[i % DEPTH.length] }}>
                  <a
                    href={primaryUrl(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="tile__face"
                    aria-label={`${p.name}, by ${p.creatorName}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc(p)} alt="" width={256} height={256} />
                  </a>
                  <span className="tile__name hand" aria-hidden="true">{p.name}</span>
                </li>
              ))}
              <li className="tile tile--yours" style={{ ["--z" as string]: 2 }}>
                <Link href={SUBMIT_URL} className="tile__face" aria-label="Submit your product">
                  <span className="tile__plus" aria-hidden="true">+</span>
                </Link>
                <span className="tile__name hand" aria-hidden="true">yours next?</span>
                <Scribble kind="circle" className="tile__ring" />
              </li>
            </ul>

            {kerisik && (
              <div className="board__card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc(kerisik)} alt="" width={40} height={40} />
                <div>
                  <p className="board__card-name">{kerisik.name}</p>
                  <p className="board__card-line">Keeps your recipes and writes the shopping list.</p>
                  <p className="board__card-by">by {kerisik.creatorName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
