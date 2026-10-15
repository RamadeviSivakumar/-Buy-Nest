
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
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

type DemoUser = {
  id: string;
  name: string;
  email: string;
};

type PaymentMethod = "cod" | "upi" | "card";

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
  userId?: string;
  userEmail?: string;
};

type AuthStatus =
  | "checking"
  | "signed-in"
  | "redirecting";

// ============================================
// STORAGE KEYS
// ============================================

const USER_KEY = "buynest-demo-user";
const CART_KEY = "buynest-cart";
const SHIPPING_KEY = "buynest-shipping";
const LAST_ORDER_KEY = "buynest-last-order";
const ORDERS_KEY = "buynest-orders";

const LOGIN_URL = "/login?next=%2Fcheckout";

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
// READ LOGGED-IN USER
// ============================================

function readUser(): DemoUser | null {
  try {
    const saved = localStorage.getItem(USER_KEY);

    if (!saved) return null;

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
// READ CART
// ============================================

function readCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);

    const parsed: unknown = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem => {
        if (
          !item ||
          typeof item !== "object"
        ) {
          return false;
        }

        const product = item as Partial<CartItem>;

        return (
          typeof product.id === "number" &&
          Number.isFinite(product.id) &&
          typeof product.title === "string" &&
          typeof product.thumbnail === "string" &&
          typeof product.price === "number" &&
          Number.isFinite(product.price) &&
          product.price >= 0 &&
          typeof product.stock === "number" &&
          Number.isFinite(product.stock) &&
          typeof product.quantity === "number" &&
          Number.isInteger(product.quantity) &&
          product.quantity > 0
        );
      }
    );
  } catch {
    return [];
  }
}

// ============================================
// READ SHIPPING ADDRESS
// ============================================

function readShipping(): ShippingAddress | null {
  try {
    const saved = localStorage.getItem(SHIPPING_KEY);

    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const data =
      parsed as Partial<ShippingAddress>;

    const requiredFields: (
      keyof ShippingAddress
    )[] = [
      "fullName",
      "email",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
      "country",
    ];

    const valid = requiredFields.every(
      (field) => {
        const value = data[field];

        return (
          typeof value === "string" &&
          value.trim().length > 0
        );
      }
    );

    if (!valid) return null;

    if (
      !/^[6-9]\d{9}$/.test(data.phone ?? "") ||
      !/^[1-9]\d{5}$/.test(
        data.pincode ?? ""
      ) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        data.email ?? ""
      )
    ) {
      return null;
    }

    return {
      fullName: data.fullName!,
      email: data.email!,
      phone: data.phone!,
      addressLine1: data.addressLine1!,
      addressLine2: data.addressLine2 ?? "",
      city: data.city!,
      state: data.state!,
      pincode: data.pincode!,
      country: data.country!,
      instructions: data.instructions ?? "",
    };
  } catch {
    return null;
  }
}

// ============================================
// READ EXISTING ORDER HISTORY
// ============================================

function readOrders(): DemoOrder[] {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);

    const parsed: unknown = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is DemoOrder =>
        item !== null &&
        typeof item === "object" &&
        typeof item.orderId === "string"
    );
  } catch {
    return [];
  }
}

// ============================================
// CHECKOUT PAGE
// ============================================

