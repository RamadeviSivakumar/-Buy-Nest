
"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  UserRound,
  Mail,
  Heart,
  ShoppingBag,
  PackageCheck,
  MapPin,
  LogOut,
  ArrowRight,
  CircleUserRound,
} from "lucide-react";

type DemoUser = {
  id?: string;
  name: string;
  email: string;
};

const USER_KEY = "buynest-demo-user";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("buynest-auth-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("buynest-auth-updated", callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

function parseUser(raw: string): DemoUser | null {
  try {
    if (!raw) return null;

    const user = JSON.parse(raw);

    if (
      typeof user.name !== "string" ||
      typeof user.email !== "string"
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

const accountLinks = [
  {
    name: "My Orders",
    description: "View your order history",
    href: "/orders",
    icon: PackageCheck,
  },
  {
    name: "My Wishlist",
    description: "Products you've saved",
    href: "/wishlist",
    icon: Heart,
  },
  {
    name: "My Cart",
    description: "Review your shopping cart",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    name: "Shipping Details",
    description: "Manage delivery information",
    href: "/shipping",
    icon: MapPin,
  },
];

export default function AccountPage() {
  const router = useRouter();

  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const user = parseUser(session);

  function handleLogout() {
    localStorage.removeItem(USER_KEY);

    window.dispatchEvent(
      new Event("buynest-auth-updated")
    );

    router.replace("/login");
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9f7]">

        {/* Page Banner */}
        <section className="bg-[#f6e9da] px-5 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-bold uppercase tracking-widest text-orange-600">
              Customer Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black text-stone-900 md:text-5xl">
              My Account
            </h1>

            <p className="mt-4 text-stone-600">
              Manage your profile and shopping activities.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-12">

          {!user ? (
            /* Guest View */
            <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
              <CircleUserRound
                size={64}
                className="mx-auto text-orange-600"
              />

              <h2 className="mt-6 text-3xl font-black">
                Please Login First
              </h2>

              <p className="mt-4 text-stone-500">
                Sign in to view your BUY NEST account.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white"
              >
                Go to Login
                <ArrowRight size={19} />
              </Link>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-10">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <UserRound
                      size={45}
                      className="text-orange-600"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-orange-600">
                      Welcome Back!
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-stone-900">
                      {user.name}
                    </h2>

                    <p className="mt-2 text-stone-500">
                      {user.email}
                    </p>

                    <span className="mt-4 inline-block rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                      Demo Account
                    </span>
                  </div>
                </div>
              </section>

              {/* Personal Information */}
              <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                <h3 className="text-2xl font-black">
                  Personal Information
                </h3>

                <div className="mt-7 grid gap-6 md:grid-cols-2">

                  <div className="rounded-xl bg-[#faf9f7] p-5">
                    <div className="flex items-center gap-2 text-stone-500">
                      <UserRound size={19} />
                      <span className="text-sm">
                        Full Name
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-bold">
                      {user.name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#faf9f7] p-5">
                    <div className="flex items-center gap-2 text-stone-500">
                      <Mail size={19} />
                      <span className="text-sm">
                        Email Address
                      </span>
                    </div>

                    <p className="mt-3 break-all text-lg font-bold">
                      {user.email}
                    </p>
                  </div>
                </div>
              </section>

              {/* Account Features */}
              <section className="mt-10">
                <h3 className="text-2xl font-black">
                  My Shopping Dashboard
                </h3>

                <p className="mt-2 text-stone-500">
                  Access your shopping information.
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {accountLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-5 rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg"
                      >
                        <div className="rounded-xl bg-orange-50 p-4">
                          <Icon
                            size={26}
                            className="text-orange-600"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-bold">
                            {item.name}
                          </h4>

                          <p className="mt-1 text-sm text-stone-500">
                            {item.description}
                          </p>
                        </div>

                        <ArrowRight
                          size={20}
                          className="shrink-0 text-stone-400 transition group-hover:text-orange-600"
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Logout */}
              <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="text-xl font-black">
                  Account Settings
                </h3>

                <p className="mt-3 text-sm text-stone-500">
                  Sign out of your current BUY NEST demo session.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-6 inline-flex items-center gap-3 rounded-xl bg-red-50 px-7 py-4 font-bold text-red-600 hover:bg-red-100"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="bg-stone-900 px-5 py-10 text-center text-white">
        <h2 className="text-2xl font-black">
          BUY <span className="text-orange-500">NEST.</span>
        </h2>
        <p className="mt-3 text-sm text-stone-400">
          Your next favorite is waiting.
        </p>
      </footer>
    </>
  );
}
