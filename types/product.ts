export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  discountPercentage: number;
  category: string;
  thumbnail: string;
  brand?: string;
  images: string[];
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
