
import { notFound } from "next/navigation";

import Header from "@/components/Header";

import ProductDetailClient, {
  type ProductDetail,
} from "@/components/ProductDetailClient";

import {
  getDemoProductById,
} from "@/lib/demoProducts";

// ============================================
// TYPES
// ============================================

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================
// FETCH PRODUCT DETAILS
// ============================================

async function getProduct(
  id: string
): Promise<ProductDetail | null> {

  // ==========================================
  // STEP 1: CHECK OUR CUSTOM DEMO CATALOG
  // ==========================================

  // Gaming and Home Appliances products are
  // stored in lib/demoProducts.ts.
  //
  // Example IDs:
  // 900001 - Gaming Controller
  // 900002 - Gaming Keyboard
  // 900101 - Refrigerator
  // 900102 - Washing Machine

  const demoProduct = getDemoProductById(id);

  if (demoProduct) {
    return demoProduct;
  }

  // ==========================================
  // STEP 2: FETCH NORMAL DUMMYJSON PRODUCTS
  // ==========================================

  // Custom demo IDs start at 900001.
  // Do not send unknown demo IDs to DummyJSON.

  const numericId = Number(id);

  if (numericId >= 900000) {
    return null;
  }

  try {
    const response = await fetch(
      `https://dummyjson.com/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        "Failed to fetch product details"
      );
    }

    const product: ProductDetail =
      await response.json();

    // Validate required product fields

    if (
      !product ||
      typeof product.id !== "number" ||
      !product.thumbnail ||
      typeof product.price !== "number" ||
      typeof product.stock !== "number"
    ) {
      return null;
    }

    return product;
  } catch (error) {
    console.error(
      "Product details fetch failed:",
      error
    );

    throw error;
  }
}

// ============================================
// PRODUCT DETAILS PAGE
// ============================================

export default async function ProductPage({
  params,
}: PageProps) {

  const { id } = await params;

  // ==========================================
  // VALIDATE PRODUCT ID
  // ==========================================

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  if (!Number.isSafeInteger(Number(id))) {
    notFound();
  }

  // ==========================================
  // GET PRODUCT
  // ==========================================

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // ==========================================
  // RENDER PRODUCT DETAILS
  // ==========================================

  return (
    <>
      {/* SHARED HEADER */}

      <Header />

      {/* =====================================
          PRODUCT DETAILS
      ===================================== */}

      <ProductDetailClient
        key={product.id}
        product={product}
      />

      {/* =====================================
          FOOTER
      ===================================== */}

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
