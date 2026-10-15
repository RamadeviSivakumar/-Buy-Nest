
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShoppingBag,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type DemoAccount = {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
};

// ============================================
// STORAGE KEYS
// ============================================

const ACCOUNTS_KEY = "buynest-demo-accounts";
const USER_KEY = "buynest-demo-user";

// ============================================
// PASSWORD HELPERS
// ============================================

function hexToBytes(
  hex: string
): Uint8Array<ArrayBuffer> {
  if (
    hex.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hex)
  ) {
    throw new Error("Invalid salt");
  }

  const bytes = new Uint8Array(
    hex.length / 2
  );

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(
      hex.slice(i * 2, i * 2 + 2),
      16
    );
  }

  return bytes;
}

async function hashPassword(
  password: string,
  saltHex: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const salt = hexToBytes(saltHex);

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

// ============================================
// READ REGISTERED ACCOUNTS
// ============================================

function getAccounts(): DemoAccount[] {
  try {
    const saved = localStorage.getItem(
      ACCOUNTS_KEY
    );

    const parsed: unknown = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (account): account is DemoAccount =>
        account !== null &&
        typeof account === "object" &&
        typeof account.id === "string" &&
        typeof account.name === "string" &&
        typeof account.email === "string" &&
        typeof account.salt === "string" &&
        typeof account.passwordHash === "string"
    );
  } catch {
    return [];
  }
}

// ============================================
// SAFE RETURN PATH
// ============================================

// Example:
// /login?next=%2Fproducts%2F1
//
// After successful login, return to /products/1.

function getReturnPath(): string {
  const params = new URLSearchParams(
    window.location.search
  );

  const next = params.get("next");

  // Only allow internal website paths.
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    /[\r\n]/.test(next)
  ) {
    return "/";
  }

  return next;
}

// ============================================
// LOGIN PAGE
// ============================================

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // LOGIN HANDLER
  // ============================================

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    setLoading(true);

    try {
      // Find the registered account.
      const accounts = getAccounts();

      const account = accounts.find(
        (user) =>
          user.email.toLowerCase() === cleanEmail
      );

      if (!account) {
        setError(
          "Account not found. Please register first."
        );
        return;
      }

      // Check the entered password.
      const enteredHash = await hashPassword(
        password,
        account.salt
      );

      if (
        enteredHash !== account.passwordHash
      ) {
        setError(
          "Incorrect password. Please try again."
        );
        return;
      }

      // Save the same user session used
      // by the BUY NEST account system.
      const loggedInUser = {
        id: account.id,
        name: account.name,
        email: account.email,
      };

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser)
      );

      // Notify components such as Header.
      window.dispatchEvent(
        new Event("buynest-auth-updated")
      );

      // IMPORTANT:
      // Return to the intended page instead
      // of always returning to the homepage.
      const returnPath = getReturnPath();

      router.replace(returnPath);
    } catch {
      setError(
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-xl border border-stone-200 bg-white py-4 pl-12 pr-12 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRANDING */}

        <section className="hidden flex-col justify-between bg-[#f6e9da] p-12 lg:flex xl:p-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-3xl font-black"
          >
            <ShoppingBag
              size={32}
              className="text-orange-600"
            />

            BUY{" "}
            <span className="text-orange-600">
              NEST.
            </span>
          </Link>

          <div>
            <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-orange-700">
              <Sparkles size={17} />
              Welcome Back to BUY NEST
            </span>

            <h1 className="text-5xl font-black leading-tight xl:text-6xl">
              Discover.
              <br />
              Shop.
              <br />
              <span className="text-orange-600">
                Fall in Love.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-stone-600">
              Sign in to explore your favorite
              products, manage your wishlist and
              enjoy your personalized shopping
              experience.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <ShieldCheck
                size={24}
                className="text-orange-600"
              />

              <span className="font-medium text-stone-700">
                Your Shopping Journey Starts Here
              </span>
            </div>
          </div>

          <p className="text-sm text-stone-500">
            © 2026 BUY NEST
          </p>
        </section>

        {/* RIGHT LOGIN FORM */}

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-2xl font-black lg:hidden"
            >
              <ShoppingBag className="text-orange-600" />
              BUY NEST.
            </Link>

            <p className="font-bold uppercase tracking-widest text-orange-600">
              Welcome Back
            </p>

            <h2 className="mt-3 text-4xl font-black text-stone-900">
              Sign In
            </h2>

            <p className="mt-3 text-stone-500">
              Login with your registered email
              and password.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-9 space-y-6"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-semibold text-stone-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                    placeholder="Enter registered email"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-semibold text-stone-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600"
                >
                  {error}
                </p>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 py-4 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}

                <ArrowRight size={19} />
              </button>
            </form>

            {/* REGISTER LINK */}

            <p className="mt-8 text-center text-stone-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-orange-600 hover:underline"
              >
                Create Account
              </Link>
            </p>

            {/* HOME LINK */}

            <Link
              href="/"
              className="mt-8 block text-center text-sm text-stone-500 hover:text-orange-600"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
