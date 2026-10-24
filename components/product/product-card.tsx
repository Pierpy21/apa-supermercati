import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/product/favorite-button";
import { PriceTag } from "@/components/product/price-tag";
import { QuantityControl } from "@/components/product/quantity-control";
import type { Product } from "@/lib/types";

export interface ProductCardProps {
  product: Product;
}

/**
 * Card prodotto. Non importa nulla di server-only: può essere usata
 * anche dentro componenti client (es. preferiti).
 */
export function ProductCard({ product }: ProductCardProps) {
  const productHref = `/prodotti/${product.id}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-sm">
      <div className="relative flex aspect-square items-center justify-center bg-paper">
        <Link
          href={productHref}
          tabIndex={-1}
          className="flex size-full items-center justify-center p-4"
        >
          <Image
            src={product.image}
            alt={product.name}
            width={120}
            height={120}
            unoptimized
            className={`size-30 object-contain ${product.inStock ? "" : "opacity-40"}`}
          />
        </Link>

        {product.deal === "personal" && (
          <span className="absolute left-2 top-2 z-10 rounded bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand">
            Per te
          </span>
        )}

        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs uppercase tracking-wide text-ink-muted">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug text-ink">
          <Link href={productHref} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-ink-soft">{product.format}</p>
        {product.deal === "personal" && product.dealReason && (
          <p className="text-xs font-medium text-brand">{product.dealReason}</p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-3">
          <PriceTag product={product} size="sm" />
          <QuantityControl productId={product.id} size="sm" />
        </div>
      </div>
    </article>
  );
}
