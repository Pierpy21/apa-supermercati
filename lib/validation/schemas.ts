import { z } from "zod";
import type { CategorySlug } from "@/lib/types";

// Schemi di validazione per input di Server Actions e Route Handlers.
// Ogni payload esterno passa da qui prima di toccare il data layer.

const CATEGORY_SLUGS = [
  "latte-uova-yogurt",
  "frutta-verdura",
  "carne-pesce",
  "pane-pasticceria",
  "salumi-formaggi",
  "dispensa",
  "surgelati",
  "bevande",
] as const satisfies readonly CategorySlug[];

export const cartLineSchema = z.object({
  productId: z.string().trim().min(1, "Prodotto non valido."),
  quantity: z
    .number({ error: "La quantità non è valida." })
    .int("La quantità deve essere un numero intero.")
    .min(1, "La quantità minima è 1.")
    .max(99, "La quantità massima è 99."),
});

export const placeOrderSchema = z.object({
  lines: z
    .array(cartLineSchema)
    .min(1, "Il carrello è vuoto.")
    .max(100, "Il carrello può contenere al massimo 100 prodotti.")
    .refine((lines) => new Set(lines.map((line) => line.productId)).size === lines.length, {
      error: "Lo stesso prodotto compare più volte nel carrello.",
    }),
  slotId: z.string().trim().min(1, "Scegli una fascia di consegna."),
  addressId: z.string().trim().min(1, "Scegli un indirizzo di consegna."),
  substitution: z.enum(["ask", "equivalent", "refund"], {
    error: "Scegli una preferenza di sostituzione valida.",
  }),
  paymentMethodId: z.string().trim().min(1, "Scegli un metodo di pagamento."),
  notes: z.string().trim().max(300, "Le note non possono superare 300 caratteri.").optional(),
});

export const capSchema = z.string().trim().regex(/^\d{5}$/, "Il CAP deve avere 5 cifre.");

export const addressSchema = z.object({
  id: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1, "Inserisci un'etichetta (es. Casa).").max(40, "Etichetta troppo lunga."),
  recipient: z.string().trim().min(1, "Inserisci il destinatario.").max(80, "Destinatario troppo lungo."),
  street: z.string().trim().min(3, "Inserisci via e numero civico.").max(120, "Indirizzo troppo lungo."),
  cap: capSchema,
  city: z.string().trim().min(1, "Inserisci la città.").max(80, "Città troppo lunga."),
  notes: z.string().trim().max(200, "Le note non possono superare 200 caratteri.").optional(),
});

export const preferencesSchema = z.object({
  weeklyPromotions: z.boolean({ error: "Valore non valido." }),
  personalizedOffers: z.boolean({ error: "Valore non valido." }),
});

export const shoppingListSchema = z
  .string({ error: "La lista non è valida." })
  .trim()
  .min(1, "Scrivi almeno un prodotto.")
  .max(2000, "La lista non può superare 2000 caratteri.");

export const orderIdSchema = z.string().trim().regex(/^APA-\d{1,10}$/, "Numero ordine non valido.");

export const productsQuerySchema = z.object({
  q: z.string().trim().max(100, "La ricerca non può superare 100 caratteri.").optional(),
  category: z.enum(CATEGORY_SLUGS, { error: "Reparto non valido." }).optional(),
  sub: z.string().trim().min(1).max(60, "Sottocategoria non valida.").optional(),
  deal: z.enum(["weekly", "personal", "any"], { error: "Tipo di offerta non valido." }).optional(),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type AddressFormInput = z.infer<typeof addressSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type ShoppingListInput = z.infer<typeof shoppingListSchema>;
export type ProductsQuery = z.infer<typeof productsQuerySchema>;

/**
 * Converte gli errori Zod in una mappa campo -> messaggi.
 * Usa il primo segmento del path (es. "lines", "cap"); gli errori senza path vanno sotto "form".
 */
export function zodFieldErrors<T>(error: z.ZodError<T>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    (result[key] ??= []).push(issue.message);
  }
  return result;
}
