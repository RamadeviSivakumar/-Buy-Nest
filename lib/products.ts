import type { Product, ProductsResponse } from "@/types/product";

const API_URL = "https://dummyjson.com/products?limit=20";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(API_URL, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Products request failed (${response.status})`);
  }

  const data: ProductsResponse = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error("Invalid product response from DummyJSON");
  }

  return data.products;
}
