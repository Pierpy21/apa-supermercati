"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { advanceOrderStatus } from "@/app/actions/orders";
import { useToast } from "@/components/ui/toast-provider";
import type { OrderStatus } from "@/lib/types";

export interface AdvanceStatusButtonProps {
  orderId: string;
  status: OrderStatus;
}

export function AdvanceStatusButton({ orderId, status }: AdvanceStatusButtonProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [isPending, startTransition] = useTransition();
  const finished = status === "consegnato";

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await advanceOrderStatus(orderId);
        if (!result.success) {
          notify(result.error);
          return;
        }
        notify("Stato ordine aggiornato");
        router.refresh();
      } catch {
        notify("Aggiornamento non riuscito. Riprova.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">
        Passa allo stato successivo quando la spesa è pronta o affidata al rider.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || finished}
        className="flex h-10 w-fit items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-brand-tint disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-surface"
      >
        {isPending ? "Aggiornamento…" : "Aggiorna stato ordine"}
      </button>
      {finished && <p className="text-xs text-ink-muted">Ordine già consegnato: nessun passaggio successivo.</p>}
    </div>
  );
}
