import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";

export default function Hero({ products }: { products: Product[] }) {
  // Pick the first product of each category; no hardcoded product records.
  const categorySamples = new Map<string, Product>();
  for (const product of products) {
    if (!categorySamples.has(product.category)) {
      categorySamples.set(product.category, product);
    }
  }
  const uniqueCategoryProducts = [...categorySamples.values()].slice(0, 3);

  const [main, secondary, third] = uniqueCategoryProducts;

  return (
    <section className="overflow-hidden bg-[#f7efe5]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:py-20 lg:gap-20 lg:px-8 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e9d9c6] bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a65b39]">
            <Sparkles size={15} /> The art of finding better
          </p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.065em] text-[#25382b] sm:text-6xl lg:text-[76px]">
            Better finds.<br />
            <span className="font-serif italic font-medium text-[#dc794c]">Brighter</span> days.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[#596357] sm:text-lg">
            Discover everyday essentials, lovely little luxuries, and fresh favorites — all in one beautiful place.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/products" className="inline-flex items-center gap-3 rounded-full bg-[#25382b] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#dc794c]">
              Shop the collection <ArrowRight size={18} />
            </Link>
            <Link href="#categories" className="inline-flex items-center gap-2 px-1 py-3 text-sm font-bold text-[#25382b] underline decoration-[#dc794c] decoration-2 underline-offset-8 hover:text-[#dc794c]">
              Explore categories
            </Link>
          </div>
          <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8f7c]">
            Discover • Explore • Enjoy
          </p>
        </div>

        <div className="relative mx-auto h-[390px] w-full max-w-[540px] sm:h-[490px] md:h-[440px] lg:h-[520px]">
          <div className="absolute inset-x-[12%] top-[9%] aspect-square rounded-full bg-[#e8d0b6]" />
          <div className="absolute inset-x-[22%] top-[19%] aspect-square rounded-full border border-white/75" />

          {main && (
            <Link
              href={`/products/${main.id}`}
              aria-label={`View ${main.title}`}
              className="absolute left-[3%] top-[12%] w-[66%] -rotate-6 rounded-[32px] bg-white p-4 shadow-[0_20px_65px_rgba(72,55,38,0.13)] transition-transform hover:rotate-0 sm:p-6"
            >
              <div className="relative aspect-[1/1.1]">
                <Image src={main.thumbnail} alt={main.title} fill priority sizes="(max-width: 768px) 65vw, 330px" className="object-contain" />
              </div>
              <p className="truncate text-xs font-bold text-[#25382b] sm:text-sm">{main.title}</p>
            </Link>
          )}

          {secondary && (
            <Link
              href={`/products/${secondary.id}`}
              aria-label={`View ${secondary.title}`}
              className="absolute right-[1%] top-[3%] w-[39%] rotate-6 rounded-[25px] bg-[#fff7eb] p-3 shadow-[0_15px_45px_rgba(72,55,38,0.12)] transition-transform hover:rotate-0"
            >
              <div className="relative aspect-square">
                <Image src={secondary.thumbnail} alt={secondary.title} fill sizes="(max-width: 768px) 40vw, 200px" className="object-contain" />
              </div>
            </Link>
          )}

          {third && (
            <Link
              href={`/products/${third.id}`}
              aria-label={`View ${third.title}`}
              className="absolute bottom-[1%] right-[3%] w-[42%] rotate-6 rounded-[25px] bg-[#f2e4d5] p-3 shadow-[0_15px_45px_rgba(72,55,38,0.15)] transition-transform hover:rotate-0"
            >
              <div className="relative aspect-square">
                <Image src={third.thumbnail} alt={third.title} fill sizes="(max-width: 768px) 40vw, 220px" className="object-contain" />
              </div>
              <span className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#25382b]"><ArrowUpRight size={16} /></span>
            </Link>
          )}
          <div className="absolute bottom-[5%] left-[6%] rounded-full border border-[#eddfce] bg-white/85 px-4 py-2 text-xs font-semibold text-[#25382b] shadow-sm backdrop-blur">
            Curated to inspire ✦
          </div>
        </div>
      </div>
    </section>
  );
}
