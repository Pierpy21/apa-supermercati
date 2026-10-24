import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/data/catalog";

type SearchParams = Record<string, string | string[] | undefined>;
type OfferTab = "tutte" | "volantino" | "per-te";

const TABS: { key: OfferTab; label: string; href: string }[] = [
  { key: "tutte", label: "Tutte", href: "/offerte" },
  { key: "volantino", label: "Volantino", href: "/offerte?tipo=volantino" },
  { key: "per-te", label: "Per te", href: "/offerte?tipo=per-te" },
];

const DEAL_BY_TAB: Record<OfferTab, "any" | "weekly" | "personal"> = {
  tutte: "any",
  volantino: "weekly",
  "per-te": "personal",
};

const INTRO: Record<OfferTab, string> = {
  tutte: "Le offerte del volantino e quelle scelte per te.",
  volantino: "I prezzi del volantino, uguali per tutti i clienti.",
  "per-te": "Sconti scelti in base ai prodotti che acquisti di solito.",
};

export const metadata: Metadata = {
  title: "Offerte della settimana",
  description: "Le offerte del volantino APA Supermercati e le promozioni scelte per te.",
};

export default function OffersPage(props: PageProps<"/offerte">) {
  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Offerte della settimana</h1>
        <p className="mt-2 text-ink-soft">Valide fino a domenica, salvo esaurimento scorte.</p>
      </header>

      <Suspense fallback={<OffersSkeleton />}>
        <OffersList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function OffersList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tab = resolveTab(firstValue(params.tipo));
  const products = await getProducts({ deal: DEAL_BY_TAB[tab] });

  return (
    <div className="mt-6">
      <nav aria-label="Tipo di offerta" className="border-b border-line">
        <ul className="-mb-px flex gap-6">
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    active ? "border-brand text-brand" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-4 text-sm text-ink-soft">{INTRO[tab]}</p>

      <div className="mt-5">
        <ProductGrid products={products} emptyMessage="Nessuna offerta in questo momento." />
      </div>
    </div>
  );
}

function OffersSkeleton() {
  return (
    <div role="status" aria-label="Caricamento offerte" className="mt-6">
      <div className="flex gap-6 border-b border-line pb-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-4 w-16 rounded bg-line" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

function resolveTab(value: string | null): OfferTab {
  if (value === "volantino") return "volantino";
  if (value === "per-te") return "per-te";
  return "tutte";
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
