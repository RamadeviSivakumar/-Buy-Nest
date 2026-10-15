import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCategory, formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#ece8df] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(35,56,43,0.09)]">
      <Link href={`/products/${product.id}`} className="block" aria-label={`View details for ${product.title}`}>
        <div className="relative aspect-square bg-[#f7f5f0]">
          <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-5 transition-transform duration-300 group-hover:scale-105" />
          {product.discountPercentage > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#fffdf9] px-3 py-1.5 text-[11px] font-black text-[#b55c3b] shadow-sm">
              {Math.round(product.discountPercentage)}% OFF
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-[#8b9389]">
            <span className="truncate">{formatCategory(product.category)}</span>
            <span className="flex items-center gap-1 whitespace-nowrap text-[#546448]">
              <Star size={13} className="fill-[#e2a456] text-[#e2a456]" />
              {product.rating.toFixed(1)}
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-[#25382b] sm:text-base">
            {product.title}
          </h3>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-lg font-black text-[#25382b]">{formatPrice(product.price)}</span>
            <ArrowUpRight size={19} className="text-[#bd714b] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
