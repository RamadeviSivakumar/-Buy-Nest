
"use client";

import {
  useState,
  useSyncExternalStore,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ShoppingBag,
  Heart,
  PackageCheck,
  CircleUserRound,
  Menu,
  X,
  LogOut,
  Home,
  Store,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type DemoUser = {
  id: string;
  name: string;
  email: string;
};

// ============================================
// STORAGE
// ============================================

const USER_KEY = "buynest-demo-user";
const AUTH_EVENT = "buynest-auth-updated";

// ============================================
// AUTH SUBSCRIPTION
// ============================================

function subscribe(callback: () => void) {
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

function getSnapshot() {
  try {
    return (
      localStorage.getItem(USER_KEY) ?? ""
    );
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

// ============================================
// READ USER
// ============================================

function parseUser(raw: string): DemoUser | null {
  try {
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

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
      typeof user.name !== "string" ||
      typeof user.email !== "string" ||
      !user.email.trim()
    ) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}

// ============================================
// HEADER
// ============================================

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const user = parseUser(session);

  const firstName =
    user?.name.trim().split(/\s+/)[0] || "Customer";

  // ============================================
  // LOGOUT
  // ============================================

  function handleLogout() {
    localStorage.removeItem(USER_KEY);

    window.dispatchEvent(
      new Event(AUTH_EVENT)
    );

    setMobileMenuOpen(false);

    router.replace("/login");
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  // ============================================
  // NAVIGATION STYLES
  // ============================================

  const navLinkStyle =
    "relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-orange-50 hover:text-orange-600";

  const iconLinkStyle =
    "group flex h-11 w-11 items-center justify-center rounded-xl text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600";

  const mobileLinkStyle =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-orange-50 hover:text-orange-600";

  return (
    <>
      {/* =====================================
          ANNOUNCEMENT BAR
      ===================================== */}

      <div className="border-b border-stone-800 bg-stone-900 px-4 py-2.5 text-center text-xs text-white">

        <div className="flex items-center justify-center gap-2">
          <Sparkles
            size={13}
            className="text-orange-400"
          />

          <span className="tracking-wide">
            Welcome to{" "}
            <span className="font-bold text-orange-400">
              BUY NEST
            </span>
            {" "}— Discover your next favorite!
          </span>
        </div>
      </div>

      {/* =====================================
          MAIN HEADER
      ===================================== */}

      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-xl">

        {/* IMPORTANT:
            Full-width header, not max-w-7xl.
            This moves the logo closer
            to the left corner.
        */}

        <nav className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 lg:py-4 2xl:px-10">

          {/* =====================================
              LEFT: BIGGER BRAND LOGO
          ===================================== */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="BUY NEST Home"
            className="group flex shrink-0 flex-col justify-center"
          >

            <div className="flex items-center whitespace-nowrap text-[28px] font-black leading-none tracking-[-1.5px] text-[#193525] transition-transform duration-300 group-hover:scale-[1.03] sm:text-[34px] lg:text-[39px]">

              <span>
                BUY
              </span>

              <span className="ml-2 text-orange-600">
                NEST.
              </span>
            </div>

            {/* SMALL BRAND TAGLINE */}

            <p className="mt-1.5 hidden text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 sm:block">
              Discover Your Favorites
            </p>
          </Link>

          {/* =====================================
              CENTER: DESKTOP NAVIGATION
          ===================================== */}

          <div className="hidden flex-1 items-center justify-center gap-3 lg:flex">

            <Link
              href="/"
              aria-current={
                pathname === "/"
                  ? "page"
                  : undefined
              }
              className={`${navLinkStyle} ${
                pathname === "/"
                  ? "bg-orange-50 text-orange-600"
                  : "text-stone-700"
              }`}
            >
              Home
            </Link>

            <Link
              href="/products"
              aria-current={
                pathname === "/products"
                  ? "page"
                  : undefined
              }
              className={`${navLinkStyle} ${
                pathname === "/products" ||
                pathname.startsWith("/category")
                  ? "bg-orange-50 text-orange-600"
                  : "text-stone-700"
              }`}
            >
              Shop
            </Link>
          </div>

          {/* =====================================
              RIGHT: DESKTOP ACTIONS
          ===================================== */}

          <div className="hidden shrink-0 items-center gap-2 lg:flex">

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              title="Wishlist"
              aria-label="My Wishlist"
              className={iconLinkStyle}
            >
              <Heart size={23} />
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              title="Shopping Cart"
              aria-label="Shopping Cart"
              className={iconLinkStyle}
            >
              <ShoppingBag size={23} />
            </Link>

            {/* ORDERS */}

            <Link
              href="/orders"
              title="My Orders"
              aria-label="My Orders"
              className={iconLinkStyle}
            >
              <PackageCheck size={23} />
            </Link>

            {/* VERTICAL DIVIDER */}

            <div className="mx-2 h-9 w-px bg-stone-200" />

            {/* =====================================
                LOGGED IN USER
            ===================================== */}

            {user ? (
              <>

                {/* MY ACCOUNT */}

                <Link
                  href="/account"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-orange-50"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                    <CircleUserRound size={25} />
                  </div>

                  <div className="flex max-w-36 flex-col text-left">

                    <span className="truncate text-xs font-medium text-stone-500">
                      Hello, {firstName}
                    </span>

                    <span className="text-sm font-black text-stone-900 transition group-hover:text-orange-600">
                      My Account
                    </span>
                  </div>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={19} />
                </button>
              </>
            ) : (
              <>

                {/* LOGIN */}

                <Link
                  href="/login"
                  className="rounded-xl px-4 py-3 text-sm font-bold text-stone-800 transition hover:text-orange-600"
                >
                  Login
                </Link>

                {/* REGISTER */}

                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* =====================================
              MOBILE ACTIONS
          ===================================== */}

          <div className="flex items-center gap-2 lg:hidden">

            {/* MOBILE CART QUICK ACCESS */}

            <Link
              href="/cart"
              onClick={closeMobileMenu}
              title="Shopping Cart"
              aria-label="Shopping Cart"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <ShoppingBag size={23} />
            </Link>

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="buynest-mobile-menu"
              onClick={() =>
                setMobileMenuOpen((previous) =>
                  !previous
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 transition hover:border-orange-400 hover:text-orange-600"
            >
              {mobileMenuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>
          </div>
        </nav>

        {/* =====================================
            MOBILE DROPDOWN
        ===================================== */}

        {mobileMenuOpen && (
          <div
            id="buynest-mobile-menu"
            className="absolute left-0 right-0 top-full z-50 border-t border-stone-100 bg-white shadow-2xl lg:hidden"
          >

            <div className="max-h-[75vh] space-y-1 overflow-y-auto px-4 py-5 sm:px-6">

              {/* HOME */}

              <Link
                href="/"
                onClick={closeMobileMenu}
                className={mobileLinkStyle}
              >
                <Home size={20} />
                Home
              </Link>

              {/* SHOP */}

              <Link
                href="/products"
                onClick={closeMobileMenu}
                className={mobileLinkStyle}
              >
                <Store size={20} />
                Shop Products
              </Link>

              {/* DIVIDER */}

              <div className="my-3 border-t border-stone-100" />

              {/* WISHLIST */}

              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className={mobileLinkStyle}
              >
                <Heart size={20} />
                My Wishlist
              </Link>

              {/* CART */}

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className={mobileLinkStyle}
              >
                <ShoppingBag size={20} />
                My Cart
              </Link>

              {/* ORDERS */}

              <Link
                href="/orders"
                onClick={closeMobileMenu}
                className={mobileLinkStyle}
              >
                <PackageCheck size={20} />
                My Orders
              </Link>

              {/* ACCOUNT AREA */}

              <div className="mt-4 border-t border-stone-100 pt-4">

                {user ? (
                  <>

                    {/* USER INFORMATION */}

                    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f7eee4] p-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-orange-600">
                        <CircleUserRound size={28} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-stone-900">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-stone-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* PROFILE LINK */}

                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className={mobileLinkStyle}
                    >
                      <CircleUserRound size={20} />
                      My Account
                    </Link>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>

                    {/* LOGIN */}

                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className={mobileLinkStyle}
                    >
                      <CircleUserRound size={20} />
                      Login
                    </Link>

                    {/* REGISTER */}

                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700"
                    >
                      Create Account
                      <ArrowRight size={18} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
