import Link from "next/link";
import type { Subcategory } from "@/lib/types";

export interface SubcategoryFilterProps {
  /** Percorso del reparto, es. "/reparti/frutta-verdura" */
  basePath: string;
  subcategories: Subcategory[];
  /** Slug della sottocategoria attiva, null per "Tutti" */
  activeSlug: string | null;
  /** Ordinamento corrente, conservato nei link */
  sort?: string | null;
}

const chipBase =
  "inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors";
const chipActive = "border-ink bg-ink text-white";
const chipIdle = "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink";

export function SubcategoryFilter({ basePath, subcategories, activeSlug, sort = null }: SubcategoryFilterProps) {
  const items: { slug: string | null; name: string }[] = [
    { slug: null, name: "Tutti" },
    ...subcategories.map((s) => ({ slug: s.slug, name: s.name })),
  ];

  function hrefFor(slug: string | null): string {
    const params = new URLSearchParams();
    if (slug) params.set("sub", slug);
    if (sort) params.set("ordina", sort);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav aria-label="Sottocategorie" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-2 pb-1 md:w-auto md:flex-wrap">
        {items.map((item) => {
          const active = item.slug === activeSlug;
          return (
            <li key={item.slug ?? "tutti"}>
              <Link
                href={hrefFor(item.slug)}
                aria-current={active ? "page" : undefined}
                className={`${chipBase} ${active ? chipActive : chipIdle}`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
