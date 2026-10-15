
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";

import {
  getDemoProductById,
} from "@/lib/demoProducts";

import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Star,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type WishlistItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  rating: number;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
  quantity: number;
};

type ApiProduct = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
};

// ============================================
// STORAGE KEYS
// ============================================

const USER_KEY = "buynest-demo-user";
const WISHLIST_KEY = "buynest-wishlist";
const CART_KEY = "buynest-cart";

const AUTH_EVENT = "buynest-auth-updated";
const WISHLIST_EVENT = "buynest-wishlist-updated";
const CART_EVENT = "buynest-cart-updated";

// ============================================
// AUTH SUBSCRIPTION
// ============================================

function subscribeToAuth(
  callback: () => void
) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(
      AUTH_EVENT,
      callback
    );
  };
}

function getAuthSnapshot() {
  try {
    return (
      localStorage.getItem(USER_KEY) ?? ""
    );
  } catch {
    return "";
  }
}

function getAuthServerSnapshot() {
  return "";
}

function isValidUser(raw: string) {
  try {
    if (!raw) return false;

    const user: unknown = JSON.parse(raw);

    if (
      !user ||
      typeof user !== "object"
    ) {
      return false;
    }

    const account = user as {
      name?: unknown;
      email?: unknown;
    };

    return (
      typeof account.name === "string" &&
      typeof account.email === "string" &&
      account.email.trim().length > 0
    );
  } catch {
    return false;
  }
}

// ============================================
// WISHLIST SUBSCRIPTION
// ============================================

function subscribeToWishlist(
  callback: () => void
) {
  window.addEventListener("storage", callback);

  window.addEventListener(
    WISHLIST_EVENT,
    callback
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback
    );

    window.removeEventListener(
      WISHLIST_EVENT,
      callback
    );
  };
}

function getWishlistSnapshot() {
  try {
    return (
      localStorage.getItem(WISHLIST_KEY) ??
      "[]"
    );
  } catch {
    return "[]";
  }
}

function getWishlistServerSnapshot() {
  return "[]";
}

// ============================================
// PARSE WISHLIST
// ============================================

function parseWishlist(
  raw: string
): WishlistItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is WishlistItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.title === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        typeof item.thumbnail === "string" &&
        typeof item.rating === "number"
    );
  } catch {
    return [];
  }
}

// ============================================
// READ CART
// ============================================

function readCart(): CartItem[] {
  try {
    const saved =
      localStorage.getItem(CART_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.quantity === "number" &&
        Number.isFinite(item.quantity)
    );
  } catch {
    return [];
  }
}

// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// ============================================
// VALIDATE API PRODUCT
// ============================================

function isValidProduct(
  value: unknown
): value is ApiProduct {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const product =
    value as Partial<ApiProduct>;

  return (
    typeof product.id === "number" &&
    typeof product.title === "string" &&
    product.title.length > 0 &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    typeof product.thumbnail === "string" &&
    product.thumbnail.length > 0 &&
    typeof product.stock === "number" &&
    Number.isFinite(product.stock)
  );
}

// ============================================
// GET PRODUCT FOR CART
// ============================================

