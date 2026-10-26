"use client";

import { useCart } from "@/components/cart/cart-provider";
import { formatEur } from "@/lib/format";

/** Pulsante carrello tondo dell'intestazione mobile */
export function CartCircleButton() {
  const { totals, openDrawer, hydrated } = useCart();
  const count = hydrated ? totals.itemCount : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Apri il carrello: ${count} prodotti, spesa ${formatEur(totals.subtotal)}`}
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-brand shadow-sm ring-1 ring-line transition-colors hover:bg-brand-tint"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5.5 w-5.5"
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
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-promo px-1 text-[11px] font-bold text-white ring-2 ring-paper"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
