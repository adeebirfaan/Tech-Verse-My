"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ProductCard } from "@/components/ProductCard";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { AnimatePresence, motion } from "framer-motion";

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

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        
        <section id="explore" className="py-20 bg-background relative min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Directory</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the best local applications and websites created by talented Malaysians.
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

            <div className="mt-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20 glass-panel rounded-3xl"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">
                      We couldn't find any items matching your current filters.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setSelectedType("All");
                      }}
                      className="px-6 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
