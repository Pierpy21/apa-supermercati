import { orderStatuses } from "@/lib/mock/orders";
import type { OrderStatus } from "@/lib/types";

export interface OrderTrackerProps {
  status: OrderStatus;
}

type StepState = "done" | "current" | "todo";

/** Tracker a 6 stati: orizzontale su desktop, verticale su mobile. Componente server. */
export function OrderTracker({ status }: OrderTrackerProps) {
  const currentIndex = orderStatuses.findIndex((step) => step.status === status);
  const lastIndex = orderStatuses.length - 1;
  const current = orderStatuses[currentIndex];

  return (
    <div className="flex flex-col gap-6">
      <ol aria-label="Passaggi dell'ordine" className="flex flex-col md:flex-row">
        {orderStatuses.map((step, index) => {
          const state: StepState = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
          const reached = index < currentIndex;

          return (
            <li
              key={step.status}
              aria-current={state === "current" ? "step" : undefined}
              className="relative flex gap-4 pb-6 last:pb-0 md:flex-1 md:flex-col md:items-center md:pb-0 md:text-center"
            >
              {index < lastIndex && (
                <span
                  aria-hidden="true"
                  className={`absolute top-6 bottom-0 left-[11px] w-0.5 md:top-[11px] md:bottom-auto md:left-[calc(50%_+_12px)] md:h-0.5 md:w-[calc(100%_-_24px)] ${
                    reached ? "bg-brand" : "bg-line"
                  }`}
                />
              )}
              <StepMarker state={state} />
              <div className="min-w-0 pt-0.5">
                <p className={state === "todo" ? "text-sm font-semibold text-ink-muted" : "text-sm font-semibold text-ink"}>
                  {step.label}
                  {state === "done" && <span className="sr-only"> (completato)</span>}
                </p>
                {state === "current" && <p className="text-xs font-medium text-brand">In corso</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {current && (
        <p className="rounded-lg bg-paper px-4 py-3 text-sm text-ink-soft">{current.description}</p>
      )}
    </div>
  );
}

function StepMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white"
      >
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }

  if (state === "current") {
    return (
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-surface ring-4 ring-brand-tint"
      />
    );
  }

  return <span aria-hidden="true" className="size-6 shrink-0 rounded-full border-2 border-line bg-surface" />;
}
