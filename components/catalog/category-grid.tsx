import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export interface CategoryGridProps {
  categories: Category[];
  /** Numero di prodotti per reparto, indicizzato per slug */
  counts: Record<string, number>;
}

export function CategoryGrid({ categories, counts }: CategoryGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const count = counts[category.slug] ?? 0;
        return (
          <li key={category.slug}>
            <Link
              href={`/reparti/${category.slug}`}
              className="group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-xl border border-transparent p-4 transition-colors hover:border-ink/15 sm:p-5"
              style={{ backgroundColor: category.tint }}
            >
              <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                {category.tagline}
              </span>
              <span className="mt-1 font-display text-xl leading-tight font-bold text-ink">
                {category.name}
              </span>
              <span className="relative z-10 mt-auto self-start rounded-md bg-surface/80 px-2 py-0.5 text-xs font-medium text-ink-soft">
                {count} {count === 1 ? "prodotto" : "prodotti"}
              </span>
              <Image
                src={category.image}
                alt=""
                width={180}
                height={140}
                unoptimized
                className="category-art pointer-events-none absolute -right-2 -bottom-2 h-auto w-24 group-hover:-rotate-1 group-hover:scale-105 sm:w-32 lg:w-40"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
