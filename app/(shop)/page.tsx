import Link from "next/link";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { DesktopHero, DesktopHeroFallback } from "@/components/home/desktop-hero";
import { CatalogTabs } from "@/components/home/mobile/catalog-tabs";
import { CategoryCircles } from "@/components/home/mobile/category-circles";
import { ComboPicks } from "@/components/home/mobile/combo-picks";
import { MobileHomeHeader, MobileHomeHeaderFallback } from "@/components/home/mobile/mobile-home-header";
import { MobileSearch } from "@/components/home/mobile/mobile-search";
import { ReorderButton, ShoppingListBox } from "@/components/home/shopping-list-box";
import { ProductGrid } from "@/components/product/product-grid";
import { getAllProducts, getBundles, getCategories, getProductCount, getProducts } from "@/lib/data/catalog";
import { getOrders } from "@/lib/data/orders";
import { formatDateTime, formatEur } from "@/lib/format";
import { PlusBadge } from "@/components/ui/plus-badge";

const HOME_GRID_SIZE = 4;

function LastOrderFallback() {
  return <div aria-hidden="true" className="h-40 rounded-xl border border-line bg-surface" />;
}

async function LastOrder() {
  const orders = await getOrders();
  const lastOrder = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (!lastOrder) {
    return (
      <p className="rounded-xl border border-line bg-surface p-5 text-sm text-ink-soft">
        Non hai ancora ordini. Quando ordini, qui trovi la spesa da riordinare in un clic.
      </p>
    );
  }

  const visibleLines = lastOrder.lines.slice(0, 6);
  const hiddenCount = lastOrder.lines.length - visibleLines.length;

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm text-ink-soft">
          Ordine del {formatDateTime(lastOrder.createdAt)} · {lastOrder.totals.itemCount} prodotti ·{" "}
          {formatEur(lastOrder.totals.total)}
        </p>
        <ul className="grid gap-x-6 gap-y-1.5 text-sm text-ink sm:grid-cols-2">
          {visibleLines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">{line.name}</span>
              <span className="shrink-0 text-ink-soft">× {line.quantity}</span>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 ? <p className="text-sm text-ink-muted">e altri {hiddenCount} prodotti</p> : null}
      </div>
      <div className="shrink-0">
        <ReorderButton orderId={lastOrder.id} />
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [categories, personalDeals, allProducts, bundles] = await Promise.all([
    getCategories(),
    getProducts({ deal: "personal" }),
    getAllProducts(),
    getBundles(),
  ]);
  const freshCategory = categories.find((category) => category.slug === "frutta-verdura") ?? categories[0];

  const countEntries = await Promise.all(
    categories.map(async (category) => [category.slug, await getProductCount(category.slug)] as const),
  );
  const counts = Object.fromEntries(countEntries);

  const combo = bundles[0] ? (
    <ComboPicks bundle={bundles[0]} products={allProducts} personalDeals={personalDeals} freshCategory={freshCategory} />
  ) : null;

  return (
    <div className="flex flex-col gap-7 md:gap-12">
      {/* Apertura: intestazione in stile app su mobile, hero con ricerca su desktop */}
      <div className="flex flex-col gap-7 md:hidden">
        <Suspense fallback={<MobileHomeHeaderFallback />}>
          <MobileHomeHeader />
        </Suspense>
        <MobileSearch />
        <CategoryCircles categories={categories} />
      </div>
      <div className="hidden md:block">
        <Suspense fallback={<DesktopHeroFallback />}>
          <DesktopHero />
        </Suspense>
      </div>

      {combo ? (
        <section aria-labelledby="combo-title" className="space-y-4 md:space-y-5">
          <h2 id="combo-title" className="flex items-center gap-2.5 font-display text-xl font-bold text-ink md:text-2xl">
            Pronti per te
            <PlusBadge />
          </h2>
          {combo}
        </section>
      ) : null}

      <section aria-labelledby="reparti-title" className="hidden space-y-5 md:block">
        <h2 id="reparti-title" className="font-display text-2xl font-bold text-ink">
          Reparti
        </h2>
        <CategoryGrid categories={categories} counts={counts} />
      </section>

      {/* Mobile: prodotti per reparto a tab */}
      <section aria-label="Prodotti per reparto" className="md:hidden">
        <CatalogTabs categories={categories} products={allProducts} />
      </section>

      <section aria-labelledby="per-te-title" className="hidden space-y-5 md:block">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="per-te-title" className="font-display text-2xl font-bold text-ink">
              Offerte per te
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Sconti scelti in base alle tue spese abituali.</p>
          </div>
          <Link href="/offerte" className="text-sm font-semibold text-brand hover:underline">
            Tutte le offerte
          </Link>
        </div>
        <ProductGrid products={personalDeals.slice(0, HOME_GRID_SIZE)} emptyMessage="Nessuna offerta per ora." />
      </section>

      {/* Funzioni Plus: lista della spesa e riordino, affiancate su desktop largo */}
      <div className="grid gap-7 md:gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <ShoppingListBox />

        <section aria-labelledby="riordina-title" className="space-y-5">
          <h2 id="riordina-title" className="flex items-center gap-2.5 font-display text-xl font-bold text-ink md:text-2xl">
            Riordina la tua ultima spesa
            <PlusBadge />
          </h2>
          <Suspense fallback={<LastOrderFallback />}>
            <LastOrder />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
