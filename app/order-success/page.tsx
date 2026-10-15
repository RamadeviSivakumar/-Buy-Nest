
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";

import {
  CheckCircle2,
  PackageCheck,
  CalendarDays,
  CreditCard,
  MapPin,
  ShoppingBag,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ReceiptText,
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

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  instructions: string;
};

type PaymentMethod = "cod" | "upi" | "card";

type DemoUser = {
  id: string;
  name: string;
  email: string;
};

type DemoOrder = {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;

  // Added by the updated Checkout page.
  userId: string;
  userEmail: string;
};

type AuthStatus =
  | "checking"
  | "authorized"
  | "redirecting";

// ============================================
// STORAGE KEYS
// ============================================

const USER_KEY = "buynest-demo-user";
const ORDER_KEY = "buynest-last-order";

const LOGIN_URL =
  "/login?next=%2Forder-success";

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
// PAYMENT LABEL
// ============================================

function getPaymentLabel(method: PaymentMethod) {
  switch (method) {
    case "cod":
      return "Cash on Delivery (Demo)";

    case "upi":
      return "UPI (Simulation)";

    case "card":
      return "Credit / Debit Card (Simulation)";

    default:
      return "Demo Payment";
  }
}

// ============================================
// READ LOGGED-IN USER
// ============================================

