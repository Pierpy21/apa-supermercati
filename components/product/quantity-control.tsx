"use client";

import { useCart } from "@/components/cart/cart-provider";

export interface QuantityControlProps {
  productId: string;
  size?: "sm" | "md";
}

const MAX_QUANTITY = 99;

/**
 * Pulsante "Aggiungi" o stepper − N +. Prima dell'idratazione mostra sempre
 * "Aggiungi" per evitare mismatch con il carrello salvato in localStorage.
 */
export function QuantityControl({ productId, size = "md" }: QuantityControlProps) {
  const { quantityOf, setQuantity, productsById, hydrated } = useCart();
  const product = productsById.get(productId);
  const name = product?.name ?? "prodotto";
  const inStock = product?.inStock ?? false;
  const quantity = hydrated ? quantityOf(productId) : 0;

  const height = size === "sm" ? "h-9" : "h-11";
  const text = size === "sm" ? "text-sm" : "text-base";

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex w-full items-center justify-center rounded-lg border border-line bg-paper px-4 font-medium text-ink-muted ${height} ${text}`}
      >
        Non disponibile
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => setQuantity(productId, 1)}
        aria-label={`Aggiungi ${name} al carrello`}
        className={`inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 font-semibold text-white transition-colors hover:bg-brand-hover ${height} ${text}`}
      >
        Aggiungi
      </button>
    );
  }

  return (
    <div
      className={`flex w-full items-stretch overflow-hidden rounded-lg border border-brand bg-surface ${height}`}
    >
      <button
        type="button"
        onClick={() => setQuantity(productId, quantity - 1)}
        aria-label="Diminuisci quantità"
        className="flex w-11 shrink-0 items-center justify-center text-brand transition-colors hover:bg-brand-tint"
      >
        <MinusIcon />
      </button>
      <output className={`flex flex-1 items-center justify-center font-semibold tabular-nums text-ink ${text}`}>
        {quantity}
      </output>
      <button
        type="button"
        onClick={() => setQuantity(productId, Math.min(quantity + 1, MAX_QUANTITY))}
        disabled={quantity >= MAX_QUANTITY}
        aria-label="Aumenta quantità"
        className="flex w-11 shrink-0 items-center justify-center text-brand transition-colors hover:bg-brand-tint disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
