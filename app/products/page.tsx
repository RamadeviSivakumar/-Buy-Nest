
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ChevronRight,
  ShoppingBag,
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
// SHOP CATEGORIES PAGE
// ============================================

export default function ProductsPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">

        {/* =====================================
            BREADCRUMB
        ===================================== */}

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
              Shop Categories
            </span>
          </div>
        </div>

        {/* =====================================
            HERO SECTION
        ===================================== */}

        <section className="bg-[#f7eee4]">

          <div className="mx-auto max-w-7xl px-5 py-16 text-center md:py-20">

            <span className="inline-block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-700">
              BUY NEST COLLECTIONS
            </span>

            <h1 className="mt-6 text-4xl font-black text-stone-900 md:text-6xl">

              Shop by{" "}

              <span className="text-orange-600">
                Category.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
              Discover your favorite products across
              five carefully selected shopping
              departments.
            </p>
          </div>
        </section>

        {/* =====================================
            FIVE CATEGORY CARDS
        ===================================== */}

        <section className="mx-auto max-w-7xl px-5 py-16">

          {/* SECTION HEADING */}

          <div className="mb-10">

            <p className="font-semibold text-orange-600">
              EXPLORE BUY NEST
            </p>

            <h2 className="mt-2 text-3xl font-bold text-stone-900">
              Our Departments
            </h2>

            <p className="mt-3 text-stone-500">
              Select a category to view its products.
            </p>
          </div>

          {/* CATEGORY GRID */}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {departments.map((department) => (

              <Link
                key={department.id}
                href={`/category/${department.id}`}
                className="group overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >

                {/* ===========================
                    REAL CATEGORY IMAGE
                =========================== */}

                <div
                  className={`relative h-52 overflow-hidden ${department.background}`}
                >

                  <Image
                    src={department.image}
                    alt={`${department.name} category`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                </div>

                {/* ===========================
                    CATEGORY DETAILS
                =========================== */}

                <div className="p-6">

                  <h3 className="text-xl font-bold text-stone-900">
                    {department.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm text-stone-500">
                    {department.description}
                  </p>

                  {/* EXPLORE LINK */}

                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-5">

                    <span className="font-semibold text-orange-700">
                      Explore Products
                    </span>

                    <span className="rounded-full bg-orange-50 p-2 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">

                      <ArrowRight size={18} />

                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================
            BOTTOM BANNER
        ===================================== */}

        <section className="px-5 pb-16">

          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 rounded-3xl bg-[#faf9f7] px-8 py-12 text-center">

            <ShoppingBag
              size={38}
              className="text-orange-600"
            />

            <h2 className="text-3xl font-black text-stone-900">
              Find your next favorite.
            </h2>

            <p className="max-w-xl text-stone-500">
              Choose a shopping department and
              explore products picked for your
              everyday needs.
            </p>

            <Link
              href="/"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Back to Homepage

              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
