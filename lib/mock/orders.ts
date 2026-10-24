import type { Order, OrderStatus } from "@/lib/types";
import { customer } from "./customer";

export const orderStatuses: { status: OrderStatus; label: string; description: string }[] = [
  { status: "ricevuto", label: "Ricevuto", description: "Abbiamo ricevuto il tuo ordine." },
  { status: "confermato", label: "Confermato", description: "Fascia oraria bloccata, l'ordine è stato inviato ai reparti." },
  { status: "in-preparazione", label: "In preparazione", description: "I nostri addetti stanno preparando la tua spesa." },
  { status: "pronto", label: "Pronto", description: "Buste controllate e conservate in cella frigo, pronte per il rider." },
  { status: "in-consegna", label: "In consegna", description: "Il rider APA è in viaggio verso il tuo indirizzo." },
  { status: "consegnato", label: "Consegnato", description: "Spesa consegnata. Grazie per aver scelto APA Supermercati!" },
];

const address = customer.addresses[0];

/** Storico ordini iniziale (seed). Gli ordini nuovi vengono aggiunti in memoria. */
export const seedOrders: Order[] = [
  {
    id: "APA-1071",
    createdAt: "2026-10-17T09:12:00.000Z",
    status: "consegnato",
    lines: [
      { productId: "latte-intero-apa", name: "Latte fresco intero alta qualità", quantity: 2, unitPrice: 1.49 },
      { productId: "uova-bio-6pz", name: "Uova fresche bio da allevamento a terra", quantity: 1, unitPrice: 2.29 },
      { productId: "yogurt-greco-500g", name: "Yogurt greco bianco 0% colato", quantity: 2, unitPrice: 2.45 },
      { productId: "burro-centrifuga-250g", name: "Burro tradizionale di centrifuga", quantity: 1, unitPrice: 2.69 },
      { productId: "pane-casereccio-500g", name: "Pane casereccio di semola", quantity: 1, unitPrice: 1.8 },
      { productId: "arance-tarocco-2kg", name: "Arance rosse di Sicilia Tarocco IGP", quantity: 1, unitPrice: 2.9 },
    ],
    slot: { id: "2026-10-17-18", date: "2026-10-17", dayLabel: "Sabato 17 ottobre", start: "18:00", end: "19:30", remaining: 0 },
    address,
    substitution: "ask",
    paymentMethodId: "card-4821",
    totals: { itemCount: 8, subtotal: 17.56, savings: 1.68, deliveryFee: 2.9, total: 20.46 },
  },
  {
    id: "APA-1058",
    createdAt: "2026-10-09T16:40:00.000Z",
    status: "consegnato",
    lines: [
      { productId: "spaghetti-500g", name: "Spaghetti di grano duro siciliano", quantity: 4, unitPrice: 0.89 },
      { productId: "passata-pomodoro-700g", name: "Passata di pomodoro", quantity: 3, unitPrice: 0.99 },
      { productId: "petto-pollo-500g", name: "Petto di pollo a fette", quantity: 2, unitPrice: 5.9 },
      { productId: "acqua-naturale-6x15", name: "Acqua minerale naturale", quantity: 2, unitPrice: 2.59 },
      { productId: "olio-evo-1l", name: "Olio extravergine di oliva", quantity: 1, unitPrice: 9.9 },
    ],
    slot: { id: "2026-10-09-20", date: "2026-10-09", dayLabel: "Venerdì 9 ottobre", start: "20:00", end: "21:00", remaining: 0 },
    address,
    substitution: "equivalent",
    paymentMethodId: "pos",
    totals: { itemCount: 12, subtotal: 34.41, savings: 3.04, deliveryFee: 2.9, total: 37.31 },
  },
];
