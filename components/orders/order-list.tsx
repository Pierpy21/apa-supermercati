import Link from "next/link";
import { ReorderButton } from "@/components/orders/reorder-button";
import { formatDateTime, formatEur } from "@/lib/format";
import { orderStatuses } from "@/lib/mock/orders";
import type { Order, OrderStatus } from "@/lib/types";

export interface OrderListProps {
  orders: Order[];
}

const PREVIEW_COUNT = 3;

/** Lista storico degli ordini: componente server, interattivo solo il pulsante "Riordina". */
export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <section
        aria-labelledby="no-orders-title"
        className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface px-6 py-12 text-center"
      >
        <h2 id="no-orders-title" className="font-display text-lg font-semibold">
          Non hai ancora ordini
        </h2>
        <p className="text-ink-soft">Quando confermi una spesa, la trovi qui.</p>
        <Link
          href="/"
          className="mt-2 flex h-11 items-center justify-center rounded-lg bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Vai alla spesa
        </Link>
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}

function statusLabel(status: OrderStatus): string {
  return orderStatuses.find((s) => s.status === status)?.label ?? status;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const delivered = status === "consegnato";
  return (
    <span
      className={
        delivered
          ? "inline-flex shrink-0 items-center rounded-md bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand-deep"
          : "inline-flex shrink-0 items-center rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink-soft"
      }
    >
      {statusLabel(status)}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const headingId = `order-${order.id}-title`;
  const hidden = order.lines.length - PREVIEW_COUNT;
  const preview = order.lines.slice(0, PREVIEW_COUNT).map((line) => line.name).join(", ");

  return (
    <article aria-labelledby={headingId} className="rounded-xl border border-line bg-surface p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-lg font-semibold">
            Ordine {order.id}
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-ink-muted">Fascia di consegna</dt>
          <dd className="font-medium">
            {order.slot.dayLabel}, {order.slot.start}–{order.slot.end}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Articoli</dt>
          <dd className="font-medium">{order.totals.itemCount}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Totale</dt>
          <dd className="font-display text-base font-bold">{formatEur(order.totals.total)}</dd>
        </div>
      </dl>

      <p className="mt-4 line-clamp-2 text-sm text-ink-soft">
        {preview}
        {hidden > 0 ? ` e altri ${hidden}` : ""}
      </p>

      <footer className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Link
          href={`/ordini/${order.id}`}
          className="flex h-10 items-center justify-center rounded-lg border border-line-strong px-4 text-sm font-semibold text-ink transition-colors hover:bg-brand-tint"
        >
          Dettagli
          <span className="sr-only"> dell’ordine {order.id}</span>
        </Link>
        <ReorderButton orderId={order.id} />
      </footer>
    </article>
  );
}
