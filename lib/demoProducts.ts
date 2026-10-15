
/*
  BUY NEST — DEMO PRODUCT CATALOG

  6 Gaming Products
  8 Home Appliances

  Uses photographic images instead of
  SVG illustrations.

  IMPORTANT:
  These are illustrative demo products,
  not actual brand inventory.
*/

// ============================================
// PRODUCT TYPE
// ============================================

export type DemoProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  sku: string;
  thumbnail: string;
  images: string[];
  shippingInformation: string;
  returnPolicy: string;
  warrantyInformation: string;
  availabilityStatus: string;
};

// ============================================
// PHOTO HELPERS
// ============================================

function unsplashPhoto(photoId: string) {
  return (
    `https://images.unsplash.com/${photoId}` +
    "?auto=format&fit=crop&w=1000&q=85"
  );
}

// ============================================
// PRODUCT PHOTOS
// ============================================

const photos = {
  // GAMING

  controller: unsplashPhoto(
    "photo-1768166210760-9c9a4299c436"
  ),

  keyboard: unsplashPhoto(
    "photo-1627827964974-7d801390512e"
  ),

  mouse: unsplashPhoto(
    "photo-1628832306751-ec751454119c"
  ),

  headset: unsplashPhoto(
    "photo-1636487658646-5cf71c6a989c"
  ),

  console: unsplashPhoto(
    "photo-1622297845775-5ff3fef71d13"
  ),

  speakers: unsplashPhoto(
    "photo-1520106392146-ef585c111254"
  ),

  // HOME APPLIANCES

  refrigerator: unsplashPhoto(
    "photo-1629042306548-1bfb25a3ff78"
  ),

  washingMachine: unsplashPhoto(
    "photo-1584989779979-cd16c2f0bebd"
  ),

  airConditioner: unsplashPhoto(
    "photo-1622787066476-2794c60844d3"
  ),

  vacuum:
    "https://www.hoover-home.com/en_GB/cdn/shop/files/3_39401110_1081_40_f_hf310h001-36643-M.jpg?v=1774020226&width=800",

  microwave: unsplashPhoto(
    "photo-1724873299564-db1b60415c50"
  ),

  airFryer:
    "https://static.wixstatic.com/media/0583c7_80a9ab9a3dcd44a2a462253b5a883342~mv2.png/v1/fill/w_980%2Ch_992%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/0583c7_80a9ab9a3dcd44a2a462253b5a883342~mv2.png",

  airPurifier: unsplashPhoto(
    "photo-1765153155226-f617921051b3"
  ),

  mixer: unsplashPhoto(
    "photo-1646829816804-d2e5baf17d93"
  ),
};

// ============================================
// PRODUCT FACTORY
// ============================================

function createProduct(
  id: number,
  title: string,
  description: string,
  category: string,
  price: number,
  thumbnail: string
): DemoProduct {
  return {
    id,
    title,
    description,
    category,
    price,

    // Keep custom demo products outside
    // the On Sale filter for now.
    discountPercentage: 0,

    rating: 4.5,
    stock: 25,

    brand: "BUY NEST Demo",
    sku: `BN-DEMO-${id}`,

    thumbnail,
    images: [thumbnail],

    shippingInformation:
      "Demo listing. No physical shipping.",

    returnPolicy:
      "Demo listing. No real purchases or returns.",

    warrantyInformation:
      "Illustrative product — no manufacturer warranty.",

    availabilityStatus: "In Stock",
  };
}

// ============================================
// GAMING PRODUCTS
// ============================================

export const gamingProducts: DemoProduct[] = [
  createProduct(
    900001,
    "Wireless Gaming Controller",
    "Ergonomic wireless game controller with responsive buttons and precision controls.",
    "gaming",
    49.99,
    photos.controller
  ),

  createProduct(
    900002,
    "RGB Mechanical Gaming Keyboard",
    "Full-size mechanical-style keyboard with illuminated keys for gaming setups.",
    "gaming",
    69.99,
    photos.keyboard
  ),

  createProduct(
    900003,
    "Precision RGB Gaming Mouse",
    "Ergonomic gaming mouse designed for smooth movement and responsive control.",
    "gaming",
    29.99,
    photos.mouse
  ),

  createProduct(
    900004,
    "Surround Gaming Headset",
    "Over-ear gaming headset with microphone for multiplayer communication.",
    "gaming",
    59.99,
    photos.headset
  ),

  createProduct(
    900005,
    "Compact Gaming Console",
    "Illustrative home gaming console for entertainment setups.",
    "gaming",
    199.99,
    photos.console
  ),

  createProduct(
    900006,
    "Stereo Gaming Speakers",
    "Desktop speaker pair for gaming audio and entertainment.",
    "gaming",
    39.99,
    photos.speakers
  ),
];

// ============================================
// HOME APPLIANCES
// ============================================

export const applianceProducts: DemoProduct[] = [
  createProduct(
    900101,
    "Double Door Refrigerator",
    "Spacious double-door refrigerator for everyday food storage.",
    "home-appliances",
    599.99,
    photos.refrigerator
  ),

  createProduct(
    900102,
    "Front Load Washing Machine",
    "Modern front-load washing machine with a spacious drum.",
    "home-appliances",
    449.99,
    photos.washingMachine
  ),

  createProduct(
    900103,
    "Split Air Conditioner",
    "Wall-mounted split air conditioner for indoor cooling.",
    "home-appliances",
    479.99,
    photos.airConditioner
  ),

  createProduct(
    900104,
    "Bagless Vacuum Cleaner",
    "Lightweight vacuum cleaner for everyday home cleaning.",
    "home-appliances",
    129.99,
    photos.vacuum
  ),

  createProduct(
    900105,
    "Countertop Microwave Oven",
    "Compact microwave oven for heating and preparing meals.",
    "home-appliances",
    119.99,
    photos.microwave
  ),

  createProduct(
    900106,
    "Digital Air Fryer",
    "Countertop air fryer with easy-to-use digital controls.",
    "home-appliances",
    89.99,
    photos.airFryer
  ),

  createProduct(
    900107,
    "Smart Air Purifier",
    "Compact air purifier for everyday indoor air filtration.",
    "home-appliances",
    149.99,
    photos.airPurifier
  ),

  createProduct(
    900108,
    "Multi-purpose Mixer Grinder",
    "Versatile mixer grinder for common kitchen preparation tasks.",
    "home-appliances",
    79.99,
    photos.mixer
  ),
];

// ============================================
// SHARED PRODUCT COLLECTION
// ============================================

export const demoProducts: DemoProduct[] = [
  ...gamingProducts,
  ...applianceProducts,
];

// ============================================
// FIND PRODUCT BY ID
// ============================================

export function getDemoProductById(
  id: number | string
): DemoProduct | null {
  const numericId = Number(id);

  if (!Number.isSafeInteger(numericId)) {
    return null;
  }

  return (
    demoProducts.find(
      (product) => product.id === numericId
    ) ?? null
  );
}
