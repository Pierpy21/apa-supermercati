import Link from "next/link";
import { CartButton } from "@/components/cart/cart-drawer";
import { AddressPopover } from "@/components/layout/address-popover";
import { SearchBar } from "@/components/layout/search-bar";
import { getCategories } from "@/lib/data/catalog";
import type { Customer } from "@/lib/types";

export interface SiteHeaderProps {
  customer: Customer;
}

/**
 * Header del negozio. Riga 1: logo, indirizzo, ricerca, account e carrello.
 * Riga 2: navigazione per reparto. Sotto i 768px la ricerca va a capo su una riga intera.
 */
export async function SiteHeader({ customer }: SiteHeaderProps) {
  const categories = await getCategories();
  const defaultAddress =
    customer.addresses.find((address) => address.id === customer.defaultAddressId) ?? customer.addresses[0];
  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 py-3 md:gap-x-3">
          <Link href="/" className="flex h-10 shrink-0 items-center gap-1.5">
            <span className="font-display text-2xl leading-none font-extrabold text-brand">APA</span>
            <span className="hidden text-sm font-medium text-ink-soft sm:inline">Supermercati</span>
          </Link>

          {defaultAddress ? <AddressPopover address={defaultAddress} /> : null}

          <div className="order-last w-full basis-full md:order-none md:w-auto md:flex-1 md:basis-auto">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/ordini"
              aria-label="Ordini"
              className="flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-ink hover:bg-paper hover:text-brand"
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
                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
                <path d="M9 8h6M9 12h6" />
              </svg>
              <span className="hidden lg:inline">Ordini</span>
            </Link>

            <Link
              href="/account"
              aria-label={`Account di ${customer.firstName} ${customer.lastName}`}
              className="flex h-10 items-center gap-2 rounded-lg px-1.5 text-sm font-semibold text-ink hover:bg-paper hover:text-brand"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand"
              >
                {initials}
              </span>
              <span className="hidden lg:inline">Account</span>
            </Link>

            <CartButton />
          </div>
        </div>
      </div>

      <nav aria-label="Reparti" className="bg-brand-deep text-white">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0">
            <Link
              href="/offerte?tipo=volantino"
              className="block rounded-full bg-tag px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-ink hover:bg-tag/80"
            >
              Offerte
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={`/reparti/${category.slug}`}
                className="block rounded-full px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
