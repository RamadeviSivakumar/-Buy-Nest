
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import ProductCard, {
  type Product,
} from "@/components/ProductCard";

import {
  demoProducts,
} from "@/lib/demoProducts";

// ============================================
// TYPES
// ============================================

type ShopProduct = Product & {
  category: string;
  description?: string;
  discountPercentage?: number;
};

type SortOption =
  | "featured"
  | "low"
  | "high"
  | "rating";

type Collection = {
  slug: string;
  label: string;
};

type Department = {
  id: string;
  name: string;
  icon: string;
  description: string;
  collections: Collection[];
};

// ============================================
// FIVE MAIN DEPARTMENTS
// ============================================

const departments: Department[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    description:
      "Explore smartphones, laptops and tablets designed for everyday life.",
    collections: [
      {
        slug: "smartphones",
        label: "Smartphones",
      },
      {
        slug: "laptops",
        label: "Laptops",
      },
      {
        slug: "tablets",
        label: "Tablets",
      },
    ],
  },
  {
    id: "audio-gaming",
    name: "Audio & Gaming",
    icon: "🎮",
    description:
      "Explore headphones, earbuds, speakers, gaming controllers, keyboards, gaming mice and more.",
    collections: [
      {
        slug: "audio",
        label: "Audio Devices",
      },
      {
        slug: "gaming",
        label: "Gaming Products",
      },
    ],
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    icon: "🛋️",
    description:
      "Refresh your home with beautiful furniture and comfortable everyday essentials.",
    collections: [
      {
        slug: "furniture",
        label: "Furniture",
      },
      {
        slug: "home-decoration",
        label: "Home Decor",
      },
    ],
  },
  {
    id: "accessories",
    name: "Watches & Accessories",
    icon: "⌚",
    description:
      "Complete your look with watches, bags, jewellery and sunglasses.",
    collections: [
      {
        slug: "mens-watches",
        label: "Men's Watches",
      },
      {
        slug: "womens-watches",
        label: "Women's Watches",
      },
      {
        slug: "womens-bags",
        label: "Bags",
      },
      {
        slug: "womens-jewellery",
        label: "Jewellery",
      },
      {
        slug: "sunglasses",
        label: "Sunglasses",
      },
    ],
  },
  {
    id: "appliances",
    name: "Home Appliances",
    icon: "🏠",
    description:
      "Discover refrigerators, washing machines, air conditioners, cleaning appliances and kitchen essentials.",
    collections: [
      {
        slug: "cooling",
        label: "Cooling Appliances",
      },
      {
        slug: "laundry",
        label: "Laundry",
      },
      {
        slug: "cleaning",
        label: "Cleaning",
      },
      {
        slug: "kitchen",
        label: "Kitchen Appliances",
      },
      {
        slug: "air-quality",
        label: "Air Quality",
      },
    ],
  },
];

// ============================================
// AUDIO AND GAMING FILTERS
// ============================================

const AUDIO_KEYWORDS =
  /headphone|headset|earbud|earphone|airpods|earpods|speaker|audio|microphone|beats|buds|soundbar/i;

const GAMING_KEYWORDS =
  /gaming|gamepad|controller|joystick|console|playstation|xbox|nintendo/i;

// ============================================
// CUSTOM APPLIANCE GROUPS
// ============================================

const applianceGroups: Record<number, string> = {
  // Refrigerator
  900101: "cooling",

  // Washing Machine
  900102: "laundry",

  // Air Conditioner
  900103: "cooling",

  // Vacuum Cleaner
  900104: "cleaning",

  // Microwave
  900105: "kitchen",

  // Air Fryer
  900106: "kitchen",

  // Air Purifier
  900107: "air-quality",

  // Mixer Grinder
  900108: "kitchen",
};

// ============================================
// AUDIO / GAMING COLLECTION
// ============================================

function getAudioGamingCollection(
  product: ShopProduct
): "audio" | "gaming" | null {

  // All custom gaming products
  // use category = "gaming".

  if (product.category === "gaming") {
    return "gaming";
  }

  // Include any genuine gaming products
  // found in the online catalog.

  if (GAMING_KEYWORDS.test(product.title)) {
    return "gaming";
  }

  // Keep actual audio products.
  // Normal mobile accessories are excluded.

  if (
    product.category === "mobile-accessories" &&
    AUDIO_KEYWORDS.test(product.title)
  ) {
    return "audio";
  }

  return null;
}

