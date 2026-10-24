"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/lib/types";

/** Prodotti salvati nei preferiti, letti dallo stato client del carrello. */
export function FavoritesList() {
  const { favorites, productsById, hydrated } = useCart();

  // Prima dell'idratazione i preferiti salvati non sono ancora letti: evita il flash di "vuoto"
  if (!hydrated) return <div className="min-h-64" aria-hidden="true" />;

  const products: Product[] = [];
  for (const id of Array.from(favorites)) {
    const product = productsById.get(id);
    if (product) products.push(product);
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
        <p className="font-display text-xl font-bold text-ink">Nessun preferito salvato</p>
        <p className="mt-2 text-sm text-ink-soft">Tocca il cuore su un prodotto per ritrovarlo qui.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Vai ai reparti
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-ink-soft">
        <span className="font-semibold text-ink">{products.length}</span>{" "}
        {products.length === 1 ? "prodotto salvato" : "prodotti salvati"}
      </p>
      <ProductGrid products={products} />
    </>
  );
}
