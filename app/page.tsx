
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Heart,
  Truck,
  Package,
  ShieldCheck,
  Headphones,
  Laptop,
  Sofa,
  Watch,
  Refrigerator,
  Star,
  UserRound,
  CheckCircle2,
  Gift,
} from "lucide-react";

import Header from "@/components/Header";

// ============================================
// TYPES
// ============================================

type FeaturedProduct = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  rating: number;
};

// ============================================
// CATEGORIES
// ============================================

const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Laptops, phones & smart tech",
    icon: Laptop,
    color: "bg-[#f8e4d5]",
  },
  {
    id: "audio-gaming",
    name: "Audio & Gaming",
    description: "Sound, gaming & more",
    icon: Headphones,
    color: "bg-[#ebe7f5]",
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    description: "Create your happy place",
    icon: Sofa,
    color: "bg-[#e8ecdf]",
  },
  {
    id: "accessories",
    name: "Watches & Accessories",
    description: "Your everyday style",
    icon: Watch,
    color: "bg-[#f8e8d6]",
  },
  {
    id: "appliances",
    name: "Home Appliances",
    description: "Make life a little easier",
    icon: Refrigerator,
    color: "bg-[#e2edf0]",
  },
];

// ============================================
// FETCH PRODUCTS FOR HOME DESIGN
// ============================================

