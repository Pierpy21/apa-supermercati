import { Suspense } from "react";
import { CartBar } from "@/components/cart/cart-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { DeliveryStrip, DeliveryStripFallback } from "@/components/layout/delivery-strip";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { RecipeAssistant } from "@/components/recipes/recipe-assistant";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast-provider";
import { getAllProducts, getCategories } from "@/lib/data/catalog";
import { getCustomer } from "@/lib/data/customer";

/**
 * Placeholder dell'header con le stesse altezze di SiteHeader (riga 1 py-3 + h-10,
 * riga ricerca sotto i 768px, riga reparti h-11) per evitare salti di layout.
 */
export function ShopShellFallback() {
  return (
    <>
      {/* Mobile: stessa sagoma della barra in stile app */}
      <div aria-hidden="true" className="flex items-center gap-3 px-4 pt-3 pb-2 md:hidden">
        <div className="h-12 w-12 rounded-full bg-line/50" />
        <div className="h-6 flex-1 rounded bg-line/40" />
        <div className="h-12 w-12 rounded-full bg-line/50" />
      </div>
      <div aria-hidden="true" className="sticky top-0 z-30 hidden border-b border-line bg-surface md:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 py-3 md:gap-x-3">
            <div className="h-10 w-24 shrink-0 rounded-lg bg-line/60" />
            <div className="h-10 w-36 rounded-lg bg-line/40" />
            <div className="order-last h-10 w-full basis-full rounded-lg bg-line/40 md:order-none md:basis-auto md:flex-1" />
            <div className="ml-auto flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-line/40" />
              <div className="h-10 w-10 rounded-full bg-line/40" />
              <div className="h-10 w-24 rounded-lg bg-line/40" />
            </div>
          </div>
        </div>
        <div className="h-11 bg-brand-deep" />
      </div>
    </>
  );
}

async function ShopShell({ children }: { children: React.ReactNode }) {
  const [products, customer, categories] = await Promise.all([getAllProducts(), getCustomer(), getCategories()]);

  return (
    <ToastProvider>
      <CartProvider products={products} initialFavorites={customer.favoriteProductIds}>
        {/* Su mobile l'header classico è sostituito dalla barra in stile app */}
        <div className="hidden md:contents">
          <SiteHeader customer={customer} />
          <Suspense fallback={<DeliveryStripFallback />}>
            <DeliveryStrip />
          </Suspense>
        </div>
        <MobileTopBar categories={categories} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">{children}</main>
        <SiteFooter />
        <CartBar />
        <RecipeAssistant />
        <CartDrawer />
      </CartProvider>
    </ToastProvider>
  );
}

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShopShellFallback />}>
      <ShopShell>{children}</ShopShell>
    </Suspense>
  );
}
