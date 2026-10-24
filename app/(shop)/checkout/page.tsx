import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCustomer, getDeliverySlots, getPaymentMethods } from "@/lib/data/customer";

export const metadata: Metadata = {
  title: "Conferma ordine",
};

/** Data di oggi (YYYY-MM-DD) nel fuso del negozio. Va chiamata dopo `connection()`. */
function todayInCatania(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function CheckoutContent() {
  const [customer, slots, paymentMethods] = await Promise.all([
    getCustomer(),
    getDeliverySlots(),
    getPaymentMethods(),
  ]);

  await connection();

  return (
    <CheckoutForm
      addresses={customer.addresses}
      defaultAddressId={customer.defaultAddressId}
      slots={slots}
      paymentMethods={paymentMethods}
      todayIso={todayInCatania()}
    />
  );
}

function CheckoutSkeleton() {
  return (
    <div role="status" className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <span className="sr-only">Caricamento del checkout</span>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="h-44 rounded-xl bg-line/60" />
        <div className="h-64 rounded-xl bg-line/60" />
        <div className="h-44 rounded-xl bg-line/60" />
      </div>
      <div aria-hidden="true" className="h-96 rounded-xl bg-line/60" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
