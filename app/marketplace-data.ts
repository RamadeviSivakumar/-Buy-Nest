
/* BUY NEST - Shared marketplace data */

// ----------------------------------------------
// TYPES
// ----------------------------------------------

export type Category = {
  id: string;
  label: string;
  icon: string;
  tint: string;
};

export type Product = {
  id: string;
  category: string;
  title: string;
  price: number;
  previousPrice?: number;
  image: string;
  rating: number;
  subcategory?: string;
  tag?: string;
};

// ----------------------------------------------
// IMAGE HELPER
// ----------------------------------------------

export const image = (photo: string, width = 720) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=82`;

// ----------------------------------------------
// FIVE MAIN CATEGORIES
// ----------------------------------------------

export const categories: Category[] = [
  {
    id: "electronics",
    label: "Electronics",
    icon: "📱",
    tint: "#e6eef9",
  },
  {
    id: "audio-gaming",
    label: "Audio & Gaming",
    icon: "🎧",
    tint: "#ece5f9",
  },
  {
    id: "home-furniture",
    label: "Home & Furniture",
    icon: "🛋️",
    tint: "#eaf0e2",
  },
  {
    id: "accessories",
    label: "Watches & Accessories",
    icon: "⌚",
    tint: "#e5eff0",
  },
  {
    id: "appliances",
    label: "Home Appliances",
    icon: "🏠",
    tint: "#e6f1fa",
  },
];

// Featured categories are the five main categories.

export const featuredCategories: Category[] = categories;

// Compatibility with category pages that import
// otherCategories. No extra departments are used.

export const otherCategories: Category[] = [];

// ----------------------------------------------
// CATEGORY DESCRIPTIONS
// ----------------------------------------------

export const categoryDescriptions: Record<string, string> = {
  electronics:
    "Discover smart phones, laptops, tablets and useful tech for everyday life.",

  "audio-gaming":
    "Explore immersive sound, wireless audio and accessories built for play.",

  "home-furniture":
    "Give every room a fresh feel with comfortable furniture and warm home accents.",

  accessories:
    "Timeless watches, smart wearables and the accessories that complete your look.",

  appliances:
    "Practical appliances and clever helpers to make home life simpler.",
};

// ----------------------------------------------
// SUBCATEGORIES
// ----------------------------------------------

export const categorySubcategories: Record<
  string,
  string[]
> = {
  electronics: [
    "Smartphones",
    "Laptops",
    "Tablets",
    "Cameras",
  ],

  "audio-gaming": [
    "Headphones",
    "Speakers",
    "Gaming",
    "Earbuds",
  ],

  "home-furniture": [
    "Sofas",
    "Home Decor",
    "Lighting",
    "Chairs",
  ],

  accessories: [
    "Watches",
    "Smartwatches",
    "Bags",
    "Accessories",
  ],

  appliances: [
    "Kitchen",
    "Laundry",
    "Cleaning",
    "Cooling",
  ],
};

// ----------------------------------------------
// MAIN MARKETPLACE PRODUCTS
// ----------------------------------------------

// Demo products. Prices and images are illustrative.

export const products: Product[] = [
  {
    id: "p01",
    category: "electronics",
    title: "Nova 5G Smartphone",
    price: 16999,
    previousPrice: 21999,
    image: image("photo-1511707171634-5f897ff02aa9"),
    subcategory: "Smartphones",
    rating: 4.8,
    tag: "Best seller",
  },
  {
    id: "p02",
    category: "electronics",
    title: "Slim Pro Laptop 14-inch",
    price: 45999,
    previousPrice: 52999,
    image: image("photo-1496181133206-80ce9b88a853"),
    subcategory: "Laptops",
    rating: 4.7,
    tag: "Trending",
  },
  {
    id: "p09",
    category: "home-furniture",
    title: "Comfort Lounge Sofa",
    price: 18999,
    previousPrice: 24999,
    image: image("photo-1555041469-a586c61ea9bc"),
    subcategory: "Sofas",
    rating: 4.7,
  },
  {
    id: "p10",
    category: "home-furniture",
    title: "Modern Living Room Decor",
    price: 2399,
    image: image("photo-1538688525198-9b88f6f53126"),
    subcategory: "Home Decor",
    rating: 4.6,
  },
  {
    id: "p15",
    category: "accessories",
    title: "Signature Minimal Wristwatch",
    price: 2999,
    previousPrice: 4499,
    image: image("photo-1523275335684-37898b6baf30"),
    subcategory: "Watches",
    rating: 4.8,
  },
  {
    id: "p16",
    category: "accessories",
    title: "Classic Lifestyle Accessories",
    price: 1299,
    image: image("photo-1434056886845-dac89ffe9b56"),
    subcategory: "Accessories",
    rating: 4.5,
  },
  {
    id: "p23",
    category: "appliances",
    title: "Compact Kitchen Blender",
    price: 3299,
    previousPrice: 4499,
    image: image("photo-1570222094114-d054a817e56b"),
    subcategory: "Kitchen",
    rating: 4.6,
  },
  {
    id: "p24",
    category: "appliances",
    title: "Kitchen Everyday Essentials",
    price: 1499,
    image: image("photo-1556911220-bff31c812dba"),
    subcategory: "Kitchen",
    rating: 4.5,
  },
  {
    id: "p27",
    category: "audio-gaming",
    title: "Wireless Gaming Headset",
    price: 2999,
    previousPrice: 4299,
    image: image("photo-1593305841991-05c297ba4575"),
    subcategory: "Headphones",
    rating: 4.7,
  },
  {
    id: "p28",
    category: "audio-gaming",
    title: "Desktop Bluetooth Speaker",
    price: 4999,
    image: image("photo-1542751371-adc38448a05e"),
    subcategory: "Speakers",
    rating: 4.8,
  },
];

// ----------------------------------------------
// CATEGORY PAGE PRODUCTS
// ----------------------------------------------

export const categoryProducts: Product[] = [
  ...products,

  {
    id: "v01",
    category: "electronics",
    title: "4K Pocket Action Camera",
    price: 1699,
    previousPrice: 2499,
    image: image("photo-1516035069371-29a1b244cc32"),
    subcategory: "Cameras",
    rating: 4.5,
  },
  {
    id: "v02",
    category: "electronics",
    title: "Everyday Android Tablet",
    price: 12999,
    image: image("photo-1544244015-0df4b3ffc6b0"),
    subcategory: "Tablets",
    rating: 4.6,
  },
  {
    id: "v09",
    category: "home-furniture",
    title: "Soft Modern Lounge Seating",
    price: 15999,
    previousPrice: 20999,
    image: image("photo-1555041469-a586c61ea9bc"),
    subcategory: "Sofas",
    rating: 4.7,
  },
  {
    id: "v10",
    category: "home-furniture",
    title: "Minimal Home Styling Kit",
    price: 1699,
    previousPrice: 2399,
    image: image("photo-1538688525198-9b88f6f53126"),
    subcategory: "Home Decor",
    rating: 4.4,
  },
  {
    id: "v15",
    category: "accessories",
    title: "Everyday Steel Wristwatch",
    price: 2499,
    previousPrice: 3999,
    image: image("photo-1523275335684-37898b6baf30"),
    subcategory: "Watches",
    rating: 4.7,
  },
  {
    id: "v16",
    category: "accessories",
    title: "Travel Accessories Set",
    price: 999,
    previousPrice: 1399,
    image: image("photo-1434056886845-dac89ffe9b56"),
    subcategory: "Bags",
    rating: 4.6,
  },
  {
    id: "v23",
    category: "appliances",
    title: "Everyday Kitchen Mixer",
    price: 3899,
    previousPrice: 5199,
    image: image("photo-1570222094114-d054a817e56b"),
    subcategory: "Kitchen",
    rating: 4.6,
  },
  {
    id: "v24",
    category: "appliances",
    title: "Kitchen Home Essentials",
    price: 1799,
    previousPrice: 2599,
    image: image("photo-1556911220-bff31c812dba"),
    subcategory: "Kitchen",
    rating: 4.7,
  },
  {
    id: "v27",
    category: "audio-gaming",
    title: "Surround-Sound Gaming Headset",
    price: 3999,
    previousPrice: 5499,
    image: image("photo-1599669454699-248893623440"),
    subcategory: "Gaming",
    rating: 4.7,
  },
  {
    id: "v28",
    category: "audio-gaming",
    title: "Gaming Controller Pro",
    price: 2499,
    previousPrice: 3599,
    image: image("photo-1606144042614-b2417e99c4e3"),
    subcategory: "Gaming",
    rating: 4.6,
  },
];

// ----------------------------------------------
// ADDITIONAL FEATURED PRODUCTS
// ----------------------------------------------

export const extraFeaturedProducts: Product[] = [
  {
    id: "f01",
    category: "electronics",
    title: "Mirrorless Travel Camera",
    price: 36999,
    previousPrice: 41999,
    image: image("photo-1516035069371-29a1b244cc32"),
    subcategory: "Cameras",
    rating: 4.7,
  },
  {
    id: "f02",
    category: "electronics",
    title: "Pocket Compact Camera",
    price: 12999,
    image: image("photo-1502920917128-1aa500764cbd"),
    subcategory: "Cameras",
    rating: 4.5,
  },
  {
    id: "f03",
    category: "electronics",
    title: "Ultra Portable Laptop",
    price: 56999,
    previousPrice: 69999,
    image: image("photo-1517336714731-489689fd1ca8"),
    subcategory: "Laptops",
    rating: 4.8,
  },
  {
    id: "f04",
    category: "electronics",
    title: "Everyday 5G Phone",
    price: 21999,
    previousPrice: 26999,
    image: image("photo-1512941937669-90a1b58e7e9"),
    subcategory: "Smartphones",
    rating: 4.6,
  },
  {
    id: "f05",
    category: "audio-gaming",
    title: "Portable Bluetooth Speaker",
    price: 3299,
    previousPrice: 4699,
    image: image("photo-1608043152269-423dbba4e7e1"),
    subcategory: "Speakers",
    rating: 4.7,
  },
  {
    id: "f06",
    category: "audio-gaming",
    title: "Wireless Over-Ear Headphones",
    price: 2999,
    previousPrice: 4499,
    image: image("photo-1505740420928-5e560c06d30e"),
    subcategory: "Headphones",
    rating: 4.8,
  },
  {
    id: "f07",
    category: "audio-gaming",
    title: "Noise-Cancelling Earbuds",
    price: 2499,
    previousPrice: 3599,
    image: image("photo-1606220588913-b3aacb4d2f46"),
    subcategory: "Earbuds",
    rating: 4.6,
  },
  {
    id: "f08",
    category: "audio-gaming",
    title: "Gaming Console Controller",
    price: 3899,
    previousPrice: 5299,
    image: image("photo-1606144042614-b2417e99c4e3"),
    subcategory: "Gaming",
    rating: 4.9,
  },
  {
    id: "f09",
    category: "home-furniture",
    title: "Warm Floor Lamp",
    price: 2699,
    previousPrice: 3599,
    image: image("photo-1507473885765-e6ed057f782c"),
    subcategory: "Lighting",
    rating: 4.6,
  },
  {
    id: "f10",
    category: "home-furniture",
    title: "Modern Accent Chair",
    price: 8999,
    previousPrice: 11999,
    image: image("photo-1503602642458-232111445657"),
    subcategory: "Chairs",
    rating: 4.7,
  },
  {
    id: "f11",
    category: "home-furniture",
    title: "Cozy Fabric Armchair",
    price: 11999,
    previousPrice: 14999,
    image: image("photo-1567538096630-e0c55bd6374c"),
    subcategory: "Chairs",
    rating: 4.8,
  },
  {
    id: "f12",
    category: "home-furniture",
    title: "Decorative Table Lamp",
    price: 1999,
    previousPrice: 2999,
    image: image("photo-1507473885765-e6ed057f782c"),
    subcategory: "Lighting",
    rating: 4.5,
  },
  {
    id: "f13",
    category: "accessories",
    title: "Classic Leather-Style Watch",
    price: 3999,
    previousPrice: 5499,
    image: image("photo-1524805444758-089113d48a6d"),
    subcategory: "Watches",
    rating: 4.7,
  },
  {
    id: "f14",
    category: "accessories",
    title: "Sports Smartwatch",
    price: 4999,
    previousPrice: 6999,
    image: image("photo-1523275335684-37898b6baf30"),
    subcategory: "Smartwatches",
    rating: 4.8,
  },
  {
    id: "f15",
    category: "accessories",
    title: "Canvas Crossbody Bag",
    price: 1599,
    previousPrice: 2299,
    image: image("photo-1547949003-9792a18a2601"),
    subcategory: "Bags",
    rating: 4.6,
  },
  {
    id: "f16",
    category: "accessories",
    title: "Leather Everyday Backpack",
    price: 2299,
    previousPrice: 3299,
    image: image("photo-1553062407-98eeb64c6a62"),
    subcategory: "Bags",
    rating: 4.7,
  },
  {
    id: "f17",
    category: "appliances",
    title: "Automatic Washing Machine",
    price: 24999,
    previousPrice: 31999,
    image: image("photo-1626806787461-102c1bfaaea1"),
    subcategory: "Laundry",
    rating: 4.7,
  },
  {
    id: "f18",
    category: "appliances",
    title: "Robot Vacuum Cleaner",
    price: 14999,
    previousPrice: 19999,
    image: image("photo-1558317374-067fb5f30001"),
    subcategory: "Cleaning",
    rating: 4.6,
  },
  {
    id: "f19",
    category: "appliances",
    title: "Air Conditioner 1.5 Ton",
    price: 32999,
    previousPrice: 39999,
    image: image("photo-1631545806609-3c873c889195"),
    subcategory: "Cooling",
    rating: 4.8,
  },
  {
    id: "f20",
    category: "appliances",
    title: "Compact Coffee Machine",
    price: 4599,
    previousPrice: 6299,
    image: image("photo-1517668808822-9ebb02f2a0e6"),
    subcategory: "Kitchen",
    rating: 4.7,
  },
];

// ----------------------------------------------
// COMPLETE PRODUCT CATALOG
// ----------------------------------------------

// Used by homepage, category page,
// search, cart and wishlist.

export const fullCatalog: Product[] = [
  ...categoryProducts,
  ...extraFeaturedProducts,
];
