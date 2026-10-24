import Image from "next/image";
import Link from "next/link";
import { getCustomer, getDeliverySlots } from "@/lib/data/customer";
import { CartCircleButton } from "./cart-circle-button";

/** Saluto in base all'ora di Catania */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("it-IT", { hour: "numeric", hour12: false, timeZone: "Europe/Rome" }).format(new Date()),
  );
  if (hour < 13) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export function MobileHomeHeaderFallback() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-line/60" />
        <div className="h-9 w-40 rounded bg-line/40" />
      </div>
      <div className="h-36 rounded-2xl bg-line/30" />
    </div>
  );
}

/** Intestazione della home mobile: saluto, carrello e hero */
export async function MobileHomeHeader() {
  // getCustomer chiama connection(): da qui in poi l'ora corrente è letta a richiesta
  const [customer, slots] = await Promise.all([getCustomer(), getDeliverySlots()]);
  const nextSlot = slots.find((slot) => slot.remaining > 0);
  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          aria-label="Il tuo account"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-base font-bold text-brand ring-2 ring-surface"
        >
          {initials}
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm text-ink-soft">{greeting()}</p>
          <p className="truncate font-display text-lg font-semibold text-ink">
            {customer.firstName} {customer.lastName}
          </p>
        </div>
        <CartCircleButton />
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 space-y-2.5">
          <h1 className="font-display text-[28px] leading-[1.15] font-bold text-ink">La tua spesa fresca, a casa</h1>
          <p className="text-sm leading-relaxed text-ink-soft">
            {nextSlot
              ? `Prima consegna disponibile: ${nextSlot.dayLabel.toLowerCase()}, ${nextSlot.start}–${nextSlot.end}.`
              : "Consegna a domicilio a Catania, nella fascia che preferisci."}
          </p>
        </div>
        <div aria-hidden="true" className="relative h-32 w-36 shrink-0">
          <Image
            src="/img/categorie/frutta-verdura.svg"
            alt=""
            width={180}
            height={140}
            unoptimized
            className="category-art absolute top-0 right-0 h-auto w-32"
          />
          <Image
            src="/img/categorie/latte-uova-yogurt.svg"
            alt=""
            width={180}
            height={140}
            unoptimized
            className="category-art absolute bottom-0 left-0 h-auto w-24"
          />
        </div>
      </div>
    </div>
  );
}
