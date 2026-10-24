import "server-only";
import { bundles } from "@/lib/mock/bundles";
import { categories } from "@/lib/mock/categories";
import { products } from "@/lib/mock/products";
import type { Bundle, Category, CategorySlug, DealType, Product } from "@/lib/types";

// Data layer del catalogo. Oggi legge dai mock; quando arriverà il database
// basterà sostituire il corpo di queste funzioni mantenendo le firme.

export interface ProductFilters {
  category?: CategorySlug;
  subcategory?: string;
  query?: string;
  deal?: DealType | "any";
  ids?: string[];
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const q = filters.query?.trim().toLowerCase();
  return products.filter((p) => {
    if (filters.ids && !filters.ids.includes(p.id)) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.subcategory && p.subcategory !== filters.subcategory) return false;
    if (filters.deal === "any" && !p.deal) return false;
    if (filters.deal && filters.deal !== "any" && p.deal !== filters.deal) return false;
    if (q) {
      const haystack = [p.name, p.brand, p.format, ...p.tags].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

export async function getProductCount(category: CategorySlug): Promise<number> {
  return products.filter((p) => p.category === category).length;
}

/** Tutto il catalogo: usato per idratare il carrello lato client. */
export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getBundles(): Promise<Bundle[]> {
  return bundles;
}
