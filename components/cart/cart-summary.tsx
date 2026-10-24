"use client";

import { useCart } from "@/components/cart/cart-provider";
import { FREE_DELIVERY_EUR, MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";

interface Goal {
  label: string;
  percent: number;
}

export function CartSummary() {
  const { totals } = useCart();
  const { subtotal, savings, deliveryFee, total, missingToMinimum, missingToFreeDelivery } = totals;

  // Una sola soglia alla volta: prima il minimo d'ordine, poi la consegna gratuita.
  let goal: Goal | null = null;
  if (missingToMinimum > 0) {
    goal = {
      label: `Mancano ${formatEur(missingToMinimum)} per il minimo d'ordine`,
      percent: Math.min(100, (subtotal / MIN_ORDER_EUR) * 100),
    };
  } else if (missingToFreeDelivery > 0) {
    goal = {
      label: `Ancora ${formatEur(missingToFreeDelivery)} per la consegna gratuita`,
      percent: Math.min(100, (subtotal / FREE_DELIVERY_EUR) * 100),
    };
  }

  const deliveryText = subtotal === 0 ? "—" : deliveryFee === 0 ? "Gratis" : formatEur(deliveryFee);

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">Subtotale</dt>
          <dd className="font-medium">{formatEur(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-soft">Risparmio offerte</dt>
            <dd className="font-medium text-promo">−{formatEur(savings)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">Consegna</dt>
          <dd className={deliveryFee === 0 && subtotal > 0 ? "font-medium text-brand" : "font-medium"}>
            {deliveryText}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-3">
          <dt className="font-display text-base font-bold">Totale</dt>
          <dd className="font-display text-xl font-bold">{formatEur(total)}</dd>
        </div>
      </dl>

      {goal ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-soft">{goal.label}</p>
          <div
            role="progressbar"
            aria-label={goal.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(goal.percent)}
            className="h-1.5 w-full overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${goal.percent}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-brand">Consegna gratuita inclusa</p>
      )}
    </div>
  );
}
