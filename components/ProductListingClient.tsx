
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Star,
  ArrowUpRight,
  SlidersHorizontal,
  PackageSearch,
  X,
  ArrowRight,
} from "lucide-react";

// Product data structure from DummyJSON
export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
};

type Props = {
  products: Product[];
  initialCategory?: string;
};

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating-high";

export default function ProductListingClient({
  products,
  initialCategory = "all",
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Generate available categories from API products
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))].sort();
  }, [products]);

  // Search + Filter + Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search by name, brand or category
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.brand ?? "").toLowerCase().includes(query)
      );
    }

    // Category filtering
    if (category !== "all") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-high") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, sortBy]);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setSortBy("featured");
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">

      {/* Page Banner */}
      <section className="bg-[#f6e9da] px-5 py-16 md:py-25">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-600">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-orange-600">
              Shop
            </span>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="font-bold uppercase tracking-widest text-orange-600">
                Explore Our Collection
              </span>

              <h1 className="mt-4 text-4xl font-black text-stone-900 md:text-6xl">
                Find Something
                <br />
                <span className="text-orange-600">You'll Love.</span>
              </h1>

              <p className="mt-5 max-w-lg text-stone-600">
                Explore our collection of everyday essentials,
                trending products and exciting discoveries.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-sm">
              <p className="text-sm text-stone-500">
                Available Products
              </p>
              <p className="text-3xl font-black text-stone-900">
                {products.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-7xl px-5 py-12">

        {/* Search and Filters */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal
              size={20}
              className="text-orange-600"
            />
            <h2 className="text-lg font-bold text-stone-900">
              Find Your Products
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_200px]">

            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-xl border border-stone-200 bg-[#faf9f7] py-3 pl-12 pr-4 outline-none transition focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full cursor-pointer rounded-xl border border-stone-200 bg-[#faf9f7] px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item
                    .split("-")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    )
                    .join(" ")}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortOption)
              }
              aria-label="Sort products"
              className="w-full cursor-pointer rounded-xl border border-stone-200 bg-[#faf9f7] px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating-high">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="my-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-stone-600">
            Showing{" "}
            <span className="font-bold text-stone-900">
              {filteredProducts.length}
            </span>{" "}
            of {products.length} products
          </p>

          {(search || category !== "all" || sortBy !== "featured") && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-[#f7f4ef]">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                    {product.discountPercentage.toFixed(0)}% OFF
                  </div>
                </div>

                {/* Product Information */}
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-orange-600">
                    {product.category.replace(/-/g, " ")}
                  </p>

                  <h3 className="mt-2 line-clamp-2 min-h-12 font-bold text-stone-900 transition-colors group-hover:text-orange-600">
                    {product.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    <Star
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                    <span className="text-sm font-semibold">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xl font-black text-stone-900">
                      ${product.price.toFixed(2)}
                    </p>

                    <ArrowUpRight
                      size={20}
                      className="text-orange-600"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition-colors group-hover:bg-orange-600">
                    View Details
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-5 py-20 text-center">
            <PackageSearch
              size={55}
              className="mb-5 text-stone-400"
            />

            <h3 className="text-2xl font-bold">
              No Products Found
            </h3>

            <p className="mt-3 text-stone-500">
              Try another search or change your filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-orange-600 px-7 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
