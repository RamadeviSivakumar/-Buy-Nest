
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";

import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Package,
  LockKeyhole,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type CartItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
  quantity: number;
};

// ============================================
// STORAGE KEYS
// ============================================

const CART_KEY = "buynest-cart";
const CART_EVENT = "buynest-cart-updated";

const USER_KEY = "buynest-demo-user";
const AUTH_EVENT = "buynest-auth-updated";

// ============================================
// CART SUBSCRIPTION
// ============================================

function subscribeToCart(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CART_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CART_EVENT, onChange);
  };
}

function getCartSnapshot() {
  try {
    return localStorage.getItem(CART_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerCartSnapshot() {
  return "[]";
}

// ============================================
// AUTH SUBSCRIPTION
// ============================================

function subscribeToAuth(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_EVENT, onChange);
  };
}

function getAuthSnapshot() {
  try {
    return localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

// null means the browser login check
// has not completed during hydration.
function getServerAuthSnapshot(): string | null {
  return null;
}

// ============================================
// CHECK DEMO LOGIN
// ============================================

function hasDemoLogin(rawUser: string | null) {
  if (!rawUser) return false;

  try {
    const user: unknown = JSON.parse(rawUser);

    if (!user || typeof user !== "object") {
      return false;
    }

    const savedUser = user as {
      id?: unknown;
      email?: unknown;
    };

    return (
      typeof savedUser.id === "string" &&
      savedUser.id.length > 0 &&
      typeof savedUser.email === "string" &&
      savedUser.email.length > 0
    );
  } catch {
    return false;
  }
}

// ============================================
// VALIDATE CART DATA
// ============================================

function parseCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is CartItem => {
        if (!value || typeof value !== "object") {
          return false;
        }

        const item = value as Partial<CartItem>;

        return (
          typeof item.id === "number" &&
          Number.isFinite(item.id) &&
          typeof item.title === "string" &&
          typeof item.thumbnail === "string" &&
          typeof item.price === "number" &&
          Number.isFinite(item.price) &&
          item.price >= 0 &&
          typeof item.stock === "number" &&
          Number.isFinite(item.stock) &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0
        );
      }
    );
  } catch {
    return [];
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
// CART PAGE
// ============================================

export default function CartPage() {
  const router = useRouter();

  const [error, setError] = useState("");

  // ============================================
  // READ CURRENT LOGIN
  // ============================================

  const rawUser = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const checkingLogin = rawUser === null;
  const isLoggedIn = hasDemoLogin(rawUser);

  // Redirect guests to login.
  useEffect(() => {
    if (checkingLogin) return;

    if (!isLoggedIn) {
      router.replace(
        "/login?next=%2Fcart"
      );
    }
  }, [checkingLogin, isLoggedIn, router]);

  // ============================================
  // READ CART
  // ============================================

  const rawCart = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const cart = useMemo(
    () => parseCart(rawCart),
    [rawCart]
  );

  // ============================================
  // SAVE CART
  // ============================================

  function saveCart(updatedCart: CartItem[]) {
    if (!isLoggedIn) {
      router.replace(
        "/login?next=%2Fcart"
      );
      return;
    }

    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(
        new Event(CART_EVENT)
      );

      setError("");
    } catch {
      setError(
        "Unable to update cart. Please try again."
      );
    }
  }

  // ============================================
  // INCREASE QUANTITY
  // ============================================

  function increaseQuantity(id: number) {
    const updatedCart = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.min(
          item.quantity + 1,
          Math.max(1, item.stock)
        ),
      };
    });

    saveCart(updatedCart);
  }

  // ============================================
  // DECREASE QUANTITY
  // ============================================

  function decreaseQuantity(id: number) {
    const updatedCart = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.max(
          1,
          item.quantity - 1
        ),
      };
    });

    saveCart(updatedCart);
  }

  // ============================================
  // REMOVE PRODUCT
  // ============================================

  function removeItem(id: number) {
    saveCart(
      cart.filter((item) => item.id !== id)
    );
  }

  // ============================================
  // CLEAR CART
  // ============================================

  function clearCart() {
    saveCart([]);
  }

  // ============================================
  // TOTALS
  // ============================================

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const canCheckout =
    cart.length > 0 &&
    cart.every(
      (item) =>
        item.stock > 0 &&
        item.quantity <= item.stock
    );

  // ============================================
  // AUTH LOADING / REDIRECT
  // ============================================

  // Never display cart content to a guest.
  // Wait while checking login or redirecting.

  if (checkingLogin || !isLoggedIn) {
    return (
      <>
        <Header />

        <main className="flex min-h-[70vh] items-center justify-center bg-[#faf9f7] px-5">
          <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-sm">
            <LockKeyhole
              size={42}
              className="mx-auto mb-5 text-orange-600"
            />

            <h1 className="text-xl font-bold text-stone-900">
              Checking your account...
            </h1>

            <p className="mt-3 text-sm text-stone-500">
              Please wait while we verify
              your demo login.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ============================================
  // CART UI
  // ============================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* PAGE HEADER */}

        <section className="bg-[#f6e9da] px-5 py-14">
          <div className="mx-auto max-w-7xl">

            <div className="mb-5 flex items-center gap-2 text-sm text-stone-500">
              <Link
                href="/"
                className="hover:text-orange-600"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-orange-600">
                Shopping Cart
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ShoppingBag
                size={40}
                className="text-orange-600"
              />

              <div>
                <h1 className="text-4xl font-black text-stone-900 md:text-5xl">
                  My Shopping Cart
                </h1>

                <p className="mt-2 text-stone-600">
                  Review your products before checkout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CART CONTENT */}

        <section className="mx-auto max-w-7xl px-5 py-12">

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {cart.length === 0 ? (

            /* EMPTY CART */

            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">

              <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-orange-50">
                <ShoppingBag
                  size={56}
                  className="text-orange-500"
                />
              </div>

              <h2 className="text-3xl font-black text-stone-900">
                Your Cart is Empty
              </h2>

              <p className="mt-4 max-w-md leading-7 text-stone-500">
                Looks like you haven&apos;t added
                anything to your cart yet.
                Explore our five shopping
                departments and discover something
                you&apos;ll love!
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-700"
              >
                Start Shopping
                <ArrowRight size={19} />
              </Link>
            </div>

          ) : (

            /* CART ITEMS + SUMMARY */

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

              {/* LEFT: CART ITEMS */}

              <div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-stone-900">
                    Cart Items ({totalItems})
                  </h2>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={17} />
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-5">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row">

                        {/* PRODUCT IMAGE */}

                        <Link
                          href={`/products/${item.id}`}
                          className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-[#f7f4ef] sm:h-36 sm:w-36"
                        >
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 90vw, 144px"
                            className="object-contain p-3"
                          />
                        </Link>

                        {/* PRODUCT INFORMATION */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                                BUY NEST Collection
                              </p>

                              <Link
                                href={`/products/${item.id}`}
                                className="mt-2 block text-lg font-bold text-stone-900 hover:text-orange-600"
                              >
                                {item.title}
                              </Link>

                              <p className="mt-2 text-sm text-stone-500">
                                Product ID: {item.id}
                              </p>
                            </div>

                            {/* REMOVE BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.id)
                              }
                              aria-label={`Remove ${item.title}`}
                              className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          {/* PRICE */}

                          <p className="mt-3 text-xl font-black text-stone-900">
                            {formatPrice(item.price)}
                          </p>

                          {/* QUANTITY */}

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-200">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                disabled={
                                  item.quantity <= 1
                                }
                                aria-label={`Decrease quantity of ${item.title}`}
                                className="p-3 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={17} />
                              </button>

                              <span className="min-w-10 text-center font-bold">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                disabled={
                                  item.stock <= 0 ||
                                  item.quantity >= item.stock
                                }
                                aria-label={`Increase quantity of ${item.title}`}
                                className="p-3 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={17} />
                              </button>
                            </div>

                            {/* ITEM TOTAL */}

                            <div className="text-right">
                              <p className="text-xs text-stone-500">
                                Item Total
                              </p>

                              <p className="text-lg font-black text-orange-600">
                                {formatPrice(
                                  item.price * item.quantity
                                )}
                              </p>
                            </div>
                          </div>

                          {/* STOCK WARNINGS */}

                          {item.quantity > item.stock && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                              Quantity exceeds available stock.
                              Please reduce it.
                            </p>
                          )}

                          {item.stock <= 0 && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                              Currently out of stock.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONTINUE SHOPPING */}

                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center gap-2 font-semibold text-stone-700 hover:text-orange-600"
                >
                  <ArrowLeft size={19} />
                  Continue Shopping
                </Link>
              </div>

              {/* RIGHT: ORDER SUMMARY */}

              <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">

                <h2 className="text-2xl font-black text-stone-900">
                  Order Summary
                </h2>

                <div className="mt-7 space-y-5">

                  <div className="flex justify-between gap-3 text-stone-600">
                    <span>Items ({totalItems})</span>

                    <span className="font-semibold text-stone-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-stone-600">
                    <span>Shipping</span>
                    <span className="text-sm font-medium text-stone-500">
                      At checkout
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-stone-600">
                    <span>Taxes</span>
                    <span className="text-sm font-medium text-stone-500">
                      At checkout
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-bold">
                        Subtotal
                      </span>

                      <span className="text-3xl font-black text-orange-600">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SHIPPING BUTTON */}

                {canCheckout ? (
                  <Link
                    href="/shipping"
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700"
                  >
                    Proceed to Shipping
                    <ArrowRight size={19} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-8 w-full rounded-xl bg-stone-300 px-5 py-4 font-bold text-stone-600"
                  >
                    Update Cart to Continue
                  </button>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-stone-500">
                  Shipping charges and any
                  applicable taxes will be
                  determined during checkout.
                </p>

                {/* SHOPPING INFORMATION */}

                <div className="mt-8 space-y-5 border-t border-stone-100 pt-6">

                  <div className="flex items-start gap-3">
                    <Truck
                      size={22}
                      className="shrink-0 text-orange-600"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        Delivery Details
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Enter your address in the
                        next step.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={22}
                      className="shrink-0 text-orange-600"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        Demo Checkout
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        No real payment is processed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package
                      size={22}
                      className="shrink-0 text-orange-600"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        Review Your Order
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Confirm your products before
                        placing a demo order.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}

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
