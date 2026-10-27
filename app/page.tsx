
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  ShoppingBag,
  Package,
  ChevronRight,
  Star,
  Truck,
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
    description: "Smart technology & everyday gadgets",
    image:
      "https://images.unsplash.com/photo-1636115305669-9096bffe87fd?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "audio-gaming",
    name: "Audio & Gaming",
    description: "Sound, entertainment & gaming",
    image:
      "https://images.unsplash.com/photo-1755436613093-10e44e9e86a4?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    description: "Comfortable and stylish living",
    image:
      "https://images.unsplash.com/photo-1759722667693-6c56f6243528?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "accessories",
    name: "Watches & Accessories",
    description: "Everyday style essentials",
    image:
      "https://images.unsplash.com/photo-1579172662347-112acaae38b2?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "appliances",
    name: "Home Appliances",
    description: "Make everyday living easier",
    image:
      "https://images.unsplash.com/photo-1585821570368-53a593a002be?auto=format&fit=crop&w=900&q=85",
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
  rating: number;
  stock: number;
};

// ============================================
// FETCH FEATURED PRODUCTS
// ============================================

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      "https://dummyjson.com/products?limit=0",
      {
        next: {
          revalidate: 1800,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const data: { products: Product[] } =
      await response.json();

    const products = data.products ?? [];

    // Select different categories for variety.
    const featuredCategories = [
      "smartphones",
      "laptops",
      "mens-watches",
      "furniture",
      "home-decoration",
      "mobile-accessories",
      "kitchen-accessories",
      "womens-bags",
    ];

    const selected = featuredCategories
      .map((category) =>
        products.find(
          (product) => product.category === category
        )
      )
      .filter(
        (product): product is Product =>
          Boolean(product)
      );

    const selectedIds = new Set(
      selected.map((product) => product.id)
    );

    return [
      ...selected,
      ...products.filter(
        (product) => !selectedIds.has(product.id)
      ),
    ].slice(0, 8);
  } catch (error) {
    console.error("Product fetch error:", error);
    return [];
  }
}

// DummyJSON prices are denominated in USD.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

