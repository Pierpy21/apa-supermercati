import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdvanceStatusButton } from "@/components/orders/advance-status-button";
import { OrderTracker } from "@/components/orders/order-tracker";
import { getPaymentMethods } from "@/lib/data/customer";
import { getOrder } from "@/lib/data/orders";
import { formatDateTime, formatEur } from "@/lib/format";
import type { SubstitutionPreference } from "@/lib/types";

const SUBSTITUTION_COPY: Record<SubstitutionPreference, string> = {
  ask: "Se un prodotto non è disponibile, ti contattiamo per scegliere un'alternativa. Nessun articolo viene sostituito senza il tuo consenso.",
  equivalent: "Se un prodotto non è disponibile, lo sostituiamo con un articolo equivalente per qualità e prezzo.",
  refund: "Se un prodotto non è disponibile, non lo sostituiamo: l'articolo viene rimborsato.",
};

interface OrderDetailProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function OrderDetail({ params, searchParams }: OrderDetailProps) {
  const { id } = await params;
  const { nuovo } = await searchParams;
  const [order, paymentMethods] = await Promise.all([getOrder(id), getPaymentMethods()]);

  if (!order) notFound();

  const paymentLabel = paymentMethods.find((method) => method.id === order.paymentMethodId)?.label ?? "Pagamento";
  const isNew = nuovo === "1";

  return (
    <>
      {isNew && (
        <div role="status" className="mb-6 rounded-xl bg-brand-tint p-5 text-brand-deep">
          <p className="font-display text-lg font-semibold">Ordine ricevuto, grazie!</p>
          <p className="mt-1 text-sm">Ti aggiorniamo ad ogni passaggio fino alla consegna.</p>
        </div>
      )}

      <header className="mb-8">
        <p className="text-sm text-ink-muted">{formatDateTime(order.createdAt)}</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Ordine {order.id}</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="tracking-title" className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <h2 id="tracking-title" className="mb-5 text-lg font-semibold">
              Stato dell’ordine
            </h2>
            <OrderTracker status={order.status} />
          </section>

          <section aria-labelledby="substitution-title" className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <h2 id="substitution-title" className="text-lg font-semibold">
              Sostituzioni
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{SUBSTITUTION_COPY[order.substitution]}</p>
          </section>

          <section aria-labelledby="items-title" className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <h2 id="items-title" className="text-lg font-semibold">
              Articoli ({order.totals.itemCount})
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {order.lines.map((line) => (
                <li key={line.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{line.name}</span>
                    <span className="block text-ink-soft">
                      {line.quantity} × {formatEur(line.unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">{formatEur(line.quantity * line.unitPrice)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5">
            <h2 id="summary-title" className="font-display text-lg font-semibold">
              Riepilogo
            </h2>

            <div className="flex flex-col gap-1 text-sm">
              <p className="text-ink-muted">Indirizzo</p>
              <address className="not-italic">
                <p className="font-medium">{order.address.recipient}</p>
                <p className="text-ink-soft">
                  {order.address.street}, {order.address.cap} {order.address.city}
                </p>
                {order.address.notes && <p className="text-ink-soft">{order.address.notes}</p>}
              </address>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <p className="text-ink-muted">Fascia di consegna</p>
              <p className="font-medium">
                {order.slot.dayLabel}, {order.slot.start}–{order.slot.end}
              </p>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <p className="text-ink-muted">Pagamento</p>
              <p className="font-medium">{paymentLabel}</p>
            </div>

            <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Subtotale</dt>
                <dd className="font-medium">{formatEur(order.totals.subtotal)}</dd>
              </div>
              {order.totals.savings > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Risparmio offerte</dt>
                  <dd className="font-medium text-promo">−{formatEur(order.totals.savings)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Consegna</dt>
                <dd className="font-medium">
                  {order.totals.deliveryFee === 0 ? "Gratis" : formatEur(order.totals.deliveryFee)}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3">
                <dt className="font-display text-base font-bold">Totale</dt>
                <dd className="font-display text-xl font-bold">{formatEur(order.totals.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <section
        aria-labelledby="store-area-title"
        className="mt-10 rounded-lg border border-dashed border-line-strong p-4 sm:p-5"
      >
        <h2 id="store-area-title" className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Area negozio
        </h2>
        <div className="mt-3">
          <AdvanceStatusButton orderId={order.id} status={order.status} />
        </div>
      </section>
    </>
  );
}

function OrderSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Caricamento dell’ordine</span>
      <div aria-hidden="true" className="h-10 w-48 rounded-lg bg-line/60" />
      <div aria-hidden="true" className="h-56 rounded-xl bg-line/60" />
      <div aria-hidden="true" className="h-40 rounded-xl bg-line/60" />
    </div>
  );
}

export default function OrderPage(props: PageProps<"/ordini/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
