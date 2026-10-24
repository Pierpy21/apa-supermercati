import Link from "next/link";
import { getDeliverySlots } from "@/lib/data/customer";
import { DELIVERY_FEE_EUR, FREE_DELIVERY_EUR, MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";

/** Placeholder della striscia, stessa altezza minima del contenuto reale. */
export function DeliveryStripFallback() {
  return (
    <div aria-hidden="true" className="min-h-10 border-b border-line bg-brand-tint">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2 lg:px-8">
        <div className="h-4 w-56 rounded bg-brand/10" />
      </div>
    </div>
  );
}

/** Striscia sotto l'header: prossima fascia, minimo d'ordine e costo di consegna. */
export async function DeliveryStrip() {
  const slots = await getDeliverySlots();
  const nextSlot = slots.find((slot) => slot.remaining > 0);

  return (
    <div className="min-h-10 border-b border-line bg-brand-tint text-sm text-ink-soft">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 lg:px-8">
        <p className="min-w-0">
          <span className="font-semibold text-ink">
            {nextSlot ? `Prossima fascia: ${nextSlot.dayLabel}, ${nextSlot.start}–${nextSlot.end}` : "Nessuna fascia disponibile"}
          </span>
        </p>
        <p className="text-xs sm:text-sm">
          Minimo d&apos;ordine {formatEur(MIN_ORDER_EUR)} · Consegna {formatEur(DELIVERY_FEE_EUR)}, gratis da{" "}
          {formatEur(FREE_DELIVERY_EUR)}
        </p>
        <Link
          href="/checkout"
          className="font-semibold text-brand underline-offset-2 hover:underline sm:ml-auto"
        >
          Scegli fascia
        </Link>
      </div>
    </div>
  );
}
