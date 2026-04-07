"use client";

import { Search } from "lucide-react";
import { ProductType } from "@/data/products";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedType: string | "All";
  setSelectedType: (t: string | "All") => void;
  categories: string[];
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  categories,
}: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 mb-10 z-20 relative">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, creator, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow transition-colors"
          />
        </div>

        {/* Categories Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none min-w-[180px]"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Type Toggle Chips */}
      <div className="flex flex-wrap gap-2">
        {["All", "App", "Website"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selectedType === type
                ? "bg-foreground text-background border-foreground"
                : "bg-secondary text-muted-foreground border-transparent hover:border-border hover:bg-secondary/50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
