"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CartSummary } from "@/components/cart/cart-summary";
import { QuantityControl } from "@/components/product/quantity-control";
import { MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";
import type { Product } from "@/lib/types";

export function CartPage() {
  const { lines, productsById, totals, hydrated, clear, setQuantity } = useCart();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const items = lines.flatMap((line) => {
    const product = productsById.get(line.productId);
    return product ? [{ product, quantity: line.quantity }] : [];
  });

  return (
    <>
      <h1 className="font-display text-2xl font-bold md:text-3xl">Carrello</h1>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="cart-items-title" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="cart-items-title" className="text-lg font-semibold">
                Articoli ({totals.itemCount})
              </h2>
              {confirmingClear ? (
                <div role="group" aria-label="Conferma svuotamento" className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-ink-soft">Svuotare tutto il carrello?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setConfirmingClear(false);
                    }}
                    className="rounded-md px-2 py-1 font-medium text-promo underline-offset-4 hover:underline"
                  >
                    Sì, svuota
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-md px-2 py-1 font-medium text-ink-soft underline-offset-4 hover:underline"
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-ink-soft underline-offset-4 hover:text-promo hover:underline"
                >
                  Svuota carrello
                </button>
              )}
            </div>

            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {items.map(({ product, quantity }) => (
                <CartRow
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onRemove={() => setQuantity(product.id, 0)}
                />
              ))}
            </ul>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5">
              <h2 className="font-display text-lg font-semibold">Riepilogo</h2>
              <CartSummary />

              {totals.canCheckout ? (
                <Link
                  href="/checkout"
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-brand font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  Procedi all’ordine
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <span
                    aria-disabled="true"
                    aria-describedby="min-order-note"
                    className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-lg bg-line font-semibold text-ink-muted"
                  >
                    Procedi all’ordine
                  </span>
                  <p id="min-order-note" className="text-sm text-ink-soft">
                    Il minimo d’ordine è di {formatEur(MIN_ORDER_EUR)}. Aggiungi ancora{" "}
                    {formatEur(totals.missingToMinimum)} per poter confermare la spesa.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

interface CartRowProps {
  product: Product;
  quantity: number;
  onRemove: () => void;
}

function CartRow({ product, quantity, onRemove }: CartRowProps) {
  const lineTotal = product.price * quantity;

  return (
    <li className="flex gap-4 p-4">
      <Link
        href={`/prodotti/${product.id}`}
        className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-paper"
      >
        <Image
          src={product.image}
          alt={product.name}
          width={64}
          height={64}
          unoptimized={product.image.endsWith(".svg")}
          className="size-16 object-contain"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">{product.brand}</p>
          <Link
            href={`/prodotti/${product.id}`}
            className="line-clamp-2 font-medium text-ink underline-offset-4 hover:text-brand hover:underline"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm text-ink-soft">
            {product.format} · {formatEur(product.price)} cad.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <QuantityControl productId={product.id} size="sm" />
          <p className="w-24 text-right font-display text-base font-bold">{formatEur(lineTotal)}</p>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Rimuovi ${product.name} dal carrello`}
            className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-promo-tint hover:text-promo"
          >
            <svg
              viewBox="0 0 24 24"
              width={20}
              height={20}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M9.5 7V4.5h5V7" />
              <path d="M6.5 7l1 12.5h9l1-12.5" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div role="status" className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
      <span className="sr-only">Caricamento del carrello</span>
      <div aria-hidden="true" className="h-72 rounded-xl bg-line/60" />
      <div aria-hidden="true" className="h-80 rounded-xl bg-line/60" />
    </div>
  );
}

function EmptyCart() {
  return (
    <section
      aria-labelledby="empty-cart-title"
      className="mx-auto mt-8 flex max-w-md flex-col items-center gap-4 rounded-xl border border-line bg-surface px-6 py-12 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        width={40}
        height={40}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-brand"
      >
        <path d="M3.5 9h17l-1.6 9.2a1.5 1.5 0 0 1-1.5 1.3H6.6a1.5 1.5 0 0 1-1.5-1.3L3.5 9Z" />
        <path d="M8 9l3.5-5" />
        <path d="M16 9l-3.5-5" />
      </svg>
      <h2 id="empty-cart-title" className="font-display text-xl font-semibold">
        Il carrello è vuoto
      </h2>
      <p className="text-ink-soft">
        Aggiungi i prodotti che ti servono: li trovi nei reparti e nelle offerte.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="flex h-11 items-center justify-center rounded-lg bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Vai alla spesa
        </Link>
        <Link
          href="/offerte"
          className="flex h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-semibold text-ink transition-colors hover:bg-brand-tint"
        >
          Vedi le offerte
        </Link>
      </div>
    </section>
  );
}
