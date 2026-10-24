"use client";

import { useTransition } from "react";
import { getReorderLines } from "@/app/actions/orders";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";

export interface ReorderButtonProps {
  orderId: string;
}

export function ReorderButton({ orderId }: ReorderButtonProps) {
  const { merge, openDrawer } = useCart();
  const { notify } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await getReorderLines(orderId);
        if (!result.success) {
          notify(result.error);
          return;
        }
        merge(result.data);
        openDrawer();
        notify("Articoli aggiunti al carrello");
      } catch {
        notify("Non siamo riusciti a riordinare. Riprova.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
    >
      {isPending ? "Aggiunta in corso…" : "Riordina"}
    </button>
  );
}