async function getProductForCart(
  id: number
): Promise<ApiProduct> {

  // STEP 1:
  // Check custom BUY NEST products first.

  const demoProduct =
    getDemoProductById(id);

  if (demoProduct) {
    return {
      id: demoProduct.id,
      title: demoProduct.title,
      price: demoProduct.price,
      thumbnail: demoProduct.thumbnail,
      stock: demoProduct.stock,
    };
  }

  // STEP 2:
  // Unknown custom IDs must not be
  // requested from DummyJSON.

  if (id >= 900000) {
    throw new Error(
      "This demo product is no longer available."
    );
  }

  // STEP 3:
  // Fetch existing DummyJSON products.

  const response = await fetch(
    `https://dummyjson.com/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to fetch product details."
    );
  }

  const product: unknown =
    await response.json();

  if (
    !isValidProduct(product) ||
    product.id !== id
  ) {
    throw new Error(
      "Invalid product information."
    );
  }

  return product;
}

// ============================================
// WISHLIST PAGE
// ============================================

export default function WishlistPage() {
  const router = useRouter();

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [movingId, setMovingId] =
    useState<number | null>(null);

  // ==========================================
  // AUTH
  // ==========================================

  const rawAuth = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const loggedIn = isValidUser(rawAuth);

  useEffect(() => {
    // Read actual browser storage to avoid
    // redirecting during hydration.

    const currentAuth = getAuthSnapshot();

    if (!isValidUser(currentAuth)) {
      router.replace(
        "/login?next=%2Fwishlist"
      );
    }
  }, [rawAuth, router]);

  // ==========================================
  // WISHLIST STATE
  // ==========================================

  const rawWishlist = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const wishlist = useMemo(
    () => parseWishlist(rawWishlist),
    [rawWishlist]
  );

  // ==========================================
  // SAVE WISHLIST
  // ==========================================

  function saveWishlist(
    items: WishlistItem[]
  ) {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(items)
    );

    window.dispatchEvent(
      new Event(WISHLIST_EVENT)
    );
  }

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  function removeFromWishlist(
    id: number
  ) {
    if (!isValidUser(getAuthSnapshot())) {
      router.push("/login?next=%2Fwishlist");
      return;
    }

    try {
      const updated = wishlist.filter(
        (item) => item.id !== id
      );

      saveWishlist(updated);

      setError("");

      setMessage(
        "Product removed from wishlist."
      );
    } catch {
      setError(
        "Unable to update wishlist."
      );
    }
  }

  // ==========================================
  // CLEAR WISHLIST
  // ==========================================

  function clearWishlist() {
    if (!isValidUser(getAuthSnapshot())) {
      router.push("/login?next=%2Fwishlist");
      return;
    }

    try {
      saveWishlist([]);

      setError("");

      setMessage(
        "Wishlist cleared successfully."
      );
    } catch {
      setError(
        "Unable to clear wishlist."
      );
    }
  }

  // ==========================================
  // MOVE TO CART
  // ==========================================

  async function moveToCart(
    item: WishlistItem
  ) {
    if (movingId !== null) return;

    if (!isValidUser(getAuthSnapshot())) {
      router.push("/login?next=%2Fwishlist");
      return;
    }

    setMovingId(item.id);
    setError("");
    setMessage("");

    try {
      // Handles BOTH DummyJSON and
      // custom BUY NEST products.

      const product =
        await getProductForCart(item.id);

      // CHECK STOCK

      if (product.stock <= 0) {
        setError(
          `${product.title} is out of stock.`
        );

        return;
      }

      // READ EXISTING CART

      const cart = readCart();

      const existingIndex =
        cart.findIndex(
          (cartItem) =>
            cartItem.id === product.id
        );

      // UPDATE EXISTING PRODUCT

      if (existingIndex >= 0) {
        const existing =
          cart[existingIndex];

        if (
          existing.quantity >= product.stock
        ) {
          setError(
            "Maximum available quantity is already in your cart."
          );

          return;
        }

        cart[existingIndex] = {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity: existing.quantity + 1,
        };
      } else {
        // ADD NEW PRODUCT

        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity: 1,
        });
      }

      // SAVE CART

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event(CART_EVENT)
      );

      // REMOVE FROM WISHLIST

      const currentWishlist =
        parseWishlist(
          localStorage.getItem(
            WISHLIST_KEY
          ) ?? "[]"
        );

      const updatedWishlist =
        currentWishlist.filter(
          (wishlistItem) =>
            wishlistItem.id !== item.id
        );

      saveWishlist(updatedWishlist);

      setMessage(
        `${product.title} moved to cart!`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to move product to cart."
      );
    } finally {
      setMovingId(null);
    }
  }

  // ==========================================
  // LOGIN PROTECTION
  // ==========================================

  if (!loggedIn) {
    return (
      <>
        <Header />

        <main className="flex min-h-[65vh] items-center justify-center bg-[#faf9f7] px-5">
          <div className="text-center">
            <Loader2
              size={34}
              className="mx-auto animate-spin text-orange-600"
            />

            <p className="mt-4 text-sm text-stone-600">
              Checking your account...
            </p>
          </div>
        </main>
      </>
    );
  }

  // ==========================================
  // PAGE DESIGN
  // ==========================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* ====================================
            WISHLIST BANNER
        ==================================== */}

        <section className="bg-[#f6e9da] px-5 py-14 md:py-20">

          <div className="mx-auto max-w-7xl">

            {/* BREADCRUMB */}

            <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">

              <Link
                href="/"
                className="hover:text-orange-600"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-orange-600">
                Wishlist
              </span>
            </div>

            {/* TITLE */}

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">

                <Heart
                  size={35}
                  className="fill-orange-100 text-orange-600"
                />
              </div>

              <div>

                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-600">
                  Your Favorites
                </p>

                <h1 className="text-4xl font-black text-stone-900 md:text-5xl">
                  My Wishlist
                </h1>

                <p className="mt-3 text-stone-600">
                  All your favorite finds in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================
            WISHLIST CONTENT
        ==================================== */}

        <section className="mx-auto max-w-7xl px-5 py-12">

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800"
            >

              <CheckCircle2 size={20} />

              <span>{message}</span>

              {message.includes(
                "moved to cart"
              ) && (
                <Link
                  href="/cart"
                  className="ml-auto font-bold underline"
                >
                  View Cart
                </Link>
              )}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-red-50 p-4 font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {/* ====================================
              EMPTY WISHLIST
          ==================================== */}

          {wishlist.length === 0 ? (

            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">

              <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-orange-50">

                <Heart
                  size={55}
                  className="text-orange-500"
                />
              </div>

              <h2 className="text-3xl font-black text-stone-900">
                Your Wishlist is Empty
              </h2>

              <p className="mt-4 max-w-md leading-7 text-stone-500">
                Save products you love and find them here
                whenever you&apos;re ready to shop.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-700"
              >
                Explore Products

                <ArrowRight size={19} />
              </Link>
            </div>

          ) : (
            <>
              {/* ====================================
                  WISHLIST TOOLBAR
              ==================================== */}

              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

                <div>
                  <h2 className="text-2xl font-black text-stone-900">
                    Saved Products
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    {wishlist.length}{" "}

                    {wishlist.length === 1
                      ? "product"
                      : "products"}{" "}

                    saved
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearWishlist}
                  disabled={movingId !== null}
                  className="flex items-center gap-2 font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={18} />

                  Clear Wishlist
                </button>
              </div>

              {/* ====================================
                  WISHLIST PRODUCT GRID
              ==================================== */}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {wishlist.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="relative aspect-square bg-[#f7f4ef]">

                      <Link
                        href={`/products/${item.id}`}
                        className="block h-full w-full"
                      >
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>

                      {/* REMOVE FROM WISHLIST */}

                      <button
                        type="button"
                        onClick={() =>
                          removeFromWishlist(item.id)
                        }
                        disabled={movingId !== null}
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="absolute right-3 top-3 rounded-full bg-white p-3 text-red-500 shadow-md transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Heart
                          size={20}
                          fill="currentColor"
                        />
                      </button>
                    </div>

                    {/* ====================================
                        PRODUCT INFORMATION
                    ==================================== */}

                    <div className="p-5">

                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-600">
                        BUY NEST Collection
                      </p>

                      <Link
                        href={`/products/${item.id}`}
                      >
                        <h3 className="line-clamp-2 min-h-12 text-lg font-bold text-stone-900 hover:text-orange-600">
                          {item.title}
                        </h3>
                      </Link>

                      {/* RATING */}

                      <div className="mt-3 flex items-center gap-2">

                        <Star
                          size={17}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-sm font-semibold">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* PRICE */}

                      <p className="mt-5 text-2xl font-black text-stone-900">
                        {formatPrice(item.price)}
                      </p>

                      {/* MOVE TO CART */}

                      <button
                        type="button"
                        onClick={() =>
                          void moveToCart(item)
                        }
                        disabled={movingId !== null}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {movingId === item.id ? (
                          <>
                            <Loader2
                              size={19}
                              className="animate-spin"
                            />

                            Moving...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={19} />

                            Move to Cart
                          </>
                        )}
                      </button>

                      {/* PRODUCT LINK */}

                      <Link
                        href={`/products/${item.id}`}
                        className="mt-4 block text-center text-sm font-semibold text-stone-500 hover:text-orange-600"
                      >
                        View Product Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* ====================================
                  CONTINUE SHOPPING
              ==================================== */}

              <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-stone-200 pt-8">

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 font-semibold text-stone-700 hover:text-orange-600"
                >
                  <ArrowLeft size={19} />

                  Continue Shopping
                </Link>

                <Link
                  href="/cart"
                  className="inline-flex items-center gap-3 rounded-xl bg-stone-900 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
                >
                  <ShoppingCart size={19} />

                  View Cart

                  <ArrowRight size={17} />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      {/* ====================================
          FOOTER
      ==================================== */}

      <footer className="bg-stone-900 px-5 py-10 text-center text-white">

        <h2 className="text-2xl font-black">
          BUY{" "}

          <span className="text-orange-500">
            NEST.
          </span>
        </h2>

        <p className="mt-3 text-sm text-stone-400">
          Your next favorite is waiting.
        </p>

        <p className="mt-5 text-xs text-stone-500">
          © 2026 BUY NEST. All rights reserved.
        </p>
      </footer>
    </>
  );
}
