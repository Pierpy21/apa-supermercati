"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CartCircleButton } from "@/components/home/mobile/cart-circle-button";
import { CategoryCircles } from "@/components/home/mobile/category-circles";
import { MobileSearch } from "@/components/home/mobile/mobile-search";
import type { Category } from "@/lib/types";

// Pagine di catalogo: sotto la barra mostrano anche la ricerca
const CATALOG_PREFIXES = ["/reparti", "/prodotti", "/cerca", "/offerte", "/preferiti"];

/**
 * Barra superiore mobile delle pagine interne, nello stesso stile della home:
 * indietro, logo e carrello tondi. Sulla home non viene mostrata perché la home
 * ha già la sua intestazione con il saluto.
 */
export function MobileTopBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  const isCatalog = CATALOG_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const activeCategory = pathname.startsWith("/reparti/") ? pathname.split("/")[2] : undefined;

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    // contents: lo sticky della barra resta legato al body e non a questo contenitore
    <div className="contents md:hidden">
      <div className="sticky top-0 z-30 bg-paper px-4 pt-3 pb-2 md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Torna indietro"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-sm ring-1 ring-line transition-colors hover:text-brand"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <Link href="/" className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
            <span className="font-display text-2xl leading-none font-extrabold text-brand">APA</span>
            <span className="text-sm font-medium text-ink-soft">Supermercati</span>
          </Link>
          <CartCircleButton />
        </div>
      </div>

      {isCatalog ? (
        <div className="space-y-5 px-4 pt-3 md:hidden">
          <MobileSearch />
          {activeCategory ? <CategoryCircles categories={categories} activeSlug={activeCategory} /> : null}
        </div>
      ) : null}
    </div>
  );
}
