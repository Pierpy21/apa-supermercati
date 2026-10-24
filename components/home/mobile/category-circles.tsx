import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

interface CategoryCirclesProps {
  categories: Category[];
  /** Reparto corrente, evidenziato con un anello */
  activeSlug?: string;
}

/** Reparti a cerchi, scorrevoli in orizzontale (mobile) */
export function CategoryCircles({ categories, activeSlug }: CategoryCirclesProps) {
  return (
    <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pt-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <li key={category.slug} className="shrink-0">
            <Link
              href={`/reparti/${category.slug}`}
              aria-current={active ? "page" : undefined}
              className="group flex w-20 flex-col items-center gap-2"
            >
              <span
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${
                  active ? "ring-2 ring-brand ring-offset-2 ring-offset-paper" : ""
                }`}
                style={{ backgroundColor: category.tint }}
              >
                <Image
                  src={category.image}
                  alt=""
                  width={180}
                  height={140}
                  unoptimized
                  className="category-art h-auto w-16 group-hover:scale-105 group-hover:-rotate-1"
                />
              </span>
              <span className={`text-center text-sm ${active ? "font-semibold text-brand" : "text-ink"}`}>
                {category.shortName}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
