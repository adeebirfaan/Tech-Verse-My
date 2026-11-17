"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products as builtIn, type Product } from "@/data/products";

const ProductsContext = createContext<Product[]>(builtIn);

/**
 * The listings in src/data/products.ts, plus submissions approved in /admin.
 * The page renders with the built-in list first, then adds approved ones from /api/listings.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Product[]>(builtIn);

  useEffect(() => {
    let alive = true;
    fetch("/api/listings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { products?: Product[] } | null) => {
        if (alive && data?.products?.length) setList([...builtIn, ...data.products]);
      })
      .catch(() => {
        // No function behind next dev, or offline: keep the built-in list.
      });
    return () => {
      alive = false;
    };
  }, []);

  return <ProductsContext.Provider value={list}>{children}</ProductsContext.Provider>;
}

export const useProducts = () => useContext(ProductsContext);
