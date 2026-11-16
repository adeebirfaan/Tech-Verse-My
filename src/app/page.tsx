"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Featured } from "@/components/Featured";
import { CategoryIndex } from "@/components/CategoryIndex";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ProductCard } from "@/components/ProductCard";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import { Scribble } from "@/components/Scribble";
import { products } from "@/data/products";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<string | "All">("All");

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesType = selectedType === "All" || product.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType]);

  const pickCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "All" : category);
    document.getElementById("explore")?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <Featured />
        <CategoryIndex selectedCategory={selectedCategory} onPick={pickCategory} />

        <section id="explore" className="section directory" aria-labelledby="explore-title">
          <div className="container">
            <div className="section__head">
              <h2 id="explore-title" className="section__title">Search all {products.length} builds</h2>
              <p className="directory__count" role="status">
                Showing {filteredProducts.length} of {products.length}
              </p>
            </div>

            <SearchFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              categories={categories}
            />

            {filteredProducts.length > 0 ? (
              <div className="directory__grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <Scribble kind="spark" className="empty__mark" />
                <h3 className="empty__title">No products found</h3>
                <p className="empty__text">
                  We couldn&apos;t find any items matching your current filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedType("All");
                  }}
                  className="btn"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
