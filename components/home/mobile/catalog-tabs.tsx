"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import type { Category, CategorySlug, Product } from "@/lib/types";

const VISIBLE_PRODUCTS = 6;

interface CatalogTabsProps {
  categories: Category[];
  products: Product[];
}

/** Tab per reparto con le schede prodotto (home mobile) */
export function CatalogTabs({ categories, products }: CatalogTabsProps) {
  const [active, setActive] = useState<CategorySlug | "tutti">("tutti");

  const filtered = active === "tutti" ? products.filter((p) => p.deal) : products.filter((p) => p.category === active);
  const activeCategory = categories.find((c) => c.slug === active);

  const tabs = [{ value: "tutti" as const, label: "In evidenza" }, ...categories.map((c) => ({ value: c.slug, label: c.shortName }))];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Reparti"
        className="-mx-4 flex gap-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const selected = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.value)}
              className={`relative shrink-0 pb-2 text-[15px] whitespace-nowrap transition-colors ${
                selected ? "font-semibold text-brand" : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
              {selected ? <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" /> : null}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        <ProductGrid products={filtered.slice(0, VISIBLE_PRODUCTS)} emptyMessage="Nessun prodotto in questo reparto." />
      </div>

      <Link
        href={activeCategory ? `/reparti/${activeCategory.slug}` : "/offerte"}
        className="flex h-12 items-center justify-center rounded-xl border border-line-strong bg-surface text-sm font-semibold text-ink hover:border-brand hover:text-brand"
      >
        {activeCategory ? `Vedi tutto in ${activeCategory.name}` : "Vedi tutte le offerte"}
      </Link>
    </div>
  );
}
