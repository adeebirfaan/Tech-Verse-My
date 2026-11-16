"use client";

import { Search, ChevronDown } from "lucide-react";

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
    <div className="filters">
      <label className="field field--search">
        <span className="visually-hidden">Search</span>
        <Search size={18} aria-hidden="true" className="field__icon" />
        <input
          type="search"
          name="q"
          autoComplete="off"
          placeholder="Search by name, creator, or description…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>

      <label className="field field--select">
        <span className="visually-hidden">Category</span>
        <select
          name="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown size={18} aria-hidden="true" className="field__chev" />
      </label>

      <div className="seg" role="group" aria-label="Type">
        {["All", "App", "Website"].map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={selectedType === type}
            onClick={() => setSelectedType(type)}
            className="seg__btn"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
