import { formatEur } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export interface PriceTagProps {
  product: Product;
  size?: "sm" | "lg";
}

/** Cartellino da scaffale: prezzo grande, etichetta sconto e prezzo al kg/L. */
export function PriceTag({ product, size = "sm" }: PriceTagProps) {
  const listPrice = product.listPrice;
  const discount = listPrice !== null ? discountPercent(product) : null;
  const isLarge = size === "lg";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`font-display font-bold leading-none text-ink ${isLarge ? "text-4xl sm:text-5xl" : "text-xl"}`}
        >
          {formatEur(product.price)}
        </span>

        {listPrice !== null && discount !== null && discount > 0 && (
          <>
            <span className="inline-flex items-center rounded bg-tag px-1.5 py-1 text-xs font-bold leading-none text-promo">
              -{discount}%
            </span>
            <s className="text-sm text-ink-muted line-through">
              <span className="sr-only">Prezzo pieno </span>
              {formatEur(listPrice)}
            </s>
          </>
        )}
      </div>

      <p className={`text-ink-muted ${isLarge ? "text-sm" : "text-xs"}`}>{product.unitPrice}</p>
    </div>
  );
}
