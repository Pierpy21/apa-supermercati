import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SubcategoryFilter } from "@/components/catalog/subcategory-filter";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getCategory, getProducts } from "@/lib/data/catalog";
import { discountPercent } from "@/lib/pricing";
import type { Category, Product } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: "Predefiniti" },
  { value: "prezzo", label: "Prezzo crescente" },
  { value: "nome", label: "Nome A-Z" },
  { value: "offerte", label: "Offerte prima" },
];

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(props: PageProps<"/reparti/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return { title: "Reparto non trovato" };
  return { title: category.name, description: category.description };
}

// params letti dentro Suspense: la navigazione mostra subito lo skeleton (instant navigation)
export default function CategoryPage(props: PageProps<"/reparti/[slug]">) {
  return (
    <Suspense fallback={<CategoryProductsSkeleton />}>
      <CategoryContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function CategoryContent(props: Pick<PageProps<"/reparti/[slug]">, "params" | "searchParams">) {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <nav aria-label="Percorso" className="hidden text-sm text-ink-muted md:block">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-ink hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {category.name}
          </li>
        </ol>
      </nav>

      <header
        style={{ backgroundColor: category.tint }}
        className="overflow-hidden rounded-2xl px-5 py-6 sm:px-10 sm:py-12 md:mt-4 md:rounded-xl"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{category.tagline}</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
              {category.name}
            </h1>
            <p className="mt-3 text-sm text-ink-soft sm:text-base">{category.description}</p>
          </div>
          <Image
            src={category.image}
            alt=""
            width={200}
            height={160}
            unoptimized
            className="category-art h-auto w-28 shrink-0 sm:w-48"
          />
        </div>
      </header>

      <Suspense fallback={<CategoryProductsSkeleton />}>
        <CategoryProducts category={category} searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

interface CategoryProductsProps {
  category: Category;
  searchParams: Promise<SearchParams>;
}

async function CategoryProducts({ category, searchParams }: CategoryProductsProps) {
  const params = await searchParams;
  const requestedSub = firstValue(params.sub);
  const subcategory = category.subcategories.find((s) => s.slug === requestedSub)?.slug ?? null;
  const sort = sortKey(firstValue(params.ordina));

  const products = await getProducts({
    category: category.slug,
    ...(subcategory ? { subcategory } : {}),
  });
  const sorted = sortProducts(products, sort);
  const basePath = `/reparti/${category.slug}`;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <SubcategoryFilter
        basePath={basePath}
        subcategories={category.subcategories}
        activeSlug={subcategory}
        sort={sort}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{sorted.length}</span>{" "}
          {sorted.length === 1 ? "prodotto" : "prodotti"}
        </p>

        <nav aria-label="Ordina per" className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 md:w-auto [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max items-center gap-2 text-sm md:w-auto md:flex-wrap">
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sort;
              const href = buildHref(basePath, { sub: subcategory, ordina: option.value });
              return (
                <li key={option.label}>
                  <Link
                    href={href}
                    aria-current={active ? "true" : undefined}
                    className={`inline-flex items-center rounded-full px-3 py-1 font-medium transition-colors ${
                      active ? "bg-brand-tint text-brand" : "text-ink-soft hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <ProductGrid products={sorted} emptyMessage="Nessun prodotto in questo reparto al momento." />
    </div>
  );
}

function CategoryProductsSkeleton() {
  return (
    <div role="status" aria-label="Caricamento prodotti" className="mt-6 flex flex-col gap-5">
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 w-24 rounded-full border border-line bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function sortKey(value: string | null): string | null {
  return value === "prezzo" || value === "nome" || value === "offerte" ? value : null;
}

function sortProducts(products: Product[], sort: string | null): Product[] {
  const list = [...products];
  switch (sort) {
    case "prezzo":
      return list.sort((a, b) => a.price - b.price);
    case "nome":
      return list.sort((a, b) => a.name.localeCompare(b.name, "it"));
    case "offerte":
      return list.sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0));
    default:
      return list;
  }
}

function buildHref(basePath: string, params: Record<string, string | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
