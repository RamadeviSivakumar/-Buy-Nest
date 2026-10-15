
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type DemoAccount = {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
};

const ACCOUNTS_KEY = "buynest-demo-accounts";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return {
    salt: toHex(salt),
    passwordHash: toHex(new Uint8Array(hash)),
  };
}

function getAccounts(): DemoAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is DemoAccount =>
            value &&
            typeof value.id === "string" &&
            typeof value.email === "string" &&
            typeof value.passwordHash === "string" &&
            typeof value.salt === "string"
        )
      : [];
  } catch {
    return [];
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        "Password needs 8 characters, uppercase, lowercase and a number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const accounts = getAccounts();

      if (
        accounts.some(
          (account) => account.email === cleanEmail
        )
      ) {
        setError("Email already registered. Please login.");
        return;
      }

      const credential = await hashPassword(password);

      const newAccount: DemoAccount = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        ...credential,
      };

      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify([...accounts, newAccount])
      );

      // Registration completed: go to Login.
      router.push("/login?registered=1");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-xl border border-stone-200 bg-white py-4 pl-12 pr-12 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Branding */}
        <section className="hidden flex-col justify-between bg-[#f6e9da] p-12 lg:flex xl:p-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-3xl font-black"
          >
            <ShoppingBag
              size={32}
              className="text-orange-600"
            />
            BUY <span className="text-orange-600">NEST.</span>
          </Link>

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-orange-700">
              <Sparkles size={17} />
              Start Your Shopping Journey
            </div>

            <h1 className="text-5xl font-black leading-tight xl:text-6xl">
              Join the
              <br />
              World of
              <br />
              <span className="text-orange-600">
                BUY NEST.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-stone-600">
              Create your account to explore products,
              save favorites and enjoy a personalized
              shopping experience.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Discover exciting products",
                "Create your personal wishlist",
                "Track your demo orders",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={22}
                    className="text-orange-600"
                  />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-stone-500">
            © 2026 BUY NEST
          </p>
        </section>

        {/* Register Form */}
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
              Get Started
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Create Account
            </h2>

            <p className="mt-3 text-stone-500">
              Register to continue your shopping journey.
            </p>

            <form
              onSubmit={handleRegister}
              className="mt-9 space-y-5"
            >
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-2 block font-semibold">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block font-semibold">
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    autoComplete="email"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block font-semibold">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    autoComplete="new-password"
                    className={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
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

                <p className="mt-2 text-xs text-stone-500">
                  Minimum 8 characters, uppercase, lowercase
                  and a number.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-semibold"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className={inputStyle}
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight size={19} />
              </button>
            </form>

            <p className="mt-8 text-center text-stone-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-orange-600"
              >
                Sign In
              </Link>
            </p>

            <Link
              href="/"
              className="mt-8 block text-center text-sm text-stone-500"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
