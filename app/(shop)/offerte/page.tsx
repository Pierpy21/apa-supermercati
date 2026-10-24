import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Offerte",
  description: "Le offerte di APA Supermercati scelte in base alla tua spesa.",
};

export default async function OffersPage() {
  const products = await getProducts({ deal: "any" });

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Offerte</h1>
        <p className="mt-2 text-ink-soft">
          Sconti scelti in base ai prodotti che acquisti di solito, salvo esaurimento scorte.
        </p>
      </header>

      <div className="mt-6">
        <ProductGrid products={products} emptyMessage="Nessuna offerta in questo momento." />
      </div>
    </>
  );
}
