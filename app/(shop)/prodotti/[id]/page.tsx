import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FavoriteButton } from "@/components/product/favorite-button";
import { PriceTag } from "@/components/product/price-tag";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { QuantityControl } from "@/components/product/quantity-control";
import { getAllProducts, getCategory, getProduct, getProducts } from "@/lib/data/catalog";
import { formatEur } from "@/lib/format";
import { MIN_ORDER_EUR, STORE_CITY } from "@/lib/constants";

const RELATED_LIMIT = 5;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata(props: PageProps<"/prodotti/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProduct(id);
  if (!product) return { title: "Prodotto non trovato" };
  return {
    title: product.name,
    description: product.description || `${product.name}, ${product.format}`,
  };
}

// params letti dentro Suspense: la navigazione mostra subito lo skeleton (instant navigation)
export default function ProductPage(props: PageProps<"/prodotti/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square rounded-xl border border-line bg-surface" />
      <div className="space-y-4">
        <div className="h-4 w-40 rounded bg-line/60" />
        <div className="h-9 w-3/4 rounded bg-line/60" />
        <div className="h-12 w-32 rounded bg-line/40" />
        <div className="h-11 w-48 rounded-lg bg-line/40" />
      </div>
    </div>
  );
}

async function ProductContent(props: Pick<PageProps<"/prodotti/[id]">, "params">) {
  const { id } = await props.params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [category, sameCategory] = await Promise.all([
    getCategory(product.category),
    getProducts({ category: product.category }),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, RELATED_LIMIT);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-10">
        <ProductGallery
          images={[{ src: product.image, label: product.name }, ...(product.gallery ?? [])]}
          dimmed={!product.inStock}
        />

        <div className="flex flex-col">
          <nav aria-label="Percorso" className="hidden text-sm text-ink-muted md:block">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-ink hover:underline">
                  Home
                </Link>
              </li>
              {category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/reparti/${category.slug}`} className="hover:text-ink hover:underline">
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="min-w-0 truncate text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{product.format}</p>

          <div className="mt-6">
            <PriceTag product={product} size="lg" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-full max-w-xs">
              <QuantityControl productId={product.id} size="md" />
            </div>
            <FavoriteButton productId={product.id} />
          </div>

          {product.description && (
            <p className="mt-8 leading-relaxed text-ink-soft">{product.description}</p>
          )}

          <div className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">
            <p>{`Consegna a domicilio a ${STORE_CITY} · Minimo d'ordine ${formatEur(MIN_ORDER_EUR)}`}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="altri-prodotti" className="mt-12 border-t border-line pt-10">
          <h2 id="altri-prodotti" className="font-display text-xl font-bold text-ink sm:text-2xl">
            Altri prodotti del reparto
          </h2>
          <div className="mt-5">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
