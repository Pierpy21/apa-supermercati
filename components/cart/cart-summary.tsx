"use client";

import { useCart } from "@/components/cart/cart-provider";
import { MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";

interface Goal {
  label: string;
  percent: number;
}

export function CartSummary() {
  const { totals } = useCart();
  const { subtotal, savings, deliveryFee, total, missingToMinimum } = totals;

  // Unica soglia: il minimo d'ordine
  const goal: Goal | null =
    missingToMinimum > 0
      ? {
          label: `Mancano ${formatEur(missingToMinimum)} di spesa per il minimo d'ordine (consegna esclusa)`,
          percent: Math.min(100, (subtotal / MIN_ORDER_EUR) * 100),
        }
      : null;

  const deliveryText = subtotal === 0 ? "—" : formatEur(deliveryFee);

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
          <dd className="font-medium">{deliveryText}</dd>
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
        <p className="text-sm font-medium text-brand">Minimo d&apos;ordine raggiunto</p>
      )}
    </div>
  );
}
