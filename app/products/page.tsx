
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Star,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================
// FIVE SHOPPING DEPARTMENTS
// ============================================

const departments = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Mobiles, laptops, tablets and more",
    image:
      "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?auto=format&fit=crop&w=1200&q=85",
    background: "bg-orange-50",
  },
  {
    id: "audio-gaming",
    name: "Audio & Gaming",
    description: "Headphones, speakers and gaming gear",
    image:
      "https://images.unsplash.com/photo-1755436613093-10e44e9e86a4?auto=format&fit=crop&w=1200&q=85",
    background: "bg-violet-50",
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    description: "Furniture and beautiful home decor",
    image:
      "https://images.unsplash.com/photo-1759722667693-6c56f6243528?auto=format&fit=crop&w=1200&q=85",
    background: "bg-emerald-50",
  },
  {
    id: "accessories",
    name: "Watches & Accessories",
    description: "Watches, bags and jewellery",
    image:
      "https://images.unsplash.com/photo-1579172662347-112acaae38b2?auto=format&fit=crop&w=1200&q=85",
    background: "bg-blue-50",
  },
  {
    id: "appliances",
    name: "Home Appliances",
    description: "Kitchen essentials and home helpers",
    image:
      "https://images.unsplash.com/photo-1585821570368-53a593a002be?auto=format&fit=crop&w=1200&q=85",
    background: "bg-amber-50",
  },
];

// ============================================
// PRODUCT TYPE
// ============================================

type Product = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  brand?: string;
  rating: number;
  stock: number;
};

// ============================================
// FETCH ALL PRODUCTS
// ============================================

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      "https://dummyjson.com/products?limit=0",
      {
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: { products: Product[] } =
      await response.json();

    return data.products;
  } catch (error) {
    console.error("Product fetch error:", error);
    return [];
  }
}

// DummyJSON product prices are in USD.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

// ============================================
// PRODUCTS PAGE
// ============================================

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">

        {/* BREADCRUMB */}

        <div className="border-b border-stone-100">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-5 text-sm text-stone-500">

            <Link
              href="/"
              className="hover:text-orange-600"
            >
              Home
            </Link>

            <ChevronRight size={16} />

            <span className="font-semibold text-stone-900">
              All Products
            </span>
          </div>
        </div>

        {/* HERO SECTION */}

        <section className="bg-[#f7eee4]">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center md:py-20">

            <span className="inline-block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-700">
              BUY NEST COLLECTIONS
            </span>

            <h1 className="mt-6 text-4xl font-black text-stone-900 md:text-6xl">
              Explore Our{" "}
              <span className="text-orange-600">
                Collection.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
              Discover amazing products across our
              shopping departments.
            </p>

            <Link
              href="#all-products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-600 px-7 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Explore All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* FIVE CATEGORY CARDS */}

<section className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-5">
            <p className="font-semibold text-orange-600">
              EXPLORE BUY NEST
            </p>

            <h2 className="mt-2 text-3xl font-bold text-stone-900">
              Shop by Category
            </h2>

            <p className="mt-3 text-stone-500">
              Select a department to explore
              its products.
            </p>
          </div>

<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {departments.map((department) => (
              <Link
                key={department.id}
                href={`/category/${department.id}`}
                className="group overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div
className={`relative h-32 overflow-hidden ${department.background}`}                >
                  <Image
                    src={department.image}
                    alt={`${department.name} category`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-base font-bold text-stone-900">
  {department.name}
</h3>

<p className="mt-1 min-h-8 line-clamp-2 text-xs text-stone-500">
  {department.description}
</p>

<div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
  <span className="text-xs font-semibold text-orange-700">
    Explore Products
  </span>

  <ArrowRight
    size={16}
    className="text-orange-600 transition group-hover:translate-x-1"
  />
</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================
            ALL PRODUCTS SECTION - NEW
        ===================================== */}

        <section
          id="all-products"
          className="scroll-mt-20 bg-stone-50 py-16"
        >
          <div className="mx-auto max-w-7xl px-5">

            {/* SECTION HEADING */}

            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

              <div>
                <p className="font-semibold text-orange-600">
                  DISCOVER BUY NEST
                </p>

                <h2 className="mt-2 text-3xl font-bold text-stone-900">
                  All Products
                </h2>

                <p className="mt-3 text-stone-500">
                  Explore our complete product collection.
                </p>
              </div>

              <p className="text-sm font-medium text-stone-500">
                {products.length} Products
              </p>
            </div>

            {/* PRODUCT GRID */}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="relative h-60 overflow-hidden bg-white p-4">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        {product.category.replaceAll("-", " ")}
                      </p>

                      <h3 className="mt-2 min-h-12 line-clamp-2 text-base font-bold text-stone-900 group-hover:text-orange-600">
                        {product.title}
                      </h3>

                      {/* RATING */}

                      <div className="mt-3 flex items-center gap-1">
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-sm font-semibold text-stone-700">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* PRICE */}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-black text-stone-900">
                          {formatPrice(product.price)}
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            product.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>

                      {/* VIEW DETAILS */}

                      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                        <span className="text-sm font-semibold text-orange-600">
                          View Details
                        </span>

                        <ArrowRight
                          size={18}
                          className="text-orange-600 transition-transform group-hover:translate-x-1"
                        />
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold text-stone-900">
                  Products are temporarily unavailable
                </h3>

                <p className="mt-3 text-stone-500">
                  Please refresh the page or try again later.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM BANNER */}

        <section className="px-5 py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 rounded-3xl bg-[#faf9f7] px-8 py-12 text-center">

            <ShoppingBag
              size={38}
              className="text-orange-600"
            />

            <h2 className="text-3xl font-black text-stone-900">
              Find your next favorite.
            </h2>

            <p className="max-w-xl text-stone-500">
              Browse our products and discover
              something perfect for your everyday needs.
            </p>

            <Link
              href="#all-products"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Browse All Products

              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
