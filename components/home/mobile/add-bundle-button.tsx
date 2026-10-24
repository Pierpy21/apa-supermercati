"use client";

import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { formatEur } from "@/lib/format";
import type { CartLine } from "@/lib/types";

interface AddBundleButtonProps {
  name: string;
  lines: CartLine[];
  total: number;
}

export function AddBundleButton({ name, lines, total }: AddBundleButtonProps) {
  const { merge } = useCart();
  const { notify } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        merge(lines);
        notify(`${name} aggiunto al carrello`);
      }}
      aria-label={`Aggiungi ${name} al carrello, ${formatEur(total)}`}
      className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-brand transition-colors hover:bg-brand-tint"
    >
      <span>Aggiungi</span>
      <span className="font-display">{formatEur(total)}</span>
    </button>
  );
}
