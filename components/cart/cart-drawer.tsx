"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityControl } from "@/components/product/quantity-control";
import { formatEur } from "@/lib/format";

/** Pulsante carrello dell'header: badge quantità e totale, apre il drawer. */
export function CartButton() {
  const { totals, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Apri il carrello: ${totals.itemCount} prodotti, ${formatEur(totals.total)}`}
      className="relative flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
        <circle cx="9.5" cy="19.5" r="1.25" />
        <circle cx="17" cy="19.5" r="1.25" />
      </svg>
      <span className="hidden sm:inline" aria-hidden="true">
        {formatEur(totals.total)}
      </span>
      {totals.itemCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-promo px-1 text-xs font-bold text-white"
        >
          {totals.itemCount}
        </span>
      ) : null}
    </button>
  );
}

/** Pannello laterale del carrello, aperto da useCart().isDrawerOpen. */
export function CartDrawer() {
  const { lines, productsById, totals, isDrawerOpen, closeDrawer, clear } = useCart();
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastPathname = useRef(pathname);

  // Chiude il drawer quando l'utente cambia pagina. Il confronto con il ref evita
  // di chiuderlo a ogni render (closeDrawer non è memoizzata nel provider).
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Esc chiude il drawer
  useEffect(() => {
    if (!isDrawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Blocca lo scroll della pagina mentre il drawer è aperto
  useEffect(() => {
    if (!isDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  // Porta il focus sul pulsante di chiusura all'apertura
  useEffect(() => {
    if (isDrawerOpen) closeButtonRef.current?.focus();
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const hasLines = lines.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" onClick={closeDrawer} className="absolute inset-0 bg-ink/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-xl font-bold text-ink">
            Il tuo carrello
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Chiudi il carrello"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-paper hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {hasLines ? (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => {
                const product = productsById.get(line.productId);
                if (!product) return null;
                return (
                  <li key={line.productId} className="flex gap-3 py-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-paper">
                      <Image src={product.image} alt="" width={56} height={56} unoptimized className="h-12 w-12 object-contain" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm leading-snug font-medium text-ink">{product.name}</p>
                          <p className="text-xs text-ink-muted">{product.format}</p>
                        </div>
                        <p className="shrink-0 font-display text-sm font-bold text-ink">
                          {formatEur(product.price * line.quantity)}
                        </p>
                      </div>
                      <QuantityControl productId={product.id} size="sm" />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line px-5 pt-3">
              <button
                type="button"
                onClick={clear}
                className="text-sm font-medium text-ink-soft underline-offset-2 hover:text-promo hover:underline"
              >
                Svuota carrello
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-start gap-3 px-5 py-8">
            <p className="text-base font-medium text-ink">Il carrello è vuoto.</p>
            <p className="text-sm text-ink-soft">Aggiungi i prodotti che ti servono dai reparti.</p>
            <Link
              href="/"
              onClick={closeDrawer}
              className="mt-1 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Vai ai reparti
            </Link>
          </div>
        )}

        {hasLines ? (
          <footer className="space-y-4 border-t border-line bg-paper px-5 py-4">
            <CartSummary />
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/carrello"
                onClick={closeDrawer}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-line-strong bg-surface text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                Vai al carrello
              </Link>
              {totals.canCheckout ? (
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover"
                >
                  Procedi all&apos;ordine
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white opacity-50"
                >
                  Procedi all&apos;ordine
                </button>
              )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
