"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FilterSidebarProps {
  categories: Array<{ name: string; slug: string }>;
  brandsFacet: Array<{ _id: string; count: number }>;
  priceBounds: { min: number; max: number };
  selectedCategory: string;
  selectedBrands: string[];
  minPrice: number;
  maxPrice: number;
  selectedRating: number | null;
  onCategoryChange: (slug: string) => void;
  onBrandToggle: (brand: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onRatingChange: (rating: number | null) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  categories,
  brandsFacet,
  priceBounds,
  selectedCategory,
  selectedBrands,
  minPrice,
  maxPrice,
  selectedRating,
  onCategoryChange,
  onBrandToggle,
  onPriceChange,
  onRatingChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="w-64 bg-white rounded-2xl border border-gray-200 p-5 space-y-6 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              selectedCategory === ""
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => onCategoryChange(c.slug)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                selectedCategory === c.slug
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Checkboxes with Live Counts */}
      {brandsFacet.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brands</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {brandsFacet.map((b) => (
              <label
                key={b._id}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b._id)}
                    onChange={() => onBrandToggle(b._id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{b._id}</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {b.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice || ""}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0, maxPrice)}
            placeholder="Min"
            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            value={maxPrice || ""}
            onChange={(e) => onPriceChange(minPrice, Number(e.target.value) || 0)}
            placeholder="Max"
            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Rating Filter (Amazon 4★ & above style) */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => onRatingChange(selectedRating === stars ? null : stars)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                selectedRating === stars
                  ? "bg-amber-50 text-amber-900 font-bold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{stars}★ & above</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
