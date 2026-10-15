
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type Review = {
  rating: number;
  comment: string;
  reviewerName: string;
  date?: string;
};

export type ProductDetail = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  thumbnail: string;
  images?: string[];
  reviews?: Review[];
  shippingInformation?: string;
  returnPolicy?: string;
  warrantyInformation?: string;
  availabilityStatus?: string;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
  quantity: number;
};

type WishlistItem = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  rating: number;
};

type PendingAction = {
  kind: "cart" | "wishlist";
  productId: number;
  quantity: number;
  createdAt: number;
};

type Feedback = {
  text: string;
  type: "success" | "error";
};

// ============================================
// STORAGE KEYS
// ============================================

const AUTH_KEY = "buynest-demo-user";
const CART_KEY = "buynest-cart";
const WISHLIST_KEY = "buynest-wishlist";

const PENDING_ACTION_KEY =
  "buynest-pending-product-action";

const CART_EVENT = "buynest-cart-updated";
const WISHLIST_EVENT =
  "buynest-wishlist-updated";

const AUTH_EVENT = "buynest-auth-updated";

// ============================================
// STORAGE HELPERS
// ============================================

function readItems<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);
    const parsed: unknown = saved
      ? JSON.parse(saved)
      : [];

    return Array.isArray(parsed)
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

// ============================================
// CHECK DEMO LOGIN
// ============================================

function isLoggedIn(): boolean {
  try {
    const saved = localStorage.getItem(AUTH_KEY);

    if (!saved) return false;

    const parsed: unknown = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return false;
    }

    const user = parsed as {
      id?: unknown;
      email?: unknown;
    };

    return (
      typeof user.id === "string" &&
      user.id.trim().length > 0 &&
      typeof user.email === "string" &&
      user.email.trim().length > 0
    );
  } catch {
    return false;
  }
}

// ============================================
// SAVE ACTION BEFORE LOGIN
// ============================================

function rememberPendingAction(
  action: PendingAction
) {
  try {
    sessionStorage.setItem(
      PENDING_ACTION_KEY,
      JSON.stringify(action)
    );
  } catch {
    // Login can still proceed if session
    // storage is unavailable.
  }
}

// ============================================
// ADD PRODUCT TO CART
// ============================================

function addProductToCart(
  product: ProductDetail,
  requestedQuantity: number
) {
  if (product.stock <= 0) {
    throw new Error("Product is out of stock.");
  }

  const quantity = Math.max(
    1,
    Math.min(
      Math.floor(requestedQuantity),
      product.stock
    )
  );

  const cartItem: CartItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail,
    stock: product.stock,
    quantity,
  };

  const currentCart =
    readItems<CartItem>(CART_KEY);

  const existingIndex = currentCart.findIndex(
    (item) => item.id === product.id
  );

  if (existingIndex >= 0) {
    const existing = currentCart[existingIndex];

    currentCart[existingIndex] = {
      ...cartItem,
      quantity: Math.min(
        existing.quantity + quantity,
        product.stock
      ),
    };
  } else {
    currentCart.push(cartItem);
  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(currentCart)
  );

  window.dispatchEvent(
    new Event(CART_EVENT)
  );
}

// ============================================
// SAVE OR REMOVE WISHLIST ITEM
// ============================================

function updateProductWishlist(
  product: ProductDetail,
  mode: "toggle" | "add"
): boolean {
  const wishlist =
    readItems<WishlistItem>(WISHLIST_KEY);

  const exists = wishlist.some(
    (item) => item.id === product.id
  );

  // When returning from login, "add"
  // must not accidentally remove an item.
  const shouldSave =
    mode === "add" || !exists;

  let updatedWishlist: WishlistItem[];

  if (shouldSave) {
    updatedWishlist = exists
      ? wishlist
      : [
          ...wishlist,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            rating: product.rating,
          },
        ];
  } else {
    updatedWishlist = wishlist.filter(
      (item) => item.id !== product.id
    );
  }

  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(updatedWishlist)
  );

  window.dispatchEvent(
    new Event(WISHLIST_EVENT)
  );

  return shouldSave;
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
// PRODUCT DETAILS COMPONENT
// ============================================

