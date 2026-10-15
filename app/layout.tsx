import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUY NEST | Discover Your Next Favorite",
  description: "Browse everyday essentials and discover fresh favorites at BUY NEST.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
