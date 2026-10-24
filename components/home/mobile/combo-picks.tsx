import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import type { Bundle, Category, Product } from "@/lib/types";
import { AddBundleButton } from "./add-bundle-button";

interface ComboPicksProps {
  bundle: Bundle;
  products: Product[];
  personalDeals: Product[];
  freshCategory: Category;
}

/** Ritorna l'offerta con lo sconto più alto */
function bestDeal(deals: Product[]): Product | null {
  return [...deals].sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0))[0] ?? null;
}

interface DealTileProps {
  title: string;
  href: string;
  product: Product;
}

function DealTile({ title, href, product }: DealTileProps) {
  const discount = discountPercent(product);
  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl bg-surface p-3 ring-1 ring-line transition-shadow hover:shadow-sm"
    >
      <span className="font-display text-sm font-semibold text-ink">{title}</span>
      <span className="my-2 flex flex-1 items-center justify-center">
        <Image src={product.image} alt="" width={120} height={120} unoptimized className="h-auto w-16 md:w-24" />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-base font-bold text-ink">{formatEur(product.price)}</span>
        {discount ? <span className="text-[11px] font-semibold text-promo">-{discount}%</span> : null}
      </span>
      <span className="truncate text-[11px] text-ink-muted">{product.name}</span>
    </Link>
  );
}

/** Riquadri a griglia della home: kit pronto, offerte e freschi del giorno */
export function ComboPicks({ bundle, products, personalDeals, freshCategory }: ComboPicksProps) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = bundle.items.flatMap((item) => {
    const product = byId.get(item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const bundleTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const personal = bestDeal(personalDeals);
  const fromBakery = products.find((p) => p.category === "pane-pasticceria" && p.inStock && !p.deal);
  const freshProducts = products.filter((p) => p.category === freshCategory.slug);
  const freshFrom = Math.min(...freshProducts.map((p) => p.price));

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.3fr_1fr_1fr] md:gap-4">
      <article className="row-span-2 flex flex-col gap-2.5 rounded-2xl bg-brand p-3 text-white">
        <div className="px-1 pt-1">
          <h3 className="font-display text-base font-semibold">{bundle.name}</h3>
          <p className="text-xs text-white/75">{bundle.description}</p>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-2.5 rounded-xl bg-surface p-2 text-ink">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper">
                <Image src={item.product.image} alt="" width={120} height={120} unoptimized className="h-auto w-8" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-1 font-display text-sm font-semibold">{item.label}</span>
                <span className="line-clamp-1 text-[11px] text-ink-muted">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <AddBundleButton
          name={bundle.name}
          lines={items.map(({ productId, quantity }) => ({ productId, quantity }))}
          total={bundleTotal}
        />
      </article>

      {personal ? <DealTile title="Per te" href="/offerte" product={personal} /> : null}
      {fromBakery ? <DealTile title="Dal forno" href="/reparti/pane-pasticceria" product={fromBakery} /> : null}

      <Link
        href={`/reparti/${freshCategory.slug}`}
        className="relative col-span-2 flex min-h-32 md:min-h-40 overflow-hidden rounded-2xl bg-surface p-4 ring-1 ring-line transition-shadow hover:shadow-sm"
      >
        {/* Forma decorativa a tinta piatta dietro l'illustrazione */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-1/2 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]"
          style={{ backgroundColor: freshCategory.tint }}
        />
        <span className="relative z-10 flex flex-col">
          <span className="font-display text-base font-semibold text-ink">Freschi del giorno</span>
          <span className="text-xs text-ink-soft">{freshCategory.description}</span>
          {Number.isFinite(freshFrom) ? (
            <span className="mt-auto pt-3 font-display text-lg font-bold text-ink">
              <span className="text-xs font-normal text-ink-muted">da </span>
              {formatEur(freshFrom)}
            </span>
          ) : null}
        </span>
        <Image
          src={freshCategory.image}
          alt=""
          width={180}
          height={140}
          unoptimized
          className="category-art relative z-10 ml-auto h-auto w-32 shrink-0 self-end md:w-44"
        />
      </Link>
    </div>
  );
}