// ============================================
// GET PRODUCT COLLECTION
// ============================================

function getCollectionSlug(
  product: ShopProduct,
  departmentId: string
): string {

  // Audio and Gaming

  if (departmentId === "audio-gaming") {
    return (
      getAudioGamingCollection(product) ?? ""
    );
  }

  // Home Appliances

  if (departmentId === "appliances") {
    return applianceGroups[product.id] ?? "";
  }

  // Other categories

  return product.category;
}

// ============================================
// CHECK DEPARTMENT MEMBERSHIP
// ============================================

function belongsToDepartment(
  product: ShopProduct,
  department: Department
): boolean {

  // Audio & Gaming

  if (department.id === "audio-gaming") {
    return (
      getAudioGamingCollection(product) !== null
    );
  }

  // Home Appliances

  if (department.id === "appliances") {
    return (
      product.category === "home-appliances"
    );
  }

  // Existing categories unchanged

  return department.collections.some(
    (collection) =>
      collection.slug === product.category
  );
}

// ============================================
// CATEGORY PAGE
// ============================================

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();

  const slug = params.slug;

  const department = departments.find(
    (item) => item.id === slug
  );

  const [products, setProducts] =
    useState<ShopProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<SortOption>("featured");

  const [
    selectedCollection,
    setSelectedCollection,
  ] = useState("all");

  const [saleOnly, setSaleOnly] =
    useState(false);

  const [retry, setRetry] =
    useState(0);

  // ============================================
  // FETCH PRODUCTS
  // ============================================

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=0",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load products"
          );
        }

        const data: {
          products?: ShopProduct[];
        } = await response.json();

        const apiProducts = Array.isArray(
          data.products
        )
          ? data.products
          : [];

        // =====================================
        // COMBINE ONLINE + DEMO PRODUCTS
        // =====================================

        // Online products:
        // Electronics, Audio, Furniture,
        // Watches and Accessories.
        //
        // Custom products:
        // Gaming and Home Appliances.

        const allProducts: ShopProduct[] = [
          ...apiProducts,
          ...demoProducts,
        ];

        if (active) {
          setProducts(allProducts);
        }
      } catch (err) {
        console.error(
          "Category fetch error:",
          err
        );

        if (active) {
          // Custom products are still available
          // if the online catalog fails.

          setProducts([...demoProducts]);

          setError(
            "Unable to load online products. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, [retry]);

  // ============================================
  // RESET FILTERS ON CATEGORY CHANGE
  // ============================================

  useEffect(() => {
    setSearch("");
    setSort("featured");
    setSelectedCollection("all");
    setSaleOnly(false);
  }, [slug]);

  // ============================================
  // DEPARTMENT PRODUCTS
  // ============================================

  const categoryProducts = useMemo(() => {
    if (!department) return [];

    return products.filter((product) =>
      belongsToDepartment(
        product,
        department
      )
    );
  }, [products, department]);

  // ============================================
  // AVAILABLE COLLECTIONS
  // ============================================

  const availableCollections = useMemo(() => {
    if (!department) return [];

    return department.collections.filter(
      (collection) =>
        categoryProducts.some(
          (product) =>
            getCollectionSlug(
              product,
              department.id
            ) === collection.slug
        )
    );
  }, [categoryProducts, department]);

  // ============================================
  // SEARCH, FILTER, SORT
  // ============================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = categoryProducts.filter(
      (product) => {

        const matchesCollection =
          selectedCollection === "all" ||
          getCollectionSlug(
            product,
            slug
          ) === selectedCollection;

        const matchesSearch =
          product.title
            .toLowerCase()
            .includes(query) ||
          (product.description ?? "")
            .toLowerCase()
            .includes(query);

        const matchesSale =
          !saleOnly ||
          (product.discountPercentage ?? 0) > 0;

        return (
          matchesCollection &&
          matchesSearch &&
          matchesSale
        );
      }
    );

    // LOW TO HIGH

    if (sort === "low") {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    // HIGH TO LOW

    if (sort === "high") {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    // HIGHEST RATED

    if (sort === "rating") {
      result = [...result].sort(
        (a, b) => b.rating - a.rating
      );
    }

    return result;
  }, [
    categoryProducts,
    search,
    sort,
    selectedCollection,
    saleOnly,
    slug,
  ]);

  // ============================================
  // CLEAR FILTERS
  // ============================================

  function clearFilters() {
    setSearch("");
    setSort("featured");
    setSelectedCollection("all");
    setSaleOnly(false);
  }

  // ============================================
  // INVALID CATEGORY
  // ============================================

  if (!department) {
    return (
      <>
        <Header />

        <main className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-5 text-center">

          <ShoppingBag
            size={64}
            className="mb-5 text-orange-600"
          />

          <h1 className="text-3xl font-black text-stone-900">
            Category Not Found
          </h1>

          <p className="mt-3 text-stone-500">
            This shopping department does not exist.
          </p>

          <Link
            href="/"
            className="mt-6 rounded-full bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Back to Homepage
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  // ============================================
  // PAGE DESIGN
  // ============================================

  const hasLoadError =
    Boolean(error) &&
    categoryProducts.length === 0;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">

        {/* =====================================
            BREADCRUMB
        ===================================== */}

        <section className="border-b border-stone-100 bg-white">

          <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-5 text-sm text-stone-500">

            <Link
              href="/"
              className="hover:text-orange-600"
            >
              Home
            </Link>

            <ChevronRight size={15} />

            <span className="font-semibold text-stone-900">
              {department.name}
            </span>
          </div>
        </section>

        {/* =====================================
            CATEGORY HERO
        ===================================== */}

        <section className="bg-[#f7eee4]">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-5 py-14 md:flex-row md:py-20">

            <div className="max-w-2xl">

              <span className="inline-block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-700">
                BUY NEST COLLECTION
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-stone-900 md:text-6xl">
                Explore{" "}

                <span className="text-orange-600">
                  {department.name}
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
                {department.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-stone-700">
                  {loading
                    ? "Loading..."
                    : `${categoryProducts.length} Products`}
                </span>

                <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-stone-700">
                  Curated Demo Collection
                </span>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-[3rem] bg-white/70 text-8xl shadow-xl md:h-64 md:w-64">
              {department.icon}
            </div>
          </div>
        </section>

        {/* =====================================
            FIVE CATEGORY NAVIGATION
        ===================================== */}

        <section className="border-b border-stone-100 bg-[#faf9f7]">

          <div className="mx-auto max-w-7xl px-5 py-8">

            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-600">
              SHOP BY DEPARTMENT
            </p>

            <div className="flex flex-wrap gap-3">

              {departments.map((item) => {
                const isActive =
                  item.id === department.id;

                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.id}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-orange-500 hover:text-orange-600"
                    }`}
                  >
                    <span>{item.icon}</span>

                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================
            PRODUCT COLLECTION
        ===================================== */}

        <section className="mx-auto max-w-7xl px-5 py-14">

          {/* SECTION TITLE */}

          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">

            <div>
              <p className="font-semibold tracking-wide text-orange-600">
                HANDPICKED FOR YOU
              </p>

              <h2 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">
                Shop {department.name}
              </h2>

              <p className="mt-3 text-sm text-stone-500">
                Browse products from this department.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">

              <ShoppingBag
                size={19}
                className="text-orange-600"
              />

              {loading
                ? "Loading products"
                : `${filteredProducts.length} Results`}
            </div>
          </div>

          {/* =====================================
              SUBCATEGORY FILTERS
          ===================================== */}

          {!loading &&
            availableCollections.length > 1 && (
              <div className="mb-9 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCollection("all")
                  }
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selectedCollection === "all"
                      ? "bg-stone-900 text-white"
                      : "bg-[#f7f4ef] text-stone-700 hover:bg-orange-100"
                  }`}
                >
                  All {department.name}
                </button>

                {availableCollections.map(
                  (collection) => (
                    <button
                      key={collection.slug}
                      type="button"
                      onClick={() =>
                        setSelectedCollection(
                          collection.slug
                        )
                      }
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        selectedCollection ===
                        collection.slug
                          ? "bg-stone-900 text-white"
                          : "bg-[#f7f4ef] text-stone-700 hover:bg-orange-100"
                      }`}
                    >
                      {collection.label}
                    </button>
                  )
                )}
              </div>
            )}

          {/* =====================================
              SEARCH, SALE AND SORT
          ===================================== */}

          <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-[#faf9f7] p-4 md:flex-row md:items-center">

            {/* SEARCH */}

            <div className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 md:max-w-md">

              <Search
                size={20}
                className="shrink-0 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={`Search ${department.name}...`}
                aria-label="Search category products"
                className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
            </div>

            {/* FILTER ACTIONS */}

            <div className="flex flex-wrap items-center gap-3">

              {/* SALE FILTER */}

              <button
                type="button"
                onClick={() =>
                  setSaleOnly((previous) => !previous)
                }
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  saleOnly
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-orange-500"
                }`}
              >
                On Sale {saleOnly ? "✓" : ""}
              </button>

              {/* SORT */}

              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3">

                <SlidersHorizontal
                  size={18}
                  className="text-stone-500"
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target.value as SortOption
                    )
                  }
                  aria-label="Sort products"
                  className="bg-transparent py-3 pr-2 text-sm font-medium text-stone-700 outline-none"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="low">
                    Price: Low to High
                  </option>

                  <option value="high">
                    Price: High to Low
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* =====================================
              ACTIVE FILTERS
          ===================================== */}

          {(search ||
            saleOnly ||
            selectedCollection !== "all") && (
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

              <p className="text-sm text-stone-500">
                Showing {filteredProducts.length}{" "}
                matching products
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-600"
              >
                <RotateCcw size={15} />
                Clear Filters
              </button>
            </div>
          )}

          {/* =====================================
              LOADING STATE
          ===================================== */}

          {loading && (
            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              aria-busy="true"
              aria-label="Loading products"
            >
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-stone-100 bg-white p-4"
                  >
                    <div className="aspect-square rounded-xl bg-stone-100" />

                    <div className="mt-5 h-4 w-3/4 rounded bg-stone-100" />

                    <div className="mt-3 h-4 w-1/2 rounded bg-stone-100" />
                  </div>
                )
              )}
            </div>
          )}

          {/* =====================================
              PARTIAL ONLINE ERROR
          ===================================== */}

          {!loading &&
            error &&
            categoryProducts.length > 0 && (
              <div className="mb-7 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-stone-700">
                {error} Available demo products are
                shown below.
              </div>
            )}

          {/* =====================================
              ERROR STATE
          ===================================== */}

          {!loading && hasLoadError && (
            <div className="rounded-2xl bg-orange-50 px-6 py-14 text-center">

              <h3 className="text-xl font-bold text-stone-900">
                Unable to Load Products
              </h3>

              <p className="mt-3 text-stone-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRetry((value) => value + 1)
                }
                className="mt-6 rounded-full bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =====================================
              PRODUCT GRID
          ===================================== */}

          {!loading &&
            !hasLoadError &&
            filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )}
              </div>
            )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}

          {!loading &&
            !hasLoadError &&
            filteredProducts.length === 0 && (
              <div className="rounded-2xl bg-[#faf9f7] px-6 py-16 text-center">

                <ShoppingBag
                  size={54}
                  className="mx-auto mb-5 text-orange-500"
                />

                <h3 className="text-xl font-bold text-stone-900">
                  No Matching Products
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm text-stone-500">
                  Try clearing your filters or
                  exploring another collection.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-stone-900 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </section>

        {/* =====================================
            BOTTOM PROMOTION
        ===================================== */}

        <section className="px-5 pb-16">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-3xl bg-[#f7eee4] px-8 py-12 md:flex-row md:px-14">

            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-600">
                Discover More
              </p>

              <h2 className="mt-3 text-3xl font-black text-stone-900">
                Something for every day.
              </h2>

              <p className="mt-3 text-stone-600">
                Explore more great finds across
                BUY NEST.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
            >
              Explore Homepage

              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
