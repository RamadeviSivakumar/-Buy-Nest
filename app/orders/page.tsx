
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";

import {
  Package,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  CalendarDays,
  MapPin,
  CreditCard,
  ChevronDown,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type OrderItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type DemoUser = {
  id: string;
  name: string;
  email: string;
};

type Order = {
  orderId: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "upi" | "card";
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;

  // Added by the updated Checkout page.
  // Older orders may not have these fields.
  userId?: string;
  userEmail?: string;
};

// ============================================
// STORAGE KEYS
// ============================================

const USER_KEY = "buynest-demo-user";
const ORDERS_KEY = "buynest-orders";
const LAST_ORDER_KEY = "buynest-last-order";

const LOGIN_URL = "/login?next=%2Forders";

// ============================================
// FORMAT HELPERS
// ============================================

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function paymentLabel(
  method: Order["paymentMethod"]
) {
  const labels = {
    cod: "Cash on Delivery (Demo)",
    upi: "UPI (Demo)",
    card: "Credit / Debit Card (Demo)",
  };

  return labels[method] || "Demo Payment";
}

// ============================================
// READ LOGGED-IN USER
// ============================================

function getLoggedInUser(): DemoUser | null {
  try {
    const saved = localStorage.getItem(USER_KEY);

    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const user = parsed as Partial<DemoUser>;

    if (
      typeof user.id !== "string" ||
      !user.id.trim() ||
      typeof user.email !== "string" ||
      !user.email.trim()
    ) {
      return null;
    }

    return {
      id: user.id,
      name:
        typeof user.name === "string"
          ? user.name
          : "",
      email: user.email,
    };
  } catch {
    return null;
  }
}

// ============================================
// VALIDATE ORDER DATA
// ============================================

function isValidOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") {
    return false;
  }

  const order = value as Partial<Order>;
  const address = order.shippingAddress;

  if (
    !address ||
    typeof address !== "object"
  ) {
    return false;
  }

  if (
    !Array.isArray(order.items) ||
    !order.items.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const product = item as Partial<OrderItem>;

      return (
        typeof product.id === "number" &&
        typeof product.title === "string" &&
        typeof product.thumbnail === "string" &&
        typeof product.price === "number" &&
        Number.isFinite(product.price) &&
        typeof product.quantity === "number" &&
        Number.isInteger(product.quantity) &&
        product.quantity > 0
      );
    })
  ) {
    return false;
  }

  return (
    typeof order.orderId === "string" &&
    typeof order.createdAt === "string" &&
    typeof order.total === "number" &&
    Number.isFinite(order.total) &&
    typeof order.subtotal === "number" &&
    Number.isFinite(order.subtotal) &&
    typeof order.shippingFee === "number" &&
    Number.isFinite(order.shippingFee) &&
    typeof order.tax === "number" &&
    Number.isFinite(order.tax) &&
    typeof address.fullName === "string" &&
    typeof address.addressLine1 === "string" &&
    typeof address.city === "string" &&
    typeof address.state === "string" &&
    typeof address.pincode === "string" &&
    typeof address.country === "string" &&
    (order.paymentMethod === "cod" ||
      order.paymentMethod === "upi" ||
      order.paymentMethod === "card")
  );
}

// ============================================
// READ SAVED ORDERS
// ============================================

function readStoredOrders(): Order[] {
  let history: unknown = [];
  let lastOrder: unknown = null;

  try {
    const saved = localStorage.getItem(ORDERS_KEY);

    history = saved ? JSON.parse(saved) : [];
  } catch {
    history = [];
  }

  try {
    const saved = localStorage.getItem(
      LAST_ORDER_KEY
    );

    lastOrder = saved ? JSON.parse(saved) : null;
  } catch {
    lastOrder = null;
  }

  const savedHistory = Array.isArray(history)
    ? history
    : [];

  // Include the latest order if it has not
  // been added to the history array yet.
  const combined: unknown[] = [
    ...savedHistory,
    lastOrder,
  ];

  const seen = new Set<string>();

  return combined
    .filter(isValidOrder)
    .filter((order) => {
      if (seen.has(order.orderId)) {
        return false;
      }

      seen.add(order.orderId);
      return true;
    });
}

// ============================================
// FILTER ORDERS FOR CURRENT USER
// ============================================

