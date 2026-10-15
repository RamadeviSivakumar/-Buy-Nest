import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCategory } from "@/lib/format";

const backgrounds = ["bg-[#f0e5d8]", "bg-[#e9efdf]", "bg-[#f3e6df]", "bg-[#e5e9eb]"];

type Props = {
  category: string;
  sample: Product;
  count: number;
  index: number;
};

export default function CategoryCard({ category, sample, count, index }: Props) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category)}`}
      className={`group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-[26px] p-5 sm:min-h-72 sm:p-6 ${backgrounds[index % backgrounds.length]}`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#657062]">{count} products</p>
          <h3 className="mt-2 text-xl font-black text-[#25382b] sm:text-2xl">{formatCategory(category)}</h3>
        </div>
        <span className="rounded-full bg-white/85 p-2 text-[#25382b] transition group-hover:bg-[#25382b] group-hover:text-white">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="relative ml-auto h-36 w-4/5 transition-transform duration-300 group-hover:scale-105 sm:h-44">
        <Image src={sample.thumbnail} alt={`Explore ${formatCategory(category)}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain" />
      </div>
    </Link>
  );
}