export default function CheckoutPage() {
  const router = useRouter();

  const [authStatus, setAuthStatus] =
    useState<AuthStatus>("checking");

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [address, setAddress] =
    useState<ShippingAddress | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const [placedOrder, setPlacedOrder] =
    useState<DemoOrder | null>(null);

  // Prevent duplicate order submissions.
  const orderLock = useRef(false);

  // ============================================
  // LOGIN CHECK ON PAGE LOAD
  // ============================================

  useEffect(() => {
    function checkLogin() {
      const user = readUser();

      if (!user) {
        setAuthStatus("redirecting");
        setCart([]);
        setAddress(null);
        router.replace(LOGIN_URL);
        return;
      }

      setAuthStatus("signed-in");
      setCart(readCart());
      setAddress(readShipping());
    }

    checkLogin();

    // Respond to login/logout changes.
    window.addEventListener(
      "buynest-auth-updated",
      checkLogin
    );

    window.addEventListener(
      "storage",
      checkLogin
    );

    return () => {
      window.removeEventListener(
        "buynest-auth-updated",
        checkLogin
      );

      window.removeEventListener(
        "storage",
        checkLogin
      );
    };
  }, [router]);

  // ============================================
  // CALCULATE TOTALS
  // ============================================

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const shippingFee =
    subtotal >= 50 ? 0 : 5;

  const tax = 0;

  const grandTotal =
    subtotal + shippingFee + tax;

  const hasStockIssue = cart.some(
    (item) =>
      item.stock <= 0 ||
      item.quantity > item.stock
  );

  // ============================================
  // PLACE DEMO ORDER
  // ============================================

  function handlePlaceOrder() {
    if (orderLock.current || isPlacing) return;

    setError("");

    // IMPORTANT:
    // Never place an order without checking
    // the current login again.
    const user = readUser();

    if (!user) {
      setAuthStatus("redirecting");
      router.replace(LOGIN_URL);
      return;
    }

    const currentCart = readCart();
    const currentAddress = readShipping();

    if (currentCart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!currentAddress) {
      setError(
        "Shipping address is missing. Please complete shipping details."
      );
      return;
    }

    if (
      currentCart.some(
        (item) =>
          item.stock <= 0 ||
          item.quantity > item.stock
      )
    ) {
      setError(
        "Some products exceed available stock. Please update your cart."
      );
      return;
    }

    if (!agreed) {
      setError(
        "Please confirm this is a demo order."
      );
      return;
    }

    const orderSubtotal = currentCart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const orderShipping =
      orderSubtotal >= 50 ? 0 : 5;

    // Attach the logged-in customer to the order.
    const newOrder: DemoOrder = {
      orderId:
        `BN-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      items: currentCart,
      shippingAddress: currentAddress,
      paymentMethod,
      subtotal: orderSubtotal,
      shippingFee: orderShipping,
      tax: 0,
      total: orderSubtotal + orderShipping,
      status: "Demo Order Placed",
    };

    orderLock.current = true;
    setIsPlacing(true);

    try {
      const history = readOrders();

      // Preserve previous orders in the same
      // browser history. Avoid duplicate IDs.
      const updatedHistory = [
        newOrder,
        ...history.filter(
          (order) =>
            order.orderId !== newOrder.orderId
        ),
      ];

      // Save complete history.
      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedHistory)
      );

      // Save latest order for Order Success.
      localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(newOrder)
      );

      // Clear completed cart.
      localStorage.removeItem(CART_KEY);

      window.dispatchEvent(
        new Event("buynest-cart-updated")
      );

      setCart([]);
      setPlacedOrder(newOrder);

      router.replace("/order-success");
    } catch {
      orderLock.current = false;
      setIsPlacing(false);

      setError(
        "Unable to save your demo order. Please try again."
      );
    }
  }

  // ============================================
  // LOGIN REQUIRED SCREEN
  // ============================================

  if (authStatus !== "signed-in") {
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
              Sign in is required before checkout.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ============================================
  // CHECKOUT DESIGN
  // ============================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* PAGE BANNER */}

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

              <Link
                href="/cart"
                className="hover:text-orange-600"
              >
                Cart
              </Link>

              <span>/</span>

              <span className="font-semibold text-orange-600">
                Checkout
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-4">
                <CreditCard
                  size={34}
                  className="text-orange-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                  Final Step
                </p>

                <h1 className="mt-2 text-3xl font-black text-stone-900 md:text-5xl">
                  Secure Demo Checkout
                </h1>

                <p className="mt-3 text-stone-600">
                  Review your order and confirm
                  your purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-12">

          {/* CHECKOUT PROGRESS */}

          {!placedOrder && (
            <div className="mb-10 flex flex-wrap items-center gap-3 text-sm font-semibold">
              <Link
                href="/cart"
                className="text-green-700"
              >
                <CheckCircle2
                  size={17}
                  className="mr-1 inline"
                />
                Cart
              </Link>

              <span className="text-stone-300">
                →
              </span>

              <Link
                href="/shipping"
                className="text-green-700"
              >
                <CheckCircle2
                  size={17}
                  className="mr-1 inline"
                />
                Shipping
              </Link>

              <span className="text-stone-300">
                →
              </span>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-orange-700">
                3. Checkout
              </span>
            </div>
          )}

          {/* SUCCESS BEFORE REDIRECT */}

          {placedOrder ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2
                  size={54}
                  className="text-green-600"
                />
              </div>

              <h2 className="mt-7 text-3xl font-black text-stone-900">
                Demo Order Placed!
              </h2>

              <p className="mt-4 text-stone-600">
                Redirecting to order confirmation...
              </p>

              <div className="mt-8 rounded-2xl bg-[#faf9f7] p-6">
                <p className="text-sm text-stone-500">
                  Order Number
                </p>

                <p className="mt-2 break-all text-xl font-black text-orange-600">
                  {placedOrder.orderId}
                </p>

                <p className="mt-4 text-sm text-stone-500">
                  Order Total
                </p>

                <p className="mt-2 text-2xl font-black">
                  {formatPrice(placedOrder.total)}
                </p>
              </div>
            </div>

          ) : cart.length === 0 ? (

            /* EMPTY CART */

            <div className="rounded-3xl bg-white px-6 py-20 text-center">
              <ShoppingBag
                size={60}
                className="mx-auto text-orange-500"
              />

              <h2 className="mt-6 text-3xl font-black">
                Your Cart is Empty
              </h2>

              <p className="mt-3 text-stone-500">
                Add some products before checking out.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
              >
                Shop Categories
                <ArrowRight size={18} />
              </Link>
            </div>

          ) : !address ? (

            /* MISSING SHIPPING ADDRESS */

            <div className="rounded-3xl bg-white px-6 py-20 text-center">
              <MapPin
                size={55}
                className="mx-auto text-orange-500"
              />

              <h2 className="mt-6 text-3xl font-black">
                Shipping Address Required
              </h2>

              <p className="mt-3 text-stone-500">
                Complete your shipping details
                before proceeding to checkout.
              </p>

              <Link
                href="/shipping"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
              >
                Enter Shipping Address
                <ArrowRight size={18} />
              </Link>
            </div>

          ) : (

            /* CHECKOUT FORM */

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">

              {/* LEFT COLUMN */}

              <div className="space-y-7">

                {/* SHIPPING ADDRESS */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                      <MapPin
                        size={23}
                        className="text-orange-600"
                      />

                      <h2 className="text-xl font-black">
                        Delivery Address
                      </h2>
                    </div>

                    <Link
                      href="/shipping"
                      className="text-sm font-bold text-orange-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="mt-6 rounded-xl bg-[#faf9f7] p-5">
                    <p className="text-lg font-bold">
                      {address.fullName}
                    </p>

                    <p className="mt-3 leading-7 text-stone-600">
                      {address.addressLine1}

                      {address.addressLine2 && (
                        <>
                          <br />
                          {address.addressLine2}
                        </>
                      )}

                      <br />
                      {address.city}, {address.state}
                      <br />
                      {address.pincode}, {address.country}
                    </p>

                    <p className="mt-4 text-sm text-stone-600">
                      Phone: {address.phone}
                    </p>

                    <p className="mt-1 text-sm text-stone-600">
                      Email: {address.email}
                    </p>

                    {address.instructions && (
                      <p className="mt-3 text-sm text-stone-500">
                        Instructions: {address.instructions}
                      </p>
                    )}
                  </div>
                </section>

                {/* PRODUCT REVIEW */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <ShoppingBag
                      size={23}
                      className="text-orange-600"
                    />

                    <h2 className="text-xl font-black">
                      Review Products ({totalItems})
                    </h2>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >

                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f4ef]">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="96px"
                            className="object-contain p-2"
                          />
                        </div>

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
                </section>

                {/* PAYMENT METHOD */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <CreditCard
                      size={23}
                      className="text-orange-600"
                    />

                    <h2 className="text-xl font-black">
                      Payment Method
                    </h2>
                  </div>

                  <p className="mb-5 text-sm text-stone-500">
                    Choose a simulated payment method.
                    No payment details are collected.
                  </p>

                  <div className="space-y-4">

                    {/* CASH ON DELIVERY */}

                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition ${
                        paymentMethod === "cod"
                          ? "border-orange-600 bg-orange-50"
                          : "border-stone-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() =>
                          setPaymentMethod("cod")
                        }
                        className="accent-orange-600"
                      />

                      <Banknote
                        size={26}
                        className="text-orange-600"
                      />

                      <div>
                        <p className="font-bold">
                          Cash on Delivery
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Simulated COD option
                        </p>
                      </div>
                    </label>

                    {/* UPI */}

                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition ${
                        paymentMethod === "upi"
                          ? "border-orange-600 bg-orange-50"
                          : "border-stone-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() =>
                          setPaymentMethod("upi")
                        }
                        className="accent-orange-600"
                      />

                      <Smartphone
                        size={26}
                        className="text-orange-600"
                      />

                      <div>
                        <p className="font-bold">
                          UPI Payment
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Demo only — no UPI transaction
                        </p>
                      </div>
                    </label>

                    {/* CREDIT / DEBIT CARD */}

                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition ${
                        paymentMethod === "card"
                          ? "border-orange-600 bg-orange-50"
                          : "border-stone-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() =>
                          setPaymentMethod("card")
                        }
                        className="accent-orange-600"
                      />

                      <CreditCard
                        size={26}
                        className="text-orange-600"
                      />

                      <div>
                        <p className="font-bold">
                          Credit / Debit Card
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Demo only — no card details needed
                        </p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* ORDER CONFIRMATION */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) =>
                        setAgreed(e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-orange-600"
                    />

                    <span className="text-sm leading-6 text-stone-600">
                      I understand this is a
                      demonstration order.
                      No real payment, shipment,
                      or purchase will occur.
                    </span>
                  </label>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
                    >
                      <AlertCircle
                        size={20}
                        className="shrink-0"
                      />

                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={
                      !agreed ||
                      hasStockIssue ||
                      isPlacing
                    }
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-6 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PackageCheck size={21} />

                    {isPlacing
                      ? "Placing Demo Order..."
                      : "Place Demo Order"}

                    <ArrowRight size={18} />
                  </button>

                  {hasStockIssue && (
                    <p className="mt-4 text-sm font-medium text-red-600">
                      One or more cart quantities
                      exceed available stock.
                      Update your cart.
                    </p>
                  )}
                </section>

                <Link
                  href="/shipping"
                  className="inline-flex items-center gap-2 font-semibold text-stone-600 hover:text-orange-600"
                >
                  <ArrowLeft size={18} />
                  Back to Shipping
                </Link>
              </div>

              {/* RIGHT: ORDER SUMMARY */}

              <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="text-2xl font-black">
                  Order Summary
                </h2>

                <div className="mt-7 space-y-5">

                  <div className="flex items-center justify-between gap-3 text-stone-600">
                    <span>
                      Subtotal ({totalItems} items)
                    </span>

                    <span className="font-bold text-stone-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-stone-600">
                    <span>Demo Shipping</span>

                    <span
                      className={`font-bold ${
                        shippingFee === 0
                          ? "text-green-700"
                          : "text-stone-900"
                      }`}
                    >
                      {shippingFee === 0
                        ? "FREE"
                        : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-stone-600">
                    <span>Demo Tax</span>

                    <span className="font-bold text-stone-900">
                      {formatPrice(tax)}
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xl font-bold">
                        Total
                      </span>

                      <span className="text-3xl font-black text-orange-600">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-xl bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <Truck
                      size={22}
                      className="shrink-0 text-green-700"
                    />

                    <div>
                      <p className="text-sm font-bold text-green-800">
                        Demo Delivery Offer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-green-700">
                        Free simulated shipping
                        on orders of $50 or more.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-3 border-t border-stone-100 pt-6">
                  <ShieldCheck
                    size={22}
                    className="shrink-0 text-orange-600"
                  />

                  <p className="text-xs leading-6 text-stone-500">
                    BUY NEST checkout demonstration.
                    This page does not process
                    actual payments.
                    Prices and totals are illustrative.
                  </p>
                </div>
              </aside>
            </div>
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