// ============================================
// BUY NEST HOME PAGE
// ============================================

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Header />

      <main className="bg-white">

        {/* =====================================
            HERO SECTION
            ORIGINAL FONT & COLOR STYLE
        ===================================== */}

        <section className="overflow-hidden bg-[#f7eee4]">

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">

            {/* LEFT HERO CONTENT */}

            <div>

              <span className="mb-5 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-700">
                WELCOME TO BUY NEST
              </span>

              {/* ORIGINAL HERO FONT */}

              <h1 className="text-5xl font-black leading-tight tracking-tight text-stone-900 md:text-7xl">

                Find Your
                <br />

                Next{" "}

                <span className="text-orange-600">
                  Favorite.
                </span>

              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-stone-600">
                Explore everyday essentials, smart
                technology, stylish accessories and
                exciting finds, all in one shopping
                destination.
              </p>

              {/* HERO BUTTONS */}

              <div className="mt-8 flex flex-wrap gap-4">

                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
                >
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-7 py-4 font-semibold text-stone-800 transition hover:border-orange-500"
                >
                  Shop by Category
                </Link>

              </div>

              {/* HERO FEATURES */}

              <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-stone-600">

                <span className="flex items-center gap-2">

                  <ShoppingBag
                    size={18}
                    className="text-orange-600"
                  />

                  Everyday Finds
                </span>

                <span className="flex items-center gap-2">

                  <Heart
                    size={18}
                    className="text-orange-600"
                  />

                  Save Favorites
                </span>

              </div>
            </div>

            {/* =====================================
                RIGHT HERO IMAGE
                NO SINGLE PRODUCT
            ===================================== */}

            <div className="relative h-[350px] overflow-hidden rounded-3xl shadow-xl md:h-[470px]">

              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85"
                alt="Modern shopping store with lifestyle collections"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* IMAGE OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

              <div className="absolute bottom-8 left-7 right-7 text-white md:bottom-10 md:left-10">

                <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                  DISCOVER • EXPLORE • SHOP
                </p>

                <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                  Everything you love.
                  <br />
                  All in one place.
                </h2>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-semibold transition hover:text-orange-200"
                >
                  Discover & Shop

                  <ArrowRight size={17} />
                </Link>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================
            SHOPPING HIGHLIGHTS
        ===================================== */}

        <section className="border-b border-stone-100 bg-white">

          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 md:grid-cols-3">

            <div className="flex items-center justify-center gap-3">

              <ShoppingBag
                size={25}
                className="text-orange-600"
              />

              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Easy Shopping
                </h3>

                <p className="text-xs text-stone-500">
                  Discover and explore products
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">

              <Package
                size={25}
                className="text-orange-600"
              />

              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Wide Product Selection
                </h3>

                <p className="text-xs text-stone-500">
                  Explore our shopping departments
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">

              <Heart
                size={25}
                className="text-orange-600"
              />

              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Save Your Favorites
                </h3>

                <p className="text-xs text-stone-500">
                  Keep products on your wishlist
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================
            SHOP BY CATEGORY
        ===================================== */}

        <section
          id="categories"
          className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 md:py-16"
        >

          {/* SECTION HEADING */}

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                EXPLORE BUY NEST
              </p>

              <h2 className="mt-2 text-3xl font-black text-stone-900 md:text-4xl">
                Shop by Category
              </h2>

              <p className="mt-3 text-stone-500">
                Find what you love across our five shopping departments.
              </p>

            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-600"
            >
              View All Products

              <ArrowRight size={17} />
            </Link>

          </div>

          {/* CATEGORY CARDS */}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

            {departments.map((department) => (

              <Link
                key={department.id}
                href={`/category/${department.id}`}
                className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* CATEGORY IMAGE */}

                <div className="relative h-32 overflow-hidden bg-stone-100">

                  <Image
                    src={department.image}
                    alt={department.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                </div>

                {/* CATEGORY DETAILS */}

                <div className="p-4">

                  <h3 className="text-sm font-bold text-stone-900 sm:text-base">
                    {department.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-8 text-xs text-stone-500">
                    {department.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">

                    <span className="text-xs font-semibold text-orange-700">
                      Explore
                    </span>

                    <ArrowRight
                      size={16}
                      className="text-orange-600 transition-transform group-hover:translate-x-1"
                    />

                  </div>
                </div>
              </Link>

            ))}

          </div>
        </section>

        {/* =====================================
            FEATURED PRODUCTS
        ===================================== */}

        <section className="bg-[#faf9f7] py-16">

          <div className="mx-auto max-w-7xl px-5">

            {/* SECTION HEADING */}

            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                  HANDPICKED FOR YOU
                </p>

                <h2 className="mt-2 text-3xl font-black text-stone-900 md:text-4xl">
                  Discover Our Collection
                </h2>

                <p className="mt-3 text-stone-500">
                  Explore a selection of products from our marketplace.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-600"
              >
                Shop All Products

                <ArrowRight size={17} />
              </Link>

            </div>

            {/* PRODUCT GRID */}

            {featuredProducts.length > 0 ? (

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

                {featuredProducts.map((product) => (

                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="relative h-48 overflow-hidden bg-white sm:h-60">

                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="p-4 sm:p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        {product.category.replaceAll("-", " ")}
                      </p>

                      <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-stone-900 group-hover:text-orange-600 sm:text-base">
                        {product.title}
                      </h3>

                      {/* RATING */}

                      <div className="mt-3 flex items-center gap-1">

                        <Star
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-sm font-semibold text-stone-600">
                          {product.rating.toFixed(1)}
                        </span>

                      </div>

                      {/* PRODUCT PRICE */}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">

                        <span className="text-lg font-black text-stone-900">
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

                      {/* VIEW PRODUCT */}

                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">

                        <span className="text-sm font-semibold text-orange-600">
                          View Details
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-orange-600 transition-transform group-hover:translate-x-1"
                        />

                      </div>
                    </div>
                  </Link>

                ))}

              </div>

            ) : (

              <div className="rounded-2xl bg-white p-10 text-center">

                <h3 className="text-xl font-bold text-stone-900">
                  Products are temporarily unavailable
                </h3>

                <p className="mt-3 text-stone-500">
                  Please try again later or explore our departments.
                </p>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-orange-600"
                >
                  Browse Products
                  <ArrowRight size={17} />
                </Link>
              </div>

            )}

          </div>
        </section>

        {/* =====================================
            SHOPPING COLLECTION BANNERS
        ===================================== */}

        <section className="mx-auto max-w-7xl px-5 py-16">

          <div className="mb-9">

            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              DISCOVER MORE
            </p>

            <h2 className="mt-2 text-3xl font-black text-stone-900 md:text-4xl">
              Explore More with BUY NEST
            </h2>

            <p className="mt-3 text-stone-500">
              Something special for every part of your lifestyle.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* HOME & FURNITURE */}

            <Link
              href="/category/home-furniture"
              className="group relative h-[350px] overflow-hidden rounded-3xl bg-stone-100"
            >

              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85"
                alt="Modern home and furniture collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 text-white">

                <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                  HOME & LIVING
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  Make Every Space
                  <br />
                  Feel Like Home.
                </h3>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore Home & Furniture

                  <ArrowUpRight size={17} />
                </span>

              </div>

            </Link>

            {/* ACCESSORIES */}

            <Link
              href="/category/accessories"
              className="group relative h-[350px] overflow-hidden rounded-3xl bg-stone-100"
            >

              <Image
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85"
                alt="Watches and lifestyle accessories"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 text-white">

                <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                  WATCHES & ACCESSORIES
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  Little Details.
                  <br />
                  Big Difference.
                </h3>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore Accessories

                  <ArrowUpRight size={17} />
                </span>

              </div>

            </Link>

          </div>
        </section>

        {/* =====================================
            THREE SHOPPING ACTION CARDS
        ===================================== */}

        <section className="bg-[#faf9f7] py-16">

          <div className="mx-auto max-w-7xl px-5">

            <div className="mb-10 text-center">

              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                MADE FOR YOU
              </p>

              <h2 className="mt-2 text-3xl font-black text-stone-900 md:text-4xl">
                Your Shopping Journey Starts Here
              </h2>

              <p className="mt-3 text-stone-500">
                Discover, save and shop your favorites.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-3">

              {/* DISCOVER & SHOP */}

              <Link
                href="/products"
                className="group rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="inline-flex rounded-2xl bg-orange-50 p-4 text-orange-600">
                  <ShoppingBag size={30} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-stone-900">
                  Discover & Shop
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Explore our products and discover
                  something perfect for your everyday needs.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-orange-700">
                  Browse Products

                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </Link>

              {/* EXPLORE DEPARTMENTS */}

              <Link
                href="#categories"
                className="group rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="inline-flex rounded-2xl bg-orange-50 p-4 text-orange-600">
                  <Package size={30} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-stone-900">
                  Explore 5 Departments
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Browse electronics, gaming, home
                  essentials, watches and accessories.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-orange-700">
                  View Categories

                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </Link>

              {/* WISHLIST */}

              <Link
                href="/wishlist"
                className="group rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="inline-flex rounded-2xl bg-orange-50 p-4 text-orange-600">
                  <Heart size={30} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-stone-900">
                  Create Your Wishlist
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Save your favorite products and
                  return to them whenever you want.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-orange-700">
                  Open Wishlist

                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </Link>

            </div>
          </div>
        </section>

        {/* =====================================
            FINAL SHOPPING CTA
        ===================================== */}

        <section className="px-5 py-16">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 rounded-3xl bg-[#f7eee4] px-8 py-12 text-center md:flex-row md:px-14 md:text-left">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                YOUR EVERYDAY MARKETPLACE
              </p>

              <h2 className="mt-3 text-3xl font-black text-stone-900 md:text-4xl">
                Find Your Next Favorite.
              </h2>

              <p className="mt-4 max-w-xl text-stone-600">
                From everyday essentials to exciting
                discoveries, explore everything BUY NEST
                has to offer.
              </p>

            </div>

            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-3 rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
            >
              Start Shopping

              <ArrowRight size={18} />
            </Link>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
