import { DELIVERY_FEE_EUR, MIN_ORDER_EUR } from "./constants";
import type { CartLine, CartTotals, Product } from "./types";

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcolo unico dei totali, usato sia dal carrello client sia dal server
 * al momento della conferma ordine (il server ricalcola sempre i prezzi).
 */
export function calculateTotals(lines: CartLine[], products: Product[]): CartTotals {
  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  let savings = 0;
  let itemCount = 0;

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) continue;
    subtotal += product.price * line.quantity;
    itemCount += line.quantity;
    if (product.listPrice) savings += (product.listPrice - product.price) * line.quantity;
  }

  subtotal = round(subtotal);
  // Consegna a costo fisso: nessuna soglia di gratuità
  const deliveryFee = subtotal === 0 ? 0 : DELIVERY_FEE_EUR;

  return {
    itemCount,
    subtotal,
    savings: round(savings),
    deliveryFee,
    total: round(subtotal + deliveryFee),
    missingToMinimum: round(Math.max(0, MIN_ORDER_EUR - subtotal)),
    canCheckout: subtotal >= MIN_ORDER_EUR,
  };
}

export function discountPercent(product: Product): number | null {
  if (!product.listPrice) return null;
  return Math.round((1 - product.price / product.listPrice) * 100);
}
