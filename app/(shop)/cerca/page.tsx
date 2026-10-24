import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getProducts } from "@/lib/data/catalog";
import type { Category } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Cerca",
  description: "Cerca prodotti tra i reparti di APA Supermercati.",
};

export default function SearchPage(props: PageProps<"/cerca">) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = (firstValue(params.q) ?? "").trim();
  const categories = await getCategories();

  if (!query) {
    return (
      <section className="mt-2">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Cerca nel negozio</h1>
        <p className="mt-2 text-ink-soft">
          Scrivi il nome di un prodotto o di una marca nella barra di ricerca, oppure scegli un reparto.
        </p>
        <CategoryLinks categories={categories} />
      </section>
    );
  }

  const results = await getProducts({ query });

  return (
    <section className="mt-2">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Risultati per «{query}»</h1>
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-semibold text-ink">{results.length}</span>{" "}
        {results.length === 1 ? "prodotto trovato" : "prodotti trovati"}
      </p>

      {results.length > 0 ? (
        <div className="mt-6">
          <ProductGrid products={results} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10">
          <p className="font-display text-xl font-bold text-ink">Nessun prodotto corrisponde alla ricerca</p>
          <p className="mt-2 text-sm text-ink-soft">
            Prova con un termine più generico oppure guarda le offerte.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/offerte"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Vedi le offerte
            </Link>
          </div>
          <CategoryLinks categories={categories} />
        </div>
      )}
    </section>
  );
}

function CategoryLinks({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Reparti" className="mt-6">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/reparti/${category.slug}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full border border-line"
                style={{ backgroundColor: category.tint }}
              />
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SearchSkeleton() {
  return (
    <div role="status" aria-label="Ricerca in corso" className="mt-2">
      <div className="h-9 w-64 max-w-full rounded-lg bg-line" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
