import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#25382b] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="text-3xl font-black tracking-[-0.08em]">
            BUY<span className="text-[#f0a476]">NEST</span>.
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#d0d8cc]">
            Your place to discover little joys, everyday essentials, and wonderful new finds.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#f0a476]">Explore</h2>
          <div className="mt-5 flex flex-col items-start gap-3 text-sm text-[#e4e8df]">
            <Link href="/" className="hover:text-[#f0a476]">Home</Link>
            <Link href="/#categories" className="hover:text-[#f0a476]">Categories</Link>
            <Link href="/products" className="hover:text-[#f0a476]">Shop all products</Link>
            <Link href="/wishlist" className="hover:text-[#f0a476]">Wishlist</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#f0a476]">Your account</h2>
          <div className="mt-5 flex flex-col items-start gap-3 text-sm text-[#e4e8df]">
            <Link href="/login" className="hover:text-[#f0a476]">Sign in <ArrowUpRight size={13} className="inline" /></Link>
            <Link href="/register" className="hover:text-[#f0a476]">Create account</Link>
            <Link href="/cart" className="hover:text-[#f0a476]">Shopping cart <ShoppingBag size={13} className="inline" /></Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-5 text-center text-xs text-[#c5cfc3]">
        © {new Date().getFullYear()} BUY NEST. Demo e-commerce experience.
      </div>
    </footer>
  );
}
