"use server";

import { revalidatePath } from "next/cache";
import { MIN_ORDER_EUR } from "@/lib/constants";
import { findZone, getCustomer, getDeliverySlots, getPaymentMethods } from "@/lib/data/customer";
import { getProducts } from "@/lib/data/catalog";
import { advanceOrder, createOrder, getOrder } from "@/lib/data/orders";
import { formatEur } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";
import type { ActionResult, CartLine, Order, Product } from "@/lib/types";
import {
  orderIdSchema,
  placeOrderSchema,
  zodFieldErrors,
  type PlaceOrderInput,
} from "@/lib/validation/schemas";

const GENERIC_ERROR = "Operazione non riuscita. Riprova tra poco.";

/** Crea un ordine dopo aver ricontrollato tutto lato server. */
export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<{ orderId: string }>> {
  try {
    // TODO auth: verificare la sessione e usare il cliente autenticato.
    // Oggi il cliente è sempre quello mock (lib/mock/customer.ts).
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Controlla i dati dell'ordine.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }
    const { lines, slotId, addressId, substitution, paymentMethodId, notes } = parsed.data;

    const products = await getProducts({ ids: lines.map((line) => line.productId) });
    const byId = new Map<string, Product>(products.map((product): [string, Product] => [product.id, product]));

    if (lines.some((line) => !byId.has(line.productId))) {
      return {
        success: false,
        error: "Alcuni prodotti non sono più nel catalogo. Rimuovili dal carrello per continuare.",
      };
    }

    const unavailable = products.filter((product) => !product.inStock).map((product) => product.name);
    if (unavailable.length > 0) {
      return {
        success: false,
        error: `Questi prodotti non sono disponibili: ${unavailable.join(", ")}. Rimuovili dal carrello per continuare.`,
      };
    }

    const totals = calculateTotals(lines, products);
    if (!totals.canCheckout) {
      return {
        success: false,
        error: `Il minimo d'ordine è di ${formatEur(MIN_ORDER_EUR)}. Ti mancano ${formatEur(totals.missingToMinimum)}.`,
      };
    }

    const slots = await getDeliverySlots();
    const slot = slots.find((item) => item.id === slotId);
    if (!slot) {
      return { success: false, error: "La fascia di consegna selezionata non è più disponibile. Scegline un'altra." };
    }
    if (slot.remaining <= 0) {
      return { success: false, error: "La fascia di consegna selezionata è esaurita. Scegline un'altra." };
    }

    const customer = await getCustomer();
    const address = customer.addresses.find((item) => item.id === addressId);
    if (!address) {
      return { success: false, error: "Indirizzo di consegna non trovato." };
    }

    const zone = await findZone(address.cap);
    if (!zone || !zone.served) {
      return { success: false, error: `Non consegniamo ancora al CAP ${address.cap}.` };
    }

    const paymentMethods = await getPaymentMethods();
    if (!paymentMethods.some((method) => method.id === paymentMethodId)) {
      return { success: false, error: "Metodo di pagamento non valido." };
    }

    const order = await createOrder({
      lines,
      slot,
      address,
      substitution,
      paymentMethodId,
      notes,
    });

    revalidatePath("/ordini");
    return { success: true, data: { orderId: order.id } };
  } catch (error) {
    console.error("[placeOrder]", error);
    return { success: false, error: "Non siamo riusciti a confermare l'ordine. Riprova tra poco." };
  }
}

/** Fa avanzare lo stato dell'ordine (tracking). Sostituire con il gestionale del negozio. */
export async function advanceOrderStatus(orderId: string): Promise<ActionResult<Order>> {
  try {
    // TODO auth: consentire l'avanzamento solo al personale del negozio.
    const parsed = orderIdSchema.safeParse(orderId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Numero ordine non valido." };
    }

    const order = await advanceOrder(parsed.data);
    if (!order) {
      return { success: false, error: "Ordine non trovato." };
    }

    revalidatePath("/ordini");
    revalidatePath(`/ordini/${order.id}`);
    return { success: true, data: order };
  } catch (error) {
    console.error("[advanceOrderStatus]", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/** Righe da rimettere nel carrello, escludendo i prodotti non più disponibili. */
export async function getReorderLines(orderId: string): Promise<ActionResult<CartLine[]>> {
  try {
    // TODO auth: l'ordine deve appartenere al cliente in sessione.
    const parsed = orderIdSchema.safeParse(orderId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Numero ordine non valido." };
    }

    const order = await getOrder(parsed.data);
    if (!order) {
      return { success: false, error: "Ordine non trovato." };
    }

    const products = await getProducts({ ids: order.lines.map((line) => line.productId) });
    const available = new Set(products.filter((product) => product.inStock).map((product) => product.id));

    const lines: CartLine[] = order.lines
      .filter((line) => available.has(line.productId))
      .map((line) => ({ productId: line.productId, quantity: Math.min(99, line.quantity) }));

    if (lines.length === 0) {
      return { success: false, error: "Nessun prodotto di questo ordine è più disponibile." };
    }

    return { success: true, data: lines };
  } catch (error) {
    console.error("[getReorderLines]", error);
    return { success: false, error: GENERIC_ERROR };
  }
}