function getLoggedInUser(): DemoUser | null {
  try {
    const saved = localStorage.getItem(USER_KEY);

    if (!saved) {
      return null;
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
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
// READ LAST ORDER FOR CURRENT USER
// ============================================

function readLastOrderForUser(
  user: DemoUser
): DemoOrder | null {
  try {
    const saved = localStorage.getItem(
      ORDER_KEY
    );

    if (!saved) {
      return null;
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const order = parsed as Partial<DemoOrder>;

    // IMPORTANT:
    // Verify ownership before displaying
    // any order details.

    const sameUserId =
      order.userId === user.id;

    const sameUserEmail =
      typeof order.userEmail === "string" &&
      order.userEmail.trim().toLowerCase() ===
        user.email.trim().toLowerCase();

    if (!sameUserId || !sameUserEmail) {
      return null;
    }

    // Validate required order data.

    const address = order.shippingAddress;

    if (
      typeof order.orderId !== "string" ||
      !order.orderId.trim() ||
      typeof order.createdAt !== "string" ||
      !Array.isArray(order.items) ||
      order.items.length === 0 ||
      !address ||
      typeof address !== "object" ||
      typeof address.fullName !== "string" ||
      typeof address.email !== "string" ||
      typeof address.phone !== "string" ||
      typeof address.addressLine1 !== "string" ||
      typeof address.city !== "string" ||
      typeof address.state !== "string" ||
      typeof address.pincode !== "string" ||
      typeof address.country !== "string" ||
      !["cod", "upi", "card"].includes(
        order.paymentMethod ?? ""
      ) ||
      typeof order.subtotal !== "number" ||
      !Number.isFinite(order.subtotal) ||
      typeof order.shippingFee !== "number" ||
      !Number.isFinite(order.shippingFee) ||
      typeof order.tax !== "number" ||
      !Number.isFinite(order.tax) ||
      typeof order.total !== "number" ||
      !Number.isFinite(order.total)
    ) {
      return null;
    }

    const validItems = order.items.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.title === "string" &&
        typeof item.thumbnail === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );

    if (!validItems) {
      return null;
    }

    return order as DemoOrder;
  } catch {
    return null;
  }
}

// ============================================
// ORDER SUCCESS PAGE
// ============================================

export default function OrderSuccessPage() {
  const router = useRouter();

  const [order, setOrder] =
    useState<DemoOrder | null>(null);

  const [authStatus, setAuthStatus] =
    useState<AuthStatus>("checking");

  // ============================================
  // VERIFY LOGIN AND ORDER OWNERSHIP
  // ============================================

  useEffect(() => {
    function checkLoginAndOrder() {
      const user = getLoggedInUser();

      // Guests must log in first.
      if (!user) {
        setOrder(null);
        setAuthStatus("redirecting");

        router.replace(LOGIN_URL);
        return;
      }

      // Only load an order that belongs
      // to the currently logged-in user.
      const currentUserOrder =
        readLastOrderForUser(user);

      setOrder(currentUserOrder);
      setAuthStatus("authorized");
    }

    checkLoginAndOrder();

    // Update when login/logout changes.
    window.addEventListener(
      "buynest-auth-updated",
      checkLoginAndOrder
    );

    // Detect changes from another tab.
    window.addEventListener(
      "storage",
      checkLoginAndOrder
    );

    return () => {
      window.removeEventListener(
        "buynest-auth-updated",
        checkLoginAndOrder
      );

      window.removeEventListener(
        "storage",
        checkLoginAndOrder
      );
    };
  }, [router]);

  // ============================================
  // CALCULATE ORDER DETAILS
  // ============================================

  const totalItems =
    order?.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) ?? 0;

  const formattedDate =
    order &&
    !Number.isNaN(
      new Date(order.createdAt).getTime()
    )
      ? new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(order.createdAt))
      : "Date unavailable";

  // ============================================
  // AUTHENTICATION LOADING
  // ============================================

  if (authStatus !== "authorized") {
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
              Sign in to view your order
              confirmation.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ============================================
  // ORDER SUCCESS UI
  // ============================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* PAGE HEADER */}

        <section className="bg-[#f6e9da] px-5 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-2 text-sm text-stone-500">
              <Link href="/">Home</Link>

              <span>/</span>

              <span className="font-semibold text-orange-600">
                Order Confirmation
              </span>
            </div>

            <h1 className="text-3xl font-black text-stone-900 md:text-5xl">
              Order Confirmation
            </h1>

            <p className="mt-3 text-stone-600">
              Review your BUY NEST demo order.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-12">

          {!order ? (

            /* NO ACCESSIBLE ORDER FOUND */

            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-20 text-center">
              <ShoppingBag
                size={64}
                className="mx-auto text-orange-500"
              />

              <h2 className="mt-7 text-3xl font-black">
                No Order Found
              </h2>

              <p className="mx-auto mt-4 max-w-md leading-7 text-stone-500">
                No recent demo order is available
                for your current account.
                Place a new order to view its
                confirmation here.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white hover:bg-orange-700"
                >
                  Explore Products
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-8 py-4 font-bold text-stone-700 hover:border-orange-400"
                >
                  My Orders
                </Link>
              </div>
            </div>

          ) : (
            <>

              {/* SUCCESS BANNER */}

              <section className="rounded-3xl border border-green-100 bg-white px-6 py-12 text-center shadow-sm md:px-10">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2
                    size={55}
                    className="text-green-600"
                  />
                </div>

                <p className="mt-7 text-sm font-bold uppercase tracking-widest text-green-700">
                  Order Confirmed
                </p>

                <h2 className="mt-3 text-3xl font-black text-stone-900 md:text-5xl">
                  Thank You for Your Order!
                </h2>

                <p className="mx-auto mt-5 max-w-xl leading-7 text-stone-600">
                  Your BUY NEST demo order was
                  created successfully. No actual
                  payment was collected and no
                  products will be shipped.
                </p>

                {/* ORDER ID AND DATE */}

                <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl bg-[#faf9f7] p-5">
                    <ReceiptText
                      size={24}
                      className="mx-auto text-orange-600"
                    />

                    <p className="mt-3 text-sm text-stone-500">
                      Order ID
                    </p>

                    <p className="mt-2 break-all font-black text-stone-900">
                      {order.orderId}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#faf9f7] p-5">
                    <CalendarDays
                      size={24}
                      className="mx-auto text-orange-600"
                    />

                    <p className="mt-3 text-sm text-stone-500">
                      Order Date
                    </p>

                    <p className="mt-2 font-bold text-stone-900">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              </section>

              {/* MAIN ORDER DETAILS */}

              <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">

                {/* LEFT COLUMN */}

                <div className="space-y-7">

                  {/* ORDERED PRODUCTS */}

                  <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <PackageCheck
                        size={25}
                        className="text-orange-600"
                      />

                      <h3 className="text-xl font-black">
                        Ordered Products ({totalItems})
                      </h3>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 py-5 first:pt-0 last:pb-0"
                        >

                          {/* PRODUCT IMAGE */}

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

                          {/* PRODUCT INFORMATION */}

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

                            <p className="mt-1 text-sm text-stone-500">
                              Unit Price:{" "}
                              {formatPrice(item.price)}
                            </p>

                            <p className="mt-2 text-lg font-black text-orange-600">
                              {formatPrice(
                                item.price * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* SHIPPING ADDRESS */}

                  <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <MapPin
                        size={25}
                        className="text-orange-600"
                      />

                      <h3 className="text-xl font-black">
                        Shipping Address
                      </h3>
                    </div>

                    <div className="rounded-xl bg-[#faf9f7] p-5">
                      <p className="text-lg font-bold">
                        {order.shippingAddress.fullName}
                      </p>

                      <p className="mt-3 leading-7 text-stone-600">
                        {order.shippingAddress.addressLine1}

                        {order.shippingAddress.addressLine2 && (
                          <>
                            <br />
                            {order.shippingAddress.addressLine2}
                          </>
                        )}

                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}
                        <br />
                        {order.shippingAddress.pincode}
                        <br />
                        {order.shippingAddress.country}
                      </p>

                      <p className="mt-4 text-sm text-stone-600">
                        Phone:{" "}
                        {order.shippingAddress.phone}
                      </p>

                      <p className="mt-1 text-sm text-stone-600">
                        Email:{" "}
                        {order.shippingAddress.email}
                      </p>

                      {order.shippingAddress.instructions && (
                        <p className="mt-3 text-sm text-stone-500">
                          Instructions:{" "}
                          {order.shippingAddress.instructions}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* PAYMENT METHOD */}

                  <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-orange-50 p-3">
                        <CreditCard
                          size={25}
                          className="text-orange-600"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-black">
                          Payment Method
                        </h3>

                        <p className="mt-3 font-semibold text-stone-700">
                          {getPaymentLabel(
                            order.paymentMethod
                          )}
                        </p>

                        <p className="mt-2 text-sm text-stone-500">
                          No real payment has been
                          processed.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT: ORDER SUMMARY */}

                <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">

                  <h3 className="text-2xl font-black">
                    Order Summary
                  </h3>

                  <div className="mt-7 space-y-5">

                    <div className="flex justify-between gap-3 text-stone-600">
                      <span>Subtotal</span>

                      <span className="font-semibold text-stone-900">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-stone-600">
                      <span>Shipping</span>

                      <span className="font-semibold text-stone-900">
                        {order.shippingFee === 0
                          ? "FREE"
                          : formatPrice(
                              order.shippingFee
                            )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-stone-600">
                      <span>Demo Tax</span>

                      <span className="font-semibold text-stone-900">
                        {formatPrice(order.tax)}
                      </span>
                    </div>

                    <div className="border-t border-stone-200 pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold">
                          Total Paid
                        </span>

                        <span className="text-3xl font-black text-orange-600">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-stone-500">
                        Simulated total; no actual
                        payment.
                      </p>
                    </div>
                  </div>

                  {/* ORDER STATUS */}

                  <div className="mt-7 rounded-xl bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={22}
                        className="text-green-700"
                      />

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Order Status
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY NOTE */}

                  <div className="mt-6 flex items-start gap-3">
                    <Truck
                      size={22}
                      className="shrink-0 text-orange-600"
                    />

                    <p className="text-xs leading-6 text-stone-500">
                      This is a demonstration only.
                      No physical delivery is
                      scheduled.
                    </p>
                  </div>

                  {/* CONTINUE SHOPPING */}

                  <Link
                    href="/products"
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700"
                  >
                    Continue Shopping
                    <ArrowRight size={19} />
                  </Link>

                  {/* MY ORDERS */}

                  <Link
                    href="/orders"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-4 font-bold text-stone-700 hover:border-orange-400 hover:text-orange-600"
                  >
                    <PackageCheck size={19} />
                    View My Orders
                  </Link>

                  {/* BACK TO HOME */}

                  <Link
                    href="/"
                    className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-600"
                  >
                    <ArrowLeft size={17} />
                    Back to Home
                  </Link>

                  <div className="mt-7 flex items-start gap-3 border-t border-stone-100 pt-6">
                    <ShieldCheck
                      size={20}
                      className="shrink-0 text-orange-600"
                    />

                    <p className="text-xs leading-6 text-stone-500">
                      This order is stored locally
                      in your browser for
                      demonstration purposes.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
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
