import Image from "next/image";
import { MobileSearch } from "@/components/home/mobile/mobile-search";
import { greeting } from "@/components/home/mobile/mobile-home-header";
import { getCustomer, getDeliverySlots } from "@/lib/data/customer";

export function DesktopHeroFallback() {
  return <div aria-hidden="true" className="h-72 rounded-2xl bg-line/30" />;
}

/** Apertura della home desktop, nello stesso stile dell'intestazione mobile */
export async function DesktopHero() {
  // getCustomer chiama connection(): da qui in poi l'ora corrente è letta a richiesta
  const [customer, slots] = await Promise.all([getCustomer(), getDeliverySlots()]);
  const nextSlot = slots.find((slot) => slot.remaining > 0);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-10 rounded-2xl bg-surface px-10 py-10 ring-1 ring-line lg:px-14">
      <div className="max-w-2xl space-y-5">
        <h1 className="font-display text-4xl leading-[1.05] font-bold text-ink lg:text-5xl xl:text-6xl">
          {greeting()}, {customer.firstName}
        </h1>
        <p className="font-display text-2xl font-semibold text-brand">La tua spesa fresca, a casa</p>
        <p className="text-base text-ink-soft">
          {nextSlot
            ? `Prima consegna disponibile: ${nextSlot.dayLabel.toLowerCase()}, ${nextSlot.start}–${nextSlot.end}.`
            : "Consegna a domicilio a Catania, nella fascia che preferisci."}
        </p>
        <div className="max-w-lg pt-1">
          <MobileSearch />
        </div>
      </div>

      <div aria-hidden="true" className="relative h-64 w-80 lg:w-96">
        <span className="absolute inset-4 rounded-full bg-brand-tint" />
        <Image
          src="/img/categorie/frutta-verdura.svg"
          alt=""
          width={180}
          height={140}
          unoptimized
          className="category-art absolute top-0 right-0 h-auto w-56 lg:w-64"
        />
        <Image
          src="/img/categorie/latte-uova-yogurt.svg"
          alt=""
          width={180}
          height={140}
          unoptimized
          className="category-art absolute bottom-0 left-0 h-auto w-44 lg:w-48"
        />
      </div>
    </div>
  );
}
