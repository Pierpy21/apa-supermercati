import "server-only";
import { connection } from "next/server";
import { getProducts } from "@/lib/data/catalog";
import { orderStatuses, seedOrders } from "@/lib/mock/orders";
import { calculateTotals } from "@/lib/pricing";
import type {
  Address,
  CartLine,
  DeliverySlot,
  Order,
  OrderLine,
  Product,
  SubstitutionPreference,
} from "@/lib/types";

// Data layer degli ordini. Oggi usa uno store in memoria inizializzato dai mock;
// quando arriverà il database basterà sostituire il corpo di queste funzioni
// mantenendo le firme.

const FIRST_ORDER_NUMBER = 1084;

export interface CreateOrderInput {
  lines: CartLine[];
  slot: DeliverySlot;
  address: Address;
  substitution: SubstitutionPreference;
  paymentMethodId: string;
  notes?: string | undefined;
}

interface OrderStore {
  orders: Order[];
  nextNumber: number;
}

// Su globalThis per sopravvivere all'HMR in sviluppo.
const globalForOrders = globalThis as typeof globalThis & {
  __apaOrderStore?: OrderStore;
};

function getStore(): OrderStore {
  if (!globalForOrders.__apaOrderStore) {
    globalForOrders.__apaOrderStore = {
      orders: structuredClone(seedOrders),
      nextNumber: FIRST_ORDER_NUMBER,
    };
  }
  return globalForOrders.__apaOrderStore;
}

export async function getOrders(): Promise<Order[]> {
  await connection();
  return structuredClone(getStore().orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  await connection();
  const order = getStore().orders.find((item) => item.id === id);
  return order ? structuredClone(order) : null;
}

/**
 * Crea l'ordine. I prezzi e i nomi vengono sempre ricalcolati dal catalogo,
 * indipendentemente da ciò che arriva dal client.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Accorpa eventuali righe duplicate dello stesso prodotto.
  const quantities = new Map<string, number>();
  for (const line of input.lines) {
    quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
  }
  const lines: CartLine[] = Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));

  const products = await getProducts({ ids: lines.map((line) => line.productId) });
  const byId = new Map<string, Product>(products.map((product): [string, Product] => [product.id, product]));

  const orderLines: OrderLine[] = lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new Error(`Prodotto non trovato nel catalogo: ${line.productId}`);
    }
    return {
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      unitPrice: product.price,
    };
  });

  const totals = calculateTotals(lines, products);
  const store = getStore();
  const order: Order = {
    id: `APA-${store.nextNumber}`,
    createdAt: new Date().toISOString(),
    status: "ricevuto",
    lines: orderLines,
    slot: { ...input.slot },
    address: { ...input.address },
    substitution: input.substitution,
    paymentMethodId: input.paymentMethodId,
    ...(input.notes ? { notes: input.notes } : {}),
    totals: {
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      savings: totals.savings,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
    },
  };

  store.nextNumber += 1;
  store.orders.unshift(order);
  return structuredClone(order);
}

/** Passa allo stato successivo di `orderStatuses`; si ferma a "consegnato". */
export async function advanceOrder(id: string): Promise<Order | null> {
  const store = getStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) return null;

  const statuses = orderStatuses.map((item) => item.status);
  const index = statuses.indexOf(order.status);
  const next = statuses[index + 1];
  if (index >= 0 && next) {
    order.status = next;
  }
  return structuredClone(order);
}
