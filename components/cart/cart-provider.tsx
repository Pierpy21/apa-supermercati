"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CART_STORAGE_KEY, FAVORITES_STORAGE_KEY } from "@/lib/constants";
import { calculateTotals } from "@/lib/pricing";
import type { CartLine, CartTotals, Product } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  totals: CartTotals;
  /** Catalogo indicizzato per id, per mostrare nome/prezzo delle righe */
  productsById: Map<string, Product>;
  quantityOf: (productId: string) => number;
  setQuantity: (productId: string, quantity: number) => void;
  add: (productId: string, quantity?: number) => void;
  /** Sostituisce il carrello (riordino, lista della spesa) */
  replace: (lines: CartLine[]) => void;
  /** Aggiunge più righe sommando le quantità */
  merge: (lines: CartLine[]) => void;
  clear: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  favorites: Set<string>;
  toggleFavorite: (productId: string) => boolean;
  /** true dopo la lettura da localStorage: evita mismatch di idratazione */
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage non disponibile (navigazione privata): il carrello resta in memoria
  }
}

interface CartProviderProps {
  products: Product[];
  initialFavorites: string[];
  children: React.ReactNode;
}

export function CartProvider({ products, initialFavorites, children }: CartProviderProps) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(initialFavorites));
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  useEffect(() => {
    const storedLines = readStorage<CartLine[]>(CART_STORAGE_KEY, []);
    const storedFavorites = readStorage<string[] | null>(FAVORITES_STORAGE_KEY, null);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronizzazione con storage esterno al mount
    setLines(storedLines.filter((l) => productsById.has(l.productId) && l.quantity > 0));
    if (storedFavorites) setFavorites(new Set(storedFavorites));
    setHydrated(true);
  }, [productsById]);

  useEffect(() => {
    if (hydrated) writeStorage(CART_STORAGE_KEY, lines);
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(FAVORITES_STORAGE_KEY, [...favorites]);
  }, [favorites, hydrated]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      if (quantity <= 0) return next;
      const index = prev.findIndex((l) => l.productId === productId);
      const line = { productId, quantity: Math.min(quantity, 99) };
      if (index === -1) return [...prev, line];
      next.splice(index, 0, line);
      return next;
    });
  }, []);

  const quantityOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines],
  );

  const add = useCallback(
    (productId: string, quantity = 1) => setQuantity(productId, quantityOf(productId) + quantity),
    [quantityOf, setQuantity],
  );

  const replace = useCallback(
    (next: CartLine[]) => setLines(next.filter((l) => productsById.has(l.productId) && l.quantity > 0)),
    [productsById],
  );

  const merge = useCallback(
    (incoming: CartLine[]) =>
      setLines((prev) => {
        const map = new Map(prev.map((l) => [l.productId, l.quantity]));
        for (const l of incoming) {
          if (!productsById.has(l.productId)) continue;
          map.set(l.productId, Math.min((map.get(l.productId) ?? 0) + l.quantity, 99));
        }
        return [...map].map(([productId, quantity]) => ({ productId, quantity }));
      }),
    [productsById],
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      const willBeFavorite = !favorites.has(productId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (willBeFavorite) next.add(productId);
        else next.delete(productId);
        return next;
      });
      return willBeFavorite;
    },
    [favorites],
  );

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const totals = useMemo(() => calculateTotals(lines, products), [lines, products]);

  const value: CartContextValue = {
    lines,
    totals,
    productsById,
    quantityOf,
    setQuantity,
    add,
    replace,
    merge,
    clear,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    favorites,
    toggleFavorite,
    hydrated,
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve essere usato dentro <CartProvider>");
  return ctx;
}
