// Contratti dati condivisi tra UI, data layer e (in futuro) database.

export type CategorySlug =
  | "latte-uova-yogurt"
  | "frutta-verdura"
  | "carne-pesce"
  | "pane-pasticceria"
  | "salumi-formaggi"
  | "dispensa"
  | "surgelati"
  | "bevande";

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Nome corto per spazi stretti (cerchi reparto su mobile) */
  shortName: string;
  /** Etichetta breve mostrata sopra il titolo (es. "Banco taglio") */
  tagline: string;
  description: string;
  image: string;
  /** Colore di sfondo del blocco reparto (tinta piatta) */
  tint: string;
  subcategories: Subcategory[];
}

/** personal = offerta personalizzata sullo storico. Nuovi tipi di offerta si aggiungono qui. */
export type DealType = "personal";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  /** es. "Bottiglia 1 L" */
  format: string;
  /** es. "€ 1,49 / L" */
  unitPrice: string;
  price: number;
  /** Prezzo pieno quando il prodotto è in offerta */
  listPrice: number | null;
  deal: DealType | null;
  /** Motivo dell'offerta personalizzata (es. "Lo compri spesso") */
  dealReason: string | null;
  image: string;
  description: string;
  tags: string[];
  inStock: boolean;
}

/** Kit di prodotti pronti da aggiungere al carrello in un colpo solo */
export interface Bundle {
  id: string;
  name: string;
  description: string;
  /** label: nome corto mostrato nel riquadro del kit */
  items: { productId: string; quantity: number; label: string; note: string }[];
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  /** Importo mancante per raggiungere il minimo d'ordine (0 se raggiunto) */
  missingToMinimum: number;
  /** Importo mancante per la consegna gratuita (0 se raggiunta) */
  missingToFreeDelivery: number;
  canCheckout: boolean;
}

export interface DeliverySlot {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  dayLabel: string;
  start: string;
  end: string;
  remaining: number;
  recommended?: boolean;
}

export interface DeliveryZone {
  cap: string;
  name: string;
  served: boolean;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  street: string;
  cap: string;
  city: string;
  notes?: string;
}

export type SubstitutionPreference = "ask" | "equivalent" | "refund";

export type PaymentMethodType = "card" | "wallet" | "pos";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
}

export interface CustomerPreferences {
  /** Sempre attive: aggiornamenti di servizio sull'ordine */
  serviceUpdates: true;
  promotions: boolean;
  personalizedOffers: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  defaultAddressId: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  preferences: CustomerPreferences;
  favoriteProductIds: string[];
}

export type OrderStatus =
  | "ricevuto"
  | "confermato"
  | "in-preparazione"
  | "pronto"
  | "in-consegna"
  | "consegnato";

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  /** ISO datetime */
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  slot: DeliverySlot;
  address: Address;
  substitution: SubstitutionPreference;
  paymentMethodId: string;
  /** Note per il rider */
  notes?: string;
  totals: Pick<CartTotals, "subtotal" | "savings" | "deliveryFee" | "total" | "itemCount">;
}

/** Risposta standard di Server Actions e Route Handlers */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
