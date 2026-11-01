"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageSearch, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard, { ProductData } from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";

const CATEGORIES_LIST = [
  { name: "Laptops", slug: "laptops" },
  { name: "Audio & Headphones", slug: "audio-headphones" },
  { name: "Footwear", slug: "footwear" },
];

export default function StorefrontPage() {
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // TanStack Query: Live Fetching from our API
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "products",
      searchQuery,
      selectedCategory,
      selectedBrands,
      minPrice,
      maxPrice,
      selectedRating,
      sortBy,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice > 0) params.set("maxPrice", maxPrice.toString());
      if (selectedRating) params.set("rating", selectedRating.toString());
      if (sortBy) params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(0);
    setSelectedRating(null);
    setSortBy("newest");
    setPage(1);
  };

  const products: ProductData[] = data?.products || [];
  const brandsFacet = data?.facets?.brands || [];
  const priceBounds = data?.facets?.priceBounds || { min: 0, max: 0 };
  const totalProducts = data?.pagination?.total || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 1. Global Navbar */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* 2. Slide-over Cart Drawer */}
      <CartDrawer />

      {/* 3. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex gap-8 items-start">
          {/* Desktop Left Filter Sidebar */}
          <FilterSidebar
            categories={CATEGORIES_LIST}
            brandsFacet={brandsFacet}
            priceBounds={priceBounds}
            selectedCategory={selectedCategory}
            selectedBrands={selectedBrands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedRating={selectedRating}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            onBrandToggle={handleBrandToggle}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
              setPage(1);
            }}
            onRatingChange={(rating) => {
              setSelectedRating(rating);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar: Result Count & Sort Options */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {selectedCategory
                    ? CATEGORIES_LIST.find((c) => c.slug === selectedCategory)?.name || "Products"
                    : "All Featured Products"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing <span className="font-bold text-gray-900">{products.length}</span> of{" "}
                  <span className="font-bold text-gray-900">{totalProducts}</span> items
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-600 text-gray-800"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid / Loading / Empty States */}
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Loading products from catalog...</p>
              </div>
            ) : isError ? (
              <div className="h-96 flex flex-col items-center justify-center text-red-500 gap-2">
                <p className="text-base font-bold">Failed to load products.</p>
                <p className="text-xs text-gray-500">Make sure your MongoDB container is running.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                <PackageSearch className="w-16 h-16 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No products found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  We couldn't find any products matching your active filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
