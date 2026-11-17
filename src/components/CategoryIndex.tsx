"use client";

import { useProducts } from "@/lib/products-context";
import { Scribble } from "./Scribble";

interface Props {
  selectedCategory: string;
  onPick: (category: string) => void;
}

export function CategoryIndex({ selectedCategory, onPick }: Props) {
  const products = useProducts();
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <section className="section cats" aria-labelledby="cats-title">
      <div className="container">
        <div className="section__head">
          <h2 id="cats-title" className="section__title">What people are building</h2>
          <p className="hand section__note">tap one to filter the list below</p>
        </div>
        <ul className="cats__list">
          {rows.map(([name, count]) => (
            <li key={name}>
              <button
                type="button"
                className="cat"
                aria-pressed={selectedCategory === name}
                onClick={() => onPick(name)}
              >
                <span className="cat__name">{name}</span>
                <sup className="cat__count">{count}</sup>
                <Scribble kind="circle" className="cat__ring" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