async function getCategoryProduct(
  category: string
): Promise<FeaturedProduct | null> {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/category/${category}?limit=1&select=id,title,price,thumbnail,rating`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) return null;

    const data: unknown = await response.json();

    if (!data || typeof data !== "object") {
      return null;
    }

    const result = data as {
      products?: unknown;
    };

    if (
      !Array.isArray(result.products) ||
      result.products.length === 0
    ) {
      return null;
    }

    const product = result.products[0] as
      Partial<FeaturedProduct>;

    if (
      typeof product.id !== "number" ||
      typeof product.title !== "string" ||
      typeof product.thumbnail !== "string" ||
      !product.thumbnail ||
      typeof product.price !== "number" ||
      !Number.isFinite(product.price)
    ) {
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      rating:
        typeof product.rating === "number"
          ? product.rating
          : 0,
    };
  } catch {
    return null;
  }
}

// ============================================
// PRICE FORMAT
// ============================================

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// ============================================
// HOME PAGE
// ============================================

export default async function Home() {
  const [
    laptop,
    audio,
    furniture,
    watch,
  ] = await Promise.all([
    getCategoryProduct("laptops"),
    getCategoryProduct("mobile-accessories"),
    getCategoryProduct("furniture"),
    getCategoryProduct("womens-watches"),
  ]);

  const featured = [
    {
      label: "Technology",
      category: "electronics",
      product: laptop,
      icon: Laptop,
      background: "bg-[#e8ede6]",
    },
    {
      label: "Audio & Accessories",
      category: "audio-gaming",
      product: audio,
      icon: Headphones,
      background: "bg-[#f7e7df]",
    },
    {
      label: "Home & Living",
      category: "home-furniture",
      product: furniture,
      icon: Sofa,
      background: "bg-[#eae9dc]",
    },
    {
      label: "Everyday Style",
      category: "accessories",
      product: watch,
      icon: Watch,
      background: "bg-[#f5e8d5]",
    },
  ];

  return (
    <>
      <Header />

      <main className="overflow-hidden bg-[#fffdfb]">

        {/* ====================================
            DEPARTMENT NAVIGATION
        ==================================== */}

        <nav
          aria-label="Shopping departments"
          className="border-b border-stone-200 bg-white"
        >
          <div className="mx-auto flex max-w-[1450px] items-center gap-7 overflow-x-auto px-5 py-3.5 text-sm whitespace-nowrap md:px-8">

            <span className="shrink-0 font-black text-orange-600">
              Shop Departments
            </span>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="shrink-0 font-medium text-stone-600 transition-colors hover:text-orange-600"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* ====================================
            MODERN HERO SECTION
        ==================================== */}

        <section className="relative isolate overflow-hidden bg-[#f8f0e9]">

          {/* DECORATIVE BACKGROUND */}

          <div className="pointer-events-none absolute -left-28 top-24 h-[420px] w-[420px] rounded-full bg-orange-100/70 blur-3xl" />

          <div className="pointer-events-none absolute -right-28 -top-28 h-[490px] w-[490px] rounded-full bg-[#ead7c8]/80 blur-3xl motion-safe:animate-pulse" />

          <div className="relative mx-auto grid max-w-[1450px] items-center gap-12 px-5 py-16 md:px-8 lg:min-h-[660px] lg:grid-cols-2 lg:gap-16 lg:py-24">

            {/* LEFT HERO CONTENT */}

            <div className="relative z-10">

              {/* EYEBROW */}

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-5 py-2.5 shadow-sm">
                <Sparkles
                  size={16}
                  className="text-orange-600"
                />

                <span className="text-xs font-black uppercase tracking-[0.15em] text-orange-600">
                  Your everyday, elevated
                </span>
              </div>

              {/* MAIN TITLE */}

              <h1 className="max-w-2xl text-[48px] font-black leading-[1.08] tracking-[-0.045em] text-[#211e1b] sm:text-[64px] xl:text-[78px]">
                Discover
                <br />

                things you
                <br />

                <span className="text-orange-600">
                  love.
                </span>{" "}

                <span className="text-stone-900">
                  Everyday.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-7 max-w-lg text-base leading-8 text-stone-600 sm:text-lg">
                Beautiful finds for every corner
                of your life. Explore smart tech,
                stylish essentials, cozy home
                favorites and so much more.
              </p>

              {/* BUTTONS */}

              <div className="mt-9 flex flex-wrap gap-4">

                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#211e1b] px-8 py-4 font-bold text-white shadow-lg shadow-stone-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-xl"
                >
                  Explore Collection

                  <ArrowUpRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <Link
                  href="#categories"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-8 py-4 font-bold text-stone-900 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500"
                >
                  Shop Categories

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* MINI BENEFITS */}

              <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3">

                <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <CheckCircle2
                    size={18}
                    className="text-orange-600"
                  />
                  5 Departments
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <Heart
                    size={18}
                    className="text-orange-600"
                  />
                  Save Your Favorites
                </div>
              </div>
            </div>

            {/* ====================================
                RIGHT PRODUCT COLLAGE
            ==================================== */}

            <div className="relative mx-auto w-full max-w-[650px]">

              {/* BACKGROUND GLOW */}

              <div className="pointer-events-none absolute inset-8 rounded-[4rem] bg-orange-200/50 blur-3xl" />

              <div className="relative grid gap-4 sm:grid-cols-[1.08fr_0.92fr] sm:grid-rows-2">

                {/* LARGE TECHNOLOGY CARD */}

                <Link
                  href={
                    laptop
                      ? `/products/${laptop.id}`
                      : "/category/electronics"
                  }
                  className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border border-white/90 bg-[#dfe8e2] p-6 shadow-[0_20px_50px_rgba(54,45,31,0.10)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:row-span-2 sm:min-h-[500px]"
                >

                  <div className="relative z-10 flex items-start justify-between gap-3">

                    <span className="rounded-full bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-stone-700">
                      The Tech Edit
                    </span>

                    <ArrowUpRight
                      size={22}
                      className="text-stone-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>

                  {/* PRODUCT IMAGE */}

                  <div className="relative my-5 flex min-h-[210px] flex-1 items-center justify-center">

                    {laptop ? (
                      <Image
                        src={laptop.thumbnail}
                        alt={laptop.title}
                        fill
                        priority
                        sizes="(max-width: 640px) 90vw, 330px"
                        className="object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Laptop
                        size={135}
                        strokeWidth={1}
                        className="text-stone-500"
                      />
                    )}
                  </div>

                  {/* BOTTOM DETAILS */}

                  <div className="relative z-10">

                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                      Smart essentials
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-2xl font-black text-stone-900">
                      {laptop?.title ||
                        "Explore modern technology"}
                    </h2>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="font-bold text-stone-700">
                        {laptop
                          ? formatPrice(laptop.price)
                          : "Shop Tech"}
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white transition-colors duration-300 group-hover:bg-orange-600">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* AUDIO CARD */}

                <Link
                  href={
                    audio
                      ? `/products/${audio.id}`
                      : "/category/audio-gaming"
                  }
                  className="group relative flex min-h-[235px] flex-col overflow-hidden rounded-[2rem] border border-white bg-[#f2dbd1] p-5 shadow-[0_15px_40px_rgba(54,45,31,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                >

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">
                      Audio & Gear
                    </span>

                    <ArrowUpRight
                      size={18}
                      className="text-stone-700"
                    />
                  </div>

                  <div className="relative my-2 min-h-[115px] flex-1">

                    {audio ? (
                      <Image
                        src={audio.thumbnail}
                        alt={audio.title}
                        fill
                        sizes="(max-width: 640px) 90vw, 260px"
                        className="object-contain drop-shadow-md transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Headphones
                          size={75}
                          className="text-stone-500"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    <h3 className="line-clamp-1 text-base font-black text-stone-900">
                      {audio?.title ||
                        "Audio Essentials"}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-stone-700">
                      {audio
                        ? formatPrice(audio.price)
                        : "Explore Collection"}
                    </p>
                  </div>
                </Link>

                {/* HOME CARD */}

                <Link
                  href={
                    furniture
                      ? `/products/${furniture.id}`
                      : "/category/home-furniture"
                  }
                  className="group relative flex min-h-[235px] flex-col overflow-hidden rounded-[2rem] border border-white bg-[#e8e5d6] p-5 shadow-[0_15px_40px_rgba(54,45,31,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                >

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">
                      Home & Living
                    </span>

                    <ArrowUpRight
                      size={18}
                      className="text-stone-700"
                    />
                  </div>

                  <div className="relative my-2 min-h-[115px] flex-1">

                    {furniture ? (
                      <Image
                        src={furniture.thumbnail}
                        alt={furniture.title}
                        fill
                        sizes="(max-width: 640px) 90vw, 260px"
                        className="object-contain drop-shadow-md transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Sofa
                          size={75}
                          className="text-stone-500"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    <h3 className="line-clamp-1 text-base font-black text-stone-900">
                      {furniture?.title ||
                        "Home Favorites"}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-stone-700">
                      {furniture
                        ? formatPrice(furniture.price)
                        : "Explore Collection"}
                    </p>
                  </div>
                </Link>
              </div>

              {/* FLOATING TAG */}

              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white bg-white px-5 py-3 shadow-xl sm:flex">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Gift size={21} />
                </div>

                <div>
                  <p className="text-sm font-black text-stone-900">
                    Discover something new
                  </p>

                  <p className="text-xs text-stone-500">
                    Your next favorite awaits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================
            TRUST / SERVICE STRIP
        ==================================== */}

        <section className="border-b border-stone-100 bg-white">

          <div className="mx-auto grid max-w-[1450px] gap-7 px-5 py-8 md:grid-cols-3 md:px-8">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                <ShoppingBag size={25} />
              </div>

              <div>
                <h3 className="text-sm font-black text-stone-900">
                  Discover & Shop
                </h3>

                <p className="mt-1 text-xs text-stone-500">
                  Your favorites in one destination
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:justify-center">

              <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                <Package size={25} />
              </div>

              <div>
                <h3 className="text-sm font-black text-stone-900">
                  Explore 5 Departments
                </h3>

                <p className="mt-1 text-xs text-stone-500">
                  Shop across everyday categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:justify-end">

              <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                <Heart size={25} />
              </div>

              <div>
                <h3 className="text-sm font-black text-stone-900">
                  Create Your Wishlist
                </h3>

                <p className="mt-1 text-xs text-stone-500">
                  Keep your favorite finds close
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================
            SHOP BY CATEGORY
        ==================================== */}

        <section
          id="categories"
          className="mx-auto max-w-[1450px] scroll-mt-24 px-5 py-20 md:px-8 lg:py-24"
        >

          <div className="mb-11 flex flex-wrap items-end justify-between gap-5">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Explore Collections
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
                Shop by{" "}
                <span className="text-orange-600">
                  Category.
                </span>
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-stone-500">
                Everything you need, neatly
                organized into your favorite
                shopping departments.
              </p>
            </div>

            <Link
              href="/products"
              className="group inline-flex items-center gap-2 font-bold text-stone-900 transition-colors hover:text-orange-600"
            >
              View All Categories

              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* CATEGORY CARDS */}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group relative flex min-h-[260px] flex-col rounded-3xl border border-stone-100 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl sm:p-6"
                >

                  <span className="absolute right-5 top-5 text-xs font-black text-stone-300">
                    0{index + 1}
                  </span>

                  <div
                    className={`mb-8 flex h-24 w-24 items-center justify-center rounded-3xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${category.color}`}
                  >
                    <Icon
                      size={43}
                      strokeWidth={1.5}
                      className="text-stone-800"
                    />
                  </div>

                  <h3 className="text-base font-black text-stone-900 sm:text-lg">
                    {category.name}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    {category.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6">

                    <span className="text-xs font-bold text-orange-600">
                      Explore
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ====================================
            FEATURED PRODUCT PICKS
        ==================================== */}

        <section className="bg-[#faf6f1] px-5 py-20 md:px-8">

          <div className="mx-auto max-w-[1450px]">

            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                  Handpicked Inspiration
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
                  Discover the{" "}
                  <span className="text-orange-600">
                    good stuff.
                  </span>
                </h2>

                <p className="mt-4 text-stone-500">
                  A little inspiration from our
                  favorite shopping departments.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 font-bold text-stone-900 hover:text-orange-600"
              >
                Explore More
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* FEATURED GRID */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {featured.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.category}
                    href={
                      item.product
                        ? `/products/${item.product.id}`
                        : `/category/${item.category}`
                    }
                    className="group overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                  >

                    {/* IMAGE AREA */}

                    <div
                      className={`relative aspect-square overflow-hidden ${item.background}`}
                    >

                      {item.product ? (
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon
                            size={95}
                            strokeWidth={1}
                            className="text-stone-500"
                          />
                        </div>
                      )}

                      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition group-hover:bg-orange-600 group-hover:text-white">
                        <ArrowUpRight size={19} />
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="p-5">

                      <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                        {item.label}
                      </p>

                      <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-black text-stone-900">
                        {item.product?.title ||
                          `Explore ${item.label}`}
                      </h3>

                      <div className="mt-4 flex items-center justify-between gap-3">

                        <p className="text-lg font-black text-stone-900">
                          {item.product
                            ? formatPrice(
                                item.product.price
                              )
                            : "Discover"}
                        </p>

                        {item.product &&
                          item.product.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-stone-600">
                              <Star
                                size={15}
                                className="fill-amber-400 text-amber-400"
                              />

                              {item.product.rating.toFixed(1)}
                            </div>
                          )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================
            PROMOTIONAL BANNER
        ==================================== */}

        <section className="px-5 py-20 md:px-8">

          <div className="relative mx-auto max-w-[1450px] overflow-hidden rounded-[2.5rem] bg-[#211e1b] px-8 py-14 text-white md:px-14 lg:py-20">

            <div className="pointer-events-none absolute -right-20 -top-24 h-[370px] w-[370px] rounded-full bg-orange-600/30 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 right-40 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  More to Explore
                </p>

                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  Your next favorite
                  <br />
                  is just a click away.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-stone-300">
                  Discover new collections,
                  everyday essentials and
                  exciting finds across BUY NEST.
                </p>
              </div>

              <Link
                href="/products"
                className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-orange-600 px-8 py-4 font-black text-white transition-all duration-300 hover:-translate-y-1 hover:bg-orange-500"
              >
                Start Exploring

                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================
            WHY BUY NEST
        ==================================== */}

        <section className="mx-auto max-w-[1450px] px-5 pb-20 md:px-8">

          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <ShoppingBag size={28} />
              </div>

              <h3 className="text-xl font-black">
                Easy Shopping
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Find your favorites, add products
                to your cart and enjoy a simple
                shopping experience.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Heart size={28} />
              </div>

              <h3 className="text-xl font-black">
                Save What You Love
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Create your wishlist and
                revisit the products you love
                whenever you want.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <ShieldCheck size={28} />
              </div>

              <h3 className="text-xl font-black">
                Complete Demo Checkout
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                Try shipping, simulated payment
                methods and order history with
                no real payment.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================
            ACCOUNT SECTION
        ==================================== */}

        <section className="border-t border-stone-100 bg-[#faf6f1] px-5 py-12 md:px-8">

          <div className="mx-auto flex max-w-[1450px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">

            <div className="flex items-center gap-5">

              <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
                <UserRound size={30} />
              </div>

              <div>
                <h2 className="text-xl font-black text-stone-900">
                  Your BUY NEST Account
                </h2>

                <p className="mt-2 text-sm text-stone-600">
                  Your profile, wishlist, cart
                  and previous demo orders —
                  all in one place.
                </p>
              </div>
            </div>

            <Link
              href="/account"
              className="group inline-flex items-center gap-3 rounded-full border border-stone-300 bg-white px-7 py-3 font-bold text-stone-900 transition hover:border-orange-500 hover:text-orange-600"
            >
              My Account

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

      </main>

      {/* ====================================
          FOOTER
      ==================================== */}

      <footer className="bg-[#201e1c] px-5 py-14 text-white md:px-8">

        <div className="mx-auto max-w-[1450px]">

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            {/* BRAND */}

            <div className="lg:col-span-2">

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-3xl font-black tracking-tight"
              >
                BUY

                <span className="text-orange-500">
                  NEST.
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-stone-400">
                Thoughtful finds for everyday
                living. Discover tech, home,
                accessories and more in one
                shopping destination.
              </p>

              <p className="mt-5 text-sm font-bold text-orange-400">
                Discover things you love.
              </p>
            </div>

            {/* SHOP LINKS */}

            <div>
              <h3 className="mb-6 font-black">
                Explore
              </h3>

              <div className="flex flex-col gap-4 text-sm text-stone-400">

                <Link
                  href="/products"
                  className="hover:text-orange-400"
                >
                  Shop Categories
                </Link>

                <Link
                  href="/cart"
                  className="hover:text-orange-400"
                >
                  My Cart
                </Link>

                <Link
                  href="/wishlist"
                  className="hover:text-orange-400"
                >
                  Wishlist
                </Link>

                <Link
                  href="/orders"
                  className="hover:text-orange-400"
                >
                  My Orders
                </Link>
              </div>
            </div>

            {/* ACCOUNT LINKS */}

            <div>
              <h3 className="mb-6 font-black">
                My Account
              </h3>

              <div className="flex flex-col gap-4 text-sm text-stone-400">

                <Link
                  href="/login"
                  className="hover:text-orange-400"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="hover:text-orange-400"
                >
                  Register
                </Link>

                <Link
                  href="/account"
                  className="hover:text-orange-400"
                >
                  My Profile
                </Link>

                <Link
                  href="/orders"
                  className="hover:text-orange-400"
                >
                  Order History
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-700 pt-7 text-center text-xs text-stone-500 sm:flex-row">

            <p>
              © 2026 BUY NEST. All rights reserved.
            </p>

            <p>
              Demo E-commerce Store
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
