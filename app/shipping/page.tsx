
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/components/Header";

import {
  MapPin,
  UserRound,
  Mail,
  Phone,
  House,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

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

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

type DemoUser = {
  id: string;
  name: string;
  email: string;
};

// ============================================
// STORAGE KEYS
// ============================================

const USER_KEY = "buynest-demo-user";
const AUTH_EVENT = "buynest-auth-updated";

const SHIPPING_KEY = "buynest-shipping";
const CART_KEY = "buynest-cart";

const LOGIN_URL = "/login?next=%2Fshipping";

// ============================================
// EMPTY ADDRESS
// ============================================

const emptyAddress: ShippingAddress = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  instructions: "",
};

// ============================================
// AUTHENTICATION HELPER
// ============================================

function getDemoUser(): DemoUser | null {
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
      name: typeof user.name === "string" ? user.name : "",
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
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const product = item as Partial<CartItem>;

      return (
        typeof product.id === "number" &&
        Number.isFinite(product.id) &&
        typeof product.title === "string" &&
        typeof product.price === "number" &&
        Number.isFinite(product.price) &&
        product.price >= 0 &&
        typeof product.stock === "number" &&
        Number.isFinite(product.stock) &&
        typeof product.quantity === "number" &&
        Number.isInteger(product.quantity) &&
        product.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

// ============================================
// RESTORE SHIPPING ADDRESS
// ============================================

function readShippingAddress(
  user: DemoUser
): ShippingAddress {
  const initial: ShippingAddress = {
    ...emptyAddress,
    fullName: user.name,
    email: user.email,
  };

  try {
    const saved = localStorage.getItem(SHIPPING_KEY);

    if (!saved) return initial;

    const parsed: unknown = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return initial;
    }

    const data = parsed as Partial<ShippingAddress>;

    // Do not show another demo user's saved address.
    if (
      typeof data.email !== "string" ||
      data.email.trim().toLowerCase() !==
        user.email.trim().toLowerCase()
    ) {
      return initial;
    }

    const restored = { ...initial };

    for (const key of Object.keys(
      emptyAddress
    ) as (keyof ShippingAddress)[]) {
      if (typeof data[key] === "string") {
        restored[key] = data[key];
      }
    }

    restored.country = "India";

    return restored;
  } catch {
    return initial;
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
// SHIPPING PAGE
// ============================================

export default function ShippingPage() {
  const router = useRouter();

  const [address, setAddress] =
    useState<ShippingAddress>(emptyAddress);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // CHECK LOGIN AND LOAD SHIPPING DETAILS
  // ============================================

  useEffect(() => {
    const user = getDemoUser();

    // Guest users cannot access Shipping.
    if (!user) {
      setAuthorized(false);
      router.replace(LOGIN_URL);
      return;
    }

    setAuthorized(true);
    setAddress(readShippingAddress(user));
    setCart(readCart());
    setLoaded(true);

    // Detect logout from Header or another tab.
    function checkAuth() {
      if (!getDemoUser()) {
        setAuthorized(false);
        router.replace(LOGIN_URL);
      }
    }

    window.addEventListener(AUTH_EVENT, checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener(AUTH_EVENT, checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [router]);

  // ============================================
  // UPDATE FORM FIELD
  // ============================================

  function updateField(
    field: keyof ShippingAddress,
    value: string
  ) {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  // ============================================
  // ADDRESS VALIDATION
  // ============================================

  function validateAddress(): string {
    if (address.fullName.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        address.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (address.addressLine1.trim().length < 5) {
      return "Please enter your full street address.";
    }

    if (!address.city.trim() || !address.state.trim()) {
      return "Please enter your city and state.";
    }

    if (
      !/^[1-9]\d{5}$/.test(address.pincode.trim())
    ) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  }

  // ============================================
  // CONTINUE TO CHECKOUT
  // ============================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    // Recheck login before saving the address.
    const user = getDemoUser();

    if (!user) {
      router.replace(LOGIN_URL);
      return;
    }

    const latestCart = readCart();
    setCart(latestCart);

    if (latestCart.length === 0) {
      setError("Your cart is empty. Add products first.");
      return;
    }

    if (
      latestCart.some(
        (item) =>
          item.stock <= 0 ||
          item.quantity > item.stock
      )
    ) {
      setError(
        "Some products exceed available stock. Update your cart."
      );
      return;
    }

    const validationError = validateAddress();

    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanAddress: ShippingAddress = {
      fullName: address.fullName.trim(),
      email: address.email.trim().toLowerCase(),
      phone: address.phone.trim(),
      addressLine1: address.addressLine1.trim(),
      addressLine2: address.addressLine2.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      country: "India",
      instructions: address.instructions.trim(),
    };

    try {
      localStorage.setItem(
        SHIPPING_KEY,
        JSON.stringify(cleanAddress)
      );

      router.push("/checkout");
    } catch {
      setError(
        "Unable to save your shipping details. Please try again."
      );
    }
  }

  // ============================================
  // ORDER SUMMARY
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

  // ============================================
  // TAILWIND STYLES
  // ============================================

  const inputStyle =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-stone-700";

  // ============================================
  // AUTHENTICATION LOADING
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

            <p className="mt-3 text-stone-500">
              Please wait while we verify your
              demo login.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ============================================
  // SHIPPING PAGE UI
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
                Shipping
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-4">
                <Truck
                  size={34}
                  className="text-orange-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                  Checkout Step 1
                </p>

                <h1 className="mt-2 text-3xl font-black text-stone-900 md:text-5xl">
                  Shipping Details
                </h1>

                <p className="mt-3 text-stone-600">
                  Tell us where to deliver your order.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-12">

          {/* CHECKOUT PROGRESS */}

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

            <span className="text-stone-300">→</span>

            <span className="rounded-full bg-orange-100 px-4 py-2 text-orange-700">
              2. Shipping
            </span>

            <span className="text-stone-300">→</span>

            <span className="text-stone-400">
              3. Checkout
            </span>
          </div>

          {cart.length === 0 ? (

            /* EMPTY CART */

            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-20 text-center">
              <ShoppingBag
                size={60}
                className="mx-auto text-orange-500"
              />

              <h2 className="mt-6 text-3xl font-black">
                Your Cart is Empty
              </h2>

              <p className="mt-3 text-stone-500">
                Add products to your cart before
                entering shipping details.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white hover:bg-orange-700"
              >
                Explore Categories
                <ArrowRight size={18} />
              </Link>
            </div>

          ) : (

            /* SHIPPING FORM + ORDER SUMMARY */

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">

              {/* LEFT: SHIPPING FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-8"
              >

                {/* CUSTOMER INFORMATION */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-7 flex items-center gap-3">
                    <UserRound
                      size={24}
                      className="text-orange-600"
                    />

                    <h2 className="text-2xl font-black">
                      Contact Information
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* FULL NAME */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="fullName"
                        className={labelStyle}
                      >
                        Full Name *
                      </label>

                      <input
                        id="fullName"
                        type="text"
                        required
                        minLength={2}
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={address.fullName}
                        onChange={(e) =>
                          updateField(
                            "fullName",
                            e.target.value
                          )
                        }
                        className={inputStyle}
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className={labelStyle}
                      >
                        <Mail
                          size={15}
                          className="mr-1 inline"
                        />
                        Email Address *
                      </label>

                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={address.email}
                        onChange={(e) =>
                          updateField(
                            "email",
                            e.target.value
                          )
                        }
                        className={inputStyle}
                      />
                    </div>

                    {/* PHONE */}

                    <div>
                      <label
                        htmlFor="phone"
                        className={labelStyle}
                      >
                        <Phone
                          size={15}
                          className="mr-1 inline"
                        />
                        Mobile Number *
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        autoComplete="tel-national"
                        placeholder="10-digit mobile number"
                        value={address.phone}
                        onChange={(e) =>
                          updateField(
                            "phone",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </section>

                {/* DELIVERY ADDRESS */}

                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-7 flex items-center gap-3">
                    <MapPin
                      size={24}
                      className="text-orange-600"
                    />

                    <h2 className="text-2xl font-black">
                      Delivery Address
                    </h2>
                  </div>

                  <div className="space-y-5">

                    {/* STREET ADDRESS */}

                    <div>
                      <label
                        htmlFor="address1"
                        className={labelStyle}
                      >
                        <House
                          size={15}
                          className="mr-1 inline"
                        />
                        Street Address *
                      </label>

                      <input
                        id="address1"
                        type="text"
                        required
                        autoComplete="address-line1"
                        placeholder="House number, building, street"
                        value={address.addressLine1}
                        onChange={(e) =>
                          updateField(
                            "addressLine1",
                            e.target.value
                          )
                        }
                        className={inputStyle}
                      />
                    </div>

                    {/* APARTMENT / LANDMARK */}

                    <div>
                      <label
                        htmlFor="address2"
                        className={labelStyle}
                      >
                        Apartment / Landmark (Optional)
                      </label>

                      <input
                        id="address2"
                        type="text"
                        autoComplete="address-line2"
                        placeholder="Apartment, floor, nearby landmark"
                        value={address.addressLine2}
                        onChange={(e) =>
                          updateField(
                            "addressLine2",
                            e.target.value
                          )
                        }
                        className={inputStyle}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      {/* CITY */}

                      <div>
                        <label
                          htmlFor="city"
                          className={labelStyle}
                        >
                          City *
                        </label>

                        <input
                          id="city"
                          type="text"
                          required
                          autoComplete="address-level2"
                          placeholder="Enter city"
                          value={address.city}
                          onChange={(e) =>
                            updateField(
                              "city",
                              e.target.value
                            )
                          }
                          className={inputStyle}
                        />
                      </div>

                      {/* STATE */}

                      <div>
                        <label
                          htmlFor="state"
                          className={labelStyle}
                        >
                          State *
                        </label>

                        <input
                          id="state"
                          type="text"
                          required
                          autoComplete="address-level1"
                          placeholder="Enter state"
                          value={address.state}
                          onChange={(e) =>
                            updateField(
                              "state",
                              e.target.value
                            )
                          }
                          className={inputStyle}
                        />
                      </div>

                      {/* PIN CODE */}

                      <div>
                        <label
                          htmlFor="pincode"
                          className={labelStyle}
                        >
                          PIN Code *
                        </label>

                        <input
                          id="pincode"
                          type="text"
                          required
                          inputMode="numeric"
                          maxLength={6}
                          pattern="[1-9][0-9]{5}"
                          autoComplete="postal-code"
                          placeholder="6-digit PIN code"
                          value={address.pincode}
                          onChange={(e) =>
                            updateField(
                              "pincode",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className={inputStyle}
                        />
                      </div>

                      {/* COUNTRY */}

                      <div>
                        <label
                          htmlFor="country"
                          className={labelStyle}
                        >
                          Country
                        </label>

                        <input
                          id="country"
                          type="text"
                          value="India"
                          readOnly
                          className={`${inputStyle} bg-stone-100 text-stone-500`}
                        />
                      </div>
                    </div>

                    {/* DELIVERY INSTRUCTIONS */}

                    <div>
                      <label
                        htmlFor="instructions"
                        className={labelStyle}
                      >
                        Delivery Instructions (Optional)
                      </label>

                      <textarea
                        id="instructions"
                        rows={3}
                        placeholder="Any special delivery instructions..."
                        value={address.instructions}
                        onChange={(e) =>
                          updateField(
                            "instructions",
                            e.target.value
                          )
                        }
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </section>

                {/* VALIDATION ERROR */}

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </p>
                )}

                {/* NAVIGATION BUTTONS */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/cart"
                    className="inline-flex items-center justify-center gap-2 font-bold text-stone-600 hover:text-orange-600"
                  >
                    <ArrowLeft size={19} />
                    Back to Cart
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-700"
                  >
                    Continue to Checkout
                    <ArrowRight size={19} />
                  </button>
                </div>
              </form>

              {/* RIGHT: ORDER SUMMARY */}

              <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="text-2xl font-black">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 border-b border-stone-100 pb-4"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold">
                        {formatPrice(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Total Items</span>
                    <span className="font-bold">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Shipping</span>
                    <span>At checkout</span>
                  </div>

                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Taxes</span>
                    <span>At checkout</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200 pt-5">
                    <span className="text-lg font-bold">
                      Subtotal
                    </span>

                    <span className="text-2xl font-black text-orange-600">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-7 rounded-xl bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={22}
                      className="shrink-0 text-orange-600"
                    />

                    <p className="text-xs leading-6 text-stone-600">
                      This is a demo checkout.
                      No real payment or delivery
                      takes place.
                    </p>
                  </div>
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
