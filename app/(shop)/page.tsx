import Link from "next/link";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { CatalogTabs } from "@/components/home/mobile/catalog-tabs";
import { CategoryCircles } from "@/components/home/mobile/category-circles";
import { ComboPicks } from "@/components/home/mobile/combo-picks";
import { MobileHomeHeader, MobileHomeHeaderFallback } from "@/components/home/mobile/mobile-home-header";
import { MobileSearch } from "@/components/home/mobile/mobile-search";
import { ReorderButton, ShoppingListBox } from "@/components/home/shopping-list-box";
import { ProductGrid } from "@/components/product/product-grid";
import { getAllProducts, getBundles, getCategories, getProductCount, getProducts } from "@/lib/data/catalog";
import { getCustomer, getDeliverySlots } from "@/lib/data/customer";
import { getOrders } from "@/lib/data/orders";
import { formatDateTime, formatEur } from "@/lib/format";

const HOME_GRID_SIZE = 4;

function WelcomeFallback() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="h-9 w-56 max-w-full rounded-lg bg-line/60 sm:h-10" />
      <div className="h-5 w-72 max-w-full rounded bg-line/40" />
    </div>
  );
}

async function Welcome() {
  const [customer, slots] = await Promise.all([getCustomer(), getDeliverySlots()]);
  const nextSlot = slots.find((slot) => slot.remaining > 0);

  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Ciao {customer.firstName}</h1>
      <p className="text-ink-soft">
        {nextSlot
          ? `Prossima consegna: ${nextSlot.dayLabel}, dalle ${nextSlot.start} alle ${nextSlot.end}.`
          : "Al momento non ci sono fasce di consegna disponibili."}
      </p>
    </div>
  );
}

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
    <article className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-4 sm:p-5 md:flex-row md:items-start md:justify-between">
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
  const [categories, weeklyDeals, personalDeals, allProducts, bundles] = await Promise.all([
    getCategories(),
    getProducts({ deal: "weekly" }),
    getProducts({ deal: "personal" }),
    getAllProducts(),
    getBundles(),
  ]);
  const freshCategory = categories.find((category) => category.slug === "frutta-verdura") ?? categories[0];

  const countEntries = await Promise.all(
    categories.map(async (category) => [category.slug, await getProductCount(category.slug)] as const),
  );
  const counts = Object.fromEntries(countEntries);

  const personalPicks = personalDeals.slice(0, HOME_GRID_SIZE);

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {/* Home mobile: layout a sezioni compatte in stile app */}
      <div className="flex flex-col gap-7 md:hidden">
        <Suspense fallback={<MobileHomeHeaderFallback />}>
          <MobileHomeHeader />
        </Suspense>
        <MobileSearch />
        <CategoryCircles categories={categories} />
        {bundles[0] ? (
          <section aria-labelledby="combo-title" className="space-y-4">
            <h2 id="combo-title" className="font-display text-xl font-bold text-ink">
              Pronti per te
            </h2>
            <ComboPicks
              bundle={bundles[0]}
              products={allProducts}
              weeklyDeals={weeklyDeals}
              personalDeals={personalDeals}
              freshCategory={freshCategory}
            />
          </section>
        ) : null}
        <section aria-label="Prodotti per reparto">
          <CatalogTabs categories={categories} products={allProducts} />
        </section>
        <ShoppingListBox />
      </div>

      <section aria-label="Benvenuto" className="hidden gap-6 md:grid lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-start">
        <Suspense fallback={<WelcomeFallback />}>
          <Welcome />
        </Suspense>
        <ShoppingListBox />
      </section>

      <section aria-labelledby="reparti-title" className="hidden space-y-5 md:block">
        <h2 id="reparti-title" className="font-display text-2xl font-bold text-ink">
          Reparti
        </h2>
        <CategoryGrid categories={categories} counts={counts} />
      </section>

      <section aria-labelledby="offerte-title" className="hidden space-y-5 md:block">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="offerte-title" className="font-display text-2xl font-bold text-ink">
              Offerte della settimana
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Dal volantino di questa settimana.</p>
          </div>
          <Link href="/offerte?tipo=volantino" className="text-sm font-semibold text-brand hover:underline">
            Vedi tutto il volantino
          </Link>
        </div>
        <ProductGrid
          products={weeklyDeals.slice(0, HOME_GRID_SIZE)}
          emptyMessage="Nessuna offerta questa settimana."
        />
      </section>

      <section aria-labelledby="per-te-title" className="hidden space-y-5 md:block">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="per-te-title" className="font-display text-2xl font-bold text-ink">
              Pensate per te
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Selezionate in base alle tue spese abituali.</p>
          </div>
          <Link href="/offerte?tipo=per-te" className="text-sm font-semibold text-brand hover:underline">
            Tutte le offerte per te
          </Link>
        </div>
        <ProductGrid products={personalPicks} emptyMessage="Nessuna proposta personalizzata per ora." />
        {personalPicks.some((product) => product.dealReason) ? (
          <ul className="grid gap-x-6 gap-y-1 text-sm text-ink-soft sm:grid-cols-2">
            {personalPicks
              .filter((product) => product.dealReason)
              .map((product) => (
                <li key={product.id}>
                  <span className="font-medium text-ink">{product.name}</span>: {product.dealReason}
                </li>
              ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="riordina-title" className="space-y-5">
        <h2 id="riordina-title" className="font-display text-xl font-bold text-ink md:text-2xl">
          Riordina la tua ultima spesa
        </h2>
        <Suspense fallback={<LastOrderFallback />}>
          <LastOrder />
        </Suspense>
      </section>
    </div>
  );
}