export default function ProductDetailClient({
  product,
}: {
  product: ProductDetail;
}) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] =
    useState(0);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const images = Array.from(
    new Set(
      [
        ...(product.images ?? []),
        product.thumbnail,
      ].filter(Boolean)
    )
  );

  const inStock = product.stock > 0;

  // ============================================
  // REFRESH WISHLIST STATE
  // ============================================

  useEffect(() => {
    function refreshWishlist() {
      if (!isLoggedIn()) {
        setIsWishlisted(false);
        return;
      }

      const wishlist =
        readItems<WishlistItem>(WISHLIST_KEY);

      setIsWishlisted(
        wishlist.some(
          (item) => item.id === product.id
        )
      );
    }

    refreshWishlist();

    window.addEventListener(
      WISHLIST_EVENT,
      refreshWishlist
    );

    window.addEventListener(
      AUTH_EVENT,
      refreshWishlist
    );

    window.addEventListener(
      "storage",
      refreshWishlist
    );

    return () => {
      window.removeEventListener(
        WISHLIST_EVENT,
        refreshWishlist
      );

      window.removeEventListener(
        AUTH_EVENT,
        refreshWishlist
      );

      window.removeEventListener(
        "storage",
        refreshWishlist
      );
    };
  }, [product.id]);

  // ============================================
  // COMPLETE ACTION AFTER LOGIN
  // ============================================

  useEffect(() => {
    if (!isLoggedIn()) return;

    let pending: PendingAction | null = null;

    try {
      const saved = sessionStorage.getItem(
        PENDING_ACTION_KEY
      );

      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        sessionStorage.removeItem(
          PENDING_ACTION_KEY
        );
        return;
      }

      const action = parsed as Partial<PendingAction>;

      if (
        (action.kind !== "cart" &&
          action.kind !== "wishlist") ||
        typeof action.productId !== "number" ||
        typeof action.quantity !== "number" ||
        !Number.isInteger(action.quantity) ||
        action.quantity < 1 ||
        typeof action.createdAt !== "number" ||
        !Number.isFinite(action.createdAt)
      ) {
        sessionStorage.removeItem(
          PENDING_ACTION_KEY
        );
        return;
      }

      pending = action as PendingAction;

      // Only process the action on the
      // product originally selected.
      if (pending.productId !== product.id) {
        return;
      }

      // Remove first to prevent processing
      // the same action twice.
      sessionStorage.removeItem(
        PENDING_ACTION_KEY
      );

      // Ignore actions older than 10 minutes.
      if (
        Date.now() - pending.createdAt >
          10 * 60 * 1000 ||
        pending.createdAt > Date.now()
      ) {
        return;
      }

      if (pending.kind === "cart") {
        addProductToCart(
          product,
          pending.quantity
        );

        setFeedback({
          type: "success",
          text: `${product.title} added to cart!`,
        });
      } else {
        updateProductWishlist(
          product,
          "add"
        );

        setIsWishlisted(true);

        setFeedback({
          type: "success",
          text: `${product.title} added to wishlist!`,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text:
          "Unable to complete the saved action. Please try again.",
      });
    }
  }, [product]);

  // ============================================
  // REDIRECT GUEST TO LOGIN
  // ============================================

  function redirectToLogin(
    kind: PendingAction["kind"]
  ) {
    rememberPendingAction({
      kind,
      productId: product.id,
      quantity,
      createdAt: Date.now(),
    });

    const returnPath = `/products/${product.id}`;

    router.push(
      `/login?next=${encodeURIComponent(returnPath)}`
    );
  }

  // ============================================
  // QUANTITY
  // ============================================

  function increaseQuantity() {
    setQuantity((previous) =>
      Math.min(previous + 1, product.stock)
    );
  }

  function decreaseQuantity() {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  }

  // ============================================
  // ADD TO CART - LOGIN REQUIRED
  // ============================================

  function handleAddToCart() {
    if (!inStock) return;

    setFeedback(null);

    if (!isLoggedIn()) {
      redirectToLogin("cart");
      return;
    }

    try {
      addProductToCart(
        product,
        quantity
      );

      setFeedback({
        type: "success",
        text: `${product.title} added to cart!`,
      });
    } catch {
      setFeedback({
        type: "error",
        text:
          "Unable to save cart. Please try again.",
      });
    }
  }

  // ============================================
  // WISHLIST - LOGIN REQUIRED
  // ============================================

  function handleWishlist() {
    setFeedback(null);

    if (!isLoggedIn()) {
      redirectToLogin("wishlist");
      return;
    }

    try {
      const saved = updateProductWishlist(
        product,
        "toggle"
      );

      setIsWishlisted(saved);

      setFeedback({
        type: "success",
        text: saved
          ? "Added to wishlist!"
          : "Removed from wishlist.",
      });
    } catch {
      setFeedback({
        type: "error",
        text:
          "Unable to update wishlist. Please try again.",
      });
    }
  }

  // ============================================
  // PRODUCT DETAILS UI
  // ============================================

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-5 py-10">

        {/* BREADCRUMB */}

        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link
            href="/"
            className="hover:text-orange-600"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="hover:text-orange-600"
          >
            Categories
          </Link>

          <span>/</span>

          <span className="font-semibold text-orange-600">
            {product.title}
          </span>
        </div>

        {/* BACK BUTTON */}

        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Back to Categories
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">

          {/* LEFT: PRODUCT IMAGE GALLERY */}

          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <Image
                src={
                  images[activeImage] ??
                  product.thumbnail
                }
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-contain p-8"
              />

              {product.discountPercentage > 0 && (
                <span className="absolute left-5 top-5 rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white">
                  {product.discountPercentage.toFixed(0)}%
                  {" "}OFF
                </span>
              )}
            </div>

            {/* THUMBNAILS */}

            <div className="mt-5 flex flex-wrap gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveImage(index)
                  }
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={
                    activeImage === index
                  }
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-white transition ${
                    activeImage === index
                      ? "border-orange-600"
                      : "border-stone-200 hover:border-orange-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} image ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFORMATION */}

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              {product.brand || product.category}
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-stone-900 md:text-5xl">
              {product.title}
            </h1>

            {/* RATING */}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Star
                size={20}
                className="fill-amber-400 text-amber-400"
              />

              <span className="font-bold">
                {product.rating.toFixed(1)} / 5
              </span>

              <span className="text-sm text-stone-500">
                {product.reviews?.length ?? 0} reviews
              </span>
            </div>

            {/* PRICE */}

            <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">
              <p className="text-sm font-semibold text-stone-500">
                Product Price
              </p>

              <h2 className="mt-2 text-4xl font-black text-stone-900">
                {formatPrice(product.price)}
              </h2>

              {product.discountPercentage > 0 && (
                <p className="mt-2 font-semibold text-green-700">
                  {product.discountPercentage.toFixed(0)}%
                  {" "}discount
                </p>
              )}
            </div>

            {/* DESCRIPTION */}

            <div className="mt-8">
              <h3 className="text-xl font-bold">
                Product Description
              </h3>

              <p className="mt-3 leading-7 text-stone-600">
                {product.description}
              </p>
            </div>

            {/* STOCK */}

            <div className="mt-7 flex items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {inStock
                  ? "In Stock"
                  : "Out of Stock"}
              </span>

              <p className="text-sm text-stone-500">
                {product.stock} units available
              </p>
            </div>

            {/* QUANTITY */}

            <div className="mt-8">
              <h3 className="mb-4 font-bold">
                Select Quantity
              </h3>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-200 bg-white">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={
                    !inStock || quantity <= 1
                  }
                  className="px-5 py-4 hover:bg-stone-100 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>

                <span className="min-w-12 text-center font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    !inStock ||
                    quantity >= product.stock
                  }
                  className="px-5 py-4 hover:bg-stone-100 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">

              {/* ADD TO CART */}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex items-center justify-center gap-3 rounded-xl bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={21} />
                Add to Cart
              </button>

              {/* WISHLIST */}

              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={isWishlisted}
                className={`flex items-center justify-center gap-3 rounded-xl border-2 px-7 py-4 font-bold transition ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-stone-200 bg-white text-stone-700 hover:border-red-400"
                }`}
              >
                <Heart
                  size={20}
                  fill={
                    isWishlisted
                      ? "currentColor"
                      : "none"
                  }
                />

                {isWishlisted
                  ? "Saved"
                  : "Wishlist"}
              </button>
            </div>

            {/* FEEDBACK */}

            {feedback && (
              <div
                role={
                  feedback.type === "error"
                    ? "alert"
                    : "status"
                }
                className={`mt-5 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                  feedback.type === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {feedback.type === "error" ? (
                  <AlertCircle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}

                {feedback.text}
              </div>
            )}

            {/* SHIPPING, RETURNS, WARRANTY */}

            <div className="mt-10 space-y-5 rounded-2xl border border-stone-200 bg-white p-6">

              <div className="flex items-start gap-4">
                <Truck
                  size={24}
                  className="shrink-0 text-orange-600"
                />

                <div>
                  <h4 className="font-bold">
                    Shipping Information
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    {product.shippingInformation ||
                      "Shipping details unavailable"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <RotateCcw
                  size={24}
                  className="shrink-0 text-orange-600"
                />

                <div>
                  <h4 className="font-bold">
                    Return Policy
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    {product.returnPolicy ||
                      "Return policy unavailable"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck
                  size={24}
                  className="shrink-0 text-orange-600"
                />

                <div>
                  <h4 className="font-bold">
                    Warranty
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    {product.warrantyInformation ||
                      "Warranty details unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT SPECIFICATIONS */}

        <section className="mt-20 rounded-2xl bg-white p-6 md:p-10">
          <h2 className="text-2xl font-black">
            Product Specifications
          </h2>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {[
              ["Product ID", product.id],
              ["Category", product.category],
              [
                "Brand",
                product.brand || "Not specified",
              ],
              [
                "SKU",
                product.sku || "Not specified",
              ],
              ["Stock", product.stock],
              [
                "Rating",
                product.rating.toFixed(1),
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="border-b border-stone-100 pb-4"
              >
                <p className="text-sm text-stone-500">
                  {label}
                </p>

                <p className="mt-2 font-bold capitalize text-stone-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CUSTOMER REVIEWS */}

        <section className="mb-16 mt-14">
          <h2 className="text-2xl font-black">
            Customer Reviews
          </h2>

          {product.reviews &&
          product.reviews.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {product.reviews
                .slice(0, 3)
                .map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-stone-200 bg-white p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <Star
                        size={18}
                        className="fill-amber-400 text-amber-400"
                      />

                      <span className="font-bold">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="leading-7 text-stone-600">
                      {review.comment}
                    </p>

                    <p className="mt-5 font-bold">
                      {review.reviewerName}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-5 text-stone-500">
              No customer reviews available.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
