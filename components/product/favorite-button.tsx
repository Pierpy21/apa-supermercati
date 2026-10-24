"use client";

import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";

export interface FavoriteButtonProps {
  productId: string;
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useCart();
  const { notify } = useToast();
  const isFavorite = favorites.has(productId);

  function handleClick() {
    const nowFavorite = toggleFavorite(productId);
    notify(nowFavorite ? "Aggiunto ai preferiti" : "Rimosso dai preferiti");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label="Salva nei preferiti"
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong ${
        isFavorite ? "text-promo" : "text-ink-soft hover:text-promo"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
