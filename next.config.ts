
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // DummyJSON product images
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
        pathname: "/product-images/**",
      },

      // Unsplash product photos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      // Hoover appliance photos
      {
        protocol: "https",
        hostname: "www.hoover-home.com",
      },

      // Wix product photos
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },
};

export default nextConfig;
