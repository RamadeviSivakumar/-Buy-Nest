
import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "./serwist-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUY NEST | Discover Your Next Favorite",
  description:
    "Browse everyday essentials and discover fresh favorites at BUY NEST.",

  applicationName: "BuyNest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuyNest",
  },

  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
