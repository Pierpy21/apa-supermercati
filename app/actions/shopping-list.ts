"use server";

import { getProducts } from "@/lib/data/catalog";
import type { ActionResult, CartLine, Product } from "@/lib/types";
import { shoppingListSchema } from "@/lib/validation/schemas";

const MAX_ITEMS = 100;
const MAX_QUANTITY = 99;

/** Parole di servizio e unità di misura: non aiutano il riconoscimento del prodotto. */
const STOPWORDS = new Set([
  "di", "da", "del", "della", "dei", "delle", "il", "lo", "la", "le", "i", "gli",
  "un", "una", "uno", "al", "alla", "con", "e", "ed", "x",
  "kg", "g", "gr", "l", "lt", "ml", "pz", "conf", "confezione", "busta", "circa",
]);

// "2 latte", "2x latte", "3x yogurt" -> quantità iniziale
const PREFIX_QUANTITY = /^(\d{1,2})(?:\s*[x×]\s*|\s+)(?=\D)(.+)$/i;
// "latte x2" -> quantità finale
const SUFFIX_QUANTITY = /^(.+?)\s*[x×]\s*(\d{1,2})$/i;

interface ListItem {
  /** Testo originale della voce (senza spazi ai bordi) */
  raw: string;
  /** Nome del prodotto cercato, senza quantità */
  name: string;
  quantity: number;
}

interface IndexedProduct {
  product: Product;
  stems: Set<string>;
  nameStems: Set<string>;
}

function clampQuantity(value: number): number {
  return Number.isFinite(value) && value >= 1 ? Math.min(value, MAX_QUANTITY) : 1;
}

function parseItem(raw: string): ListItem {
  const prefix = PREFIX_QUANTITY.exec(raw);
  if (prefix) {
    const [, quantity = "1", name = raw] = prefix;
    return { raw, name: name.trim(), quantity: clampQuantity(Number(quantity)) };
  }
  const suffix = SUFFIX_QUANTITY.exec(raw);
  if (suffix) {
    const [, name = raw, quantity = "1"] = suffix;
    return { raw, name: name.trim(), quantity: clampQuantity(Number(quantity)) };
  }
  return { raw, name: raw, quantity: 1 };
}

/** Minuscole, senza accenti né punteggiatura. */
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Token utili: senza stopword, senza quantità numeriche o unità di misura. */
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 0)
    .filter((token) => !STOPWORDS.has(token))
    .filter((token) => !/^\d+[a-z]{0,3}$/.test(token));
}

/**
 * Radice semplice che unifica singolare e plurale italiano:
 * "uova"/"uovo", "arance"/"arancia", "mele"/"mela", "cornetti"/"cornetto".
 * Non serve una lingua completa: basta che la stessa forma venga prodotta per entrambi i lati.
 */
function stem(token: string): string {
  const withoutVowel = token.length > 3 ? token.replace(/[aeio]$/, "") : token;
  return withoutVowel.length > 3 && withoutVowel.endsWith("i")
    ? withoutVowel.slice(0, -1)
    : withoutVowel;
}

function stemsOf(text: string): string[] {
  return tokenize(text).map(stem);
}

function indexProducts(products: Product[]): IndexedProduct[] {
  return products.map((product) => {
    const nameStems = new Set(stemsOf(product.name));
    const stems = new Set([
      ...nameStems,
      ...stemsOf(product.brand),
      ...product.tags.flatMap((tag) => stemsOf(tag)),
    ]);
    return { product, stems, nameStems };
  });
}

/**
 * Miglior prodotto per una lista di radici. Considera solo prodotti disponibili.
 * Ordine: più parole trovate, poi in offerta, poi match nel nome.
 */
function findBestMatch(queryStems: string[], indexed: IndexedProduct[]): Product | null {
  const unique = Array.from(new Set(queryStems));
  let best: { entry: IndexedProduct; hits: number; nameHits: number } | null = null;

  for (const entry of indexed) {
    if (!entry.product.inStock) continue;

    const hits = unique.filter((s) => entry.stems.has(s)).length;
    if (hits === 0 || hits / unique.length < 0.5) continue;

    const nameHits = unique.filter((s) => entry.nameStems.has(s)).length;
    const isBetter =
      best === null ||
      hits > best.hits ||
      (hits === best.hits &&
        (entry.product.deal !== null) !== (best.entry.product.deal !== null) &&
        entry.product.deal !== null) ||
      (hits === best.hits &&
        (entry.product.deal !== null) === (best.entry.product.deal !== null) &&
        nameHits > best.nameHits);

    if (isBetter) best = { entry, hits, nameHits };
  }

  return best ? best.entry.product : null;
}

/**
 * Trasforma una lista di testo (una voce per riga o separata da virgole)
 * in un carrello modificabile. Le voci non riconosciute vengono restituite a parte.
 */
export async function buildCartFromList(text: string): Promise<
  ActionResult<{
    lines: CartLine[];
    matched: { query: string; productId: string }[];
    unmatched: string[];
  }>
> {
  try {
    const parsed = shoppingListSchema.safeParse(text);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "La lista non è valida." };
    }

    const rawItems = parsed.data
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (rawItems.length === 0) {
      return { success: false, error: "Scrivi almeno un prodotto nella lista." };
    }
    if (rawItems.length > MAX_ITEMS) {
      return { success: false, error: `La lista può contenere al massimo ${MAX_ITEMS} voci.` };
    }

    const indexed = indexProducts(await getProducts());
    const quantities = new Map<string, number>();
    const matched: { query: string; productId: string }[] = [];
    const unmatched: string[] = [];

    for (const rawItem of rawItems) {
      const item = parseItem(rawItem);
      const queryStems = stemsOf(item.name);
      const product = queryStems.length > 0 ? findBestMatch(queryStems, indexed) : null;

      if (!product) {
        unmatched.push(item.raw);
        continue;
      }

      matched.push({ query: item.name, productId: product.id });
      quantities.set(
        product.id,
        Math.min(MAX_QUANTITY, (quantities.get(product.id) ?? 0) + item.quantity),
      );
    }

    const lines: CartLine[] = Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
    return { success: true, data: { lines, matched, unmatched } };
  } catch (error) {
    console.error("[buildCartFromList]", error);
    return { success: false, error: "Non siamo riusciti a leggere la lista. Riprova tra poco." };
  }
}