function loadOrdersForUser(
  user: DemoUser
): Order[] {
  const allOrders = readStoredOrders();

  const currentEmail = user.email
    .trim()
    .toLowerCase();

  return allOrders
    .filter((order) => {
      // Only show orders explicitly linked
      // to the currently signed-in account.
      //
      // Do not use shipping email as proof
      // of order ownership.
      return (
        order.userId === user.id &&
        typeof order.userEmail === "string" &&
        order.userEmail.trim().toLowerCase() ===
          currentEmail
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

// ============================================
// ORDERS PAGE
// ============================================

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [authorized, setAuthorized] =
    useState(false);

  // ============================================
  // LOGIN CHECK + LOAD USER ORDERS
  // ============================================

  useEffect(() => {
    function checkAuthAndLoadOrders() {
      const user = getLoggedInUser();

      if (!user) {
        setAuthorized(false);
        setOrders([]);
        setLoaded(true);

        router.replace(LOGIN_URL);
        return;
      }

      const currentUserOrders =
        loadOrdersForUser(user);

      setOrders(currentUserOrders);
      setAuthorized(true);
      setLoaded(true);
    }

    checkAuthAndLoadOrders();

    // Refresh when login/logout changes.
    window.addEventListener(
      "buynest-auth-updated",
      checkAuthAndLoadOrders
    );

    // Refresh when storage changes in
    // another browser tab.
    window.addEventListener(
      "storage",
      checkAuthAndLoadOrders
    );

    return () => {
      window.removeEventListener(
        "buynest-auth-updated",
        checkAuthAndLoadOrders
      );

      window.removeEventListener(
        "storage",
        checkAuthAndLoadOrders
      );
    };
  }, [router]);

  // ============================================
  // AUTHENTICATION LOADING SCREEN
  // ============================================

  if (!loaded || !authorized) {
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
              Sign in to view your orders.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ============================================
  // ORDER HISTORY UI
  // ============================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* PAGE BANNER */}

        <section className="bg-[#f6e9da] px-5 py-16">
          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
              <Link
                href="/"
                className="hover:text-orange-600"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-orange-600">
                My Orders
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white p-4">
                <Package
                  size={35}
                  className="text-orange-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                  Purchase History
                </p>

                <h1 className="mt-2 text-4xl font-black text-stone-900 md:text-5xl">
                  My Orders
                </h1>

                <p className="mt-3 text-stone-600">
                  View all your previous BUY NEST
                  demo orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}

        <section className="mx-auto max-w-7xl px-5 py-12">

          {orders.length === 0 ? (

            /* EMPTY ORDER HISTORY */

            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center">
              <ShoppingBag
                size={65}
                className="text-orange-500"
              />

              <h2 className="mt-6 text-3xl font-black">
                No Orders Yet
              </h2>

              <p className="mt-4 max-w-md text-stone-500">
                Your completed demo orders will
                appear here.
              </p>

              <Link
                href="/products"
                className="mt-8 flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-700"
              >
                Start Shopping
                <ArrowRight size={19} />
              </Link>
            </div>

          ) : (
            <>

              {/* ORDER COUNT */}

              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    Order History
                  </h2>

                  <p className="mt-2 text-stone-500">
                    {orders.length}{" "}
                    {orders.length === 1
                      ? "order"
                      : "orders"}{" "}
                    placed
                  </p>
                </div>

                <Link
                  href="/products"
                  className="flex items-center gap-2 font-bold text-orange-600"
                >
                  Continue Shopping
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* ORDER CARDS */}

              <div className="space-y-7">
                {orders.map((order) => (
                  <article
                    key={order.orderId}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                  >

                    {/* ORDER HEADER */}

                    <div className="flex flex-wrap items-start justify-between gap-4 bg-[#f7f4ef] p-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Order Number
                        </p>

                        <h3 className="mt-2 text-lg font-black text-stone-900">
                          {order.orderId}
                        </h3>

                        <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                          <CalendarDays size={16} />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        <CheckCircle2
                          size={16}
                          className="mr-1 inline"
                        />

                        {order.status ||
                          "Demo Order Placed"}
                      </div>
                    </div>

                    {/* PURCHASED PRODUCTS */}

                    <div className="divide-y divide-stone-100 px-6">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-5 py-5"
                        >
                          <Link
                            href={`/products/${item.id}`}
                            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f4ef]"
                          >
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              sizes="96px"
                              className="object-contain p-2"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.id}`}
                              className="font-bold text-stone-900 hover:text-orange-600"
                            >
                              {item.title}
                            </Link>

                            <p className="mt-2 text-sm text-stone-500">
                              Quantity: {item.quantity}
                            </p>

                            <p className="mt-2 font-black text-orange-600">
                              {formatPrice(
                                item.price * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ORDER TOTAL */}

                    <div className="flex flex-wrap items-center justify-between gap-5 border-t border-stone-100 p-6">
                      <div>
                        <p className="text-sm text-stone-500">
                          Order Total
                        </p>

                        <p className="mt-1 text-2xl font-black text-orange-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <PackageCheck size={20} />
                        Demo Order Confirmed
                      </div>
                    </div>

                    {/* EXPANDABLE DETAILS */}

                    <details className="group border-t border-stone-100">
                      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-bold text-stone-700 hover:text-orange-600">
                        View Order Details

                        <ChevronDown
                          size={20}
                          className="transition-transform group-open:rotate-180"
                        />
                      </summary>

                      <div className="grid gap-8 border-t border-stone-100 bg-[#faf9f7] p-6 md:grid-cols-2">

                        {/* SHIPPING ADDRESS */}

                        <div>
                          <h4 className="mb-4 flex items-center gap-2 font-black">
                            <MapPin
                              size={19}
                              className="text-orange-600"
                            />
                            Shipping Address
                          </h4>

                          <p className="font-bold">
                            {order.shippingAddress.fullName}
                          </p>

                          <p className="mt-2 leading-7 text-stone-600">
                            {order.shippingAddress.addressLine1}
                            <br />

                            {order.shippingAddress.addressLine2 && (
                              <>
                                {order.shippingAddress.addressLine2}
                                <br />
                              </>
                            )}

                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}
                            <br />
                            {order.shippingAddress.pincode},{" "}
                            {order.shippingAddress.country}
                          </p>
                        </div>

                        {/* PAYMENT SUMMARY */}

                        <div>
                          <h4 className="mb-4 flex items-center gap-2 font-black">
                            <CreditCard
                              size={19}
                              className="text-orange-600"
                            />
                            Payment & Summary
                          </h4>

                          <p className="mb-5 text-sm text-stone-600">
                            {paymentLabel(
                              order.paymentMethod
                            )}
                          </p>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>
                                {formatPrice(
                                  order.subtotal
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span>
                                {formatPrice(
                                  order.shippingFee
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Demo Tax</span>
                              <span>
                                {formatPrice(
                                  order.tax
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between border-t border-stone-200 pt-3 font-black">
                              <span>Total</span>
                              <span>
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </>
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
      </footer>
    </>
  );
}
