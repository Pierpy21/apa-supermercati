"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DELIVERY_FEE_EUR, MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";
import { useCart } from "./cart-provider";

// Pagine che mostrano già un riepilogo completo del carrello
const HIDDEN_ON = ["/carrello", "/checkout"];

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Bordo superiore ondulato, disegnato a tutta larghezza sopra la barra */
function Wave() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 28" preserveAspectRatio="none" className="block h-3.5 w-full fill-brand sm:h-[18px]">
      <path d="M0 18C120 10 240 6 400 9s300 13 460 13 300-14 440-15 140 4 140 4V28H0Z" />
    </svg>
  );
}

interface MilestoneProps {
  /** Posizione sul binario, in percentuale */
  at: number;
  reached: boolean;
  label: string;
  align: "center" | "end";
}

/** Traguardo sul binario: pallino che si spunta quando viene raggiunto */
function Milestone({ at, reached, label, align }: MilestoneProps) {
  return (
    <div
      className={`absolute top-1/2 flex -translate-y-1/2 flex-col ${align === "end" ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"}`}
      style={{ left: `${at}%` }}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
          reached ? "border-white bg-white text-brand" : "border-white/40 bg-brand text-transparent"
        }`}
      >
        <svg {...ICON_PROPS} strokeWidth={3} className="h-3 w-3">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
      <span className={`absolute top-6 hidden text-[11px] whitespace-nowrap sm:block ${reached ? "font-semibold text-white" : "text-white/60"}`}>
        {label}
      </span>
    </div>
  );
}

/** true quando la barra carrello è visibile: serve agli elementi fissi che devono stare sopra di lei */
export function useCartBarVisible(): boolean {
  const pathname = usePathname();
  const { totals, hydrated } = useCart();
  return hydrated && totals.itemCount > 0 && !HIDDEN_ON.includes(pathname);
}

export function CartBar() {
  const { totals, openDrawer } = useCart();
  const visible = useCartBarVisible();

  if (!visible) return null;

  // Unica soglia: il minimo d'ordine
  const progress = Math.min(100, (totals.subtotal / MIN_ORDER_EUR) * 100);

  const title: React.ReactNode = totals.canCheckout ? (
    <>
      <strong className="text-white">Minimo d&apos;ordine raggiunto</strong> · + {formatEur(DELIVERY_FEE_EUR)} di consegna
    </>
  ) : (
    <>
      Aggiungi <strong className="text-white">{formatEur(totals.missingToMinimum)}</strong> per ordinare
    </>
  );

  return (
    <>
      {/* Spazio riservato in fondo alla pagina, così la barra non copre il footer */}
      <div aria-hidden="true" className="h-[104px]" />
      <div className="fixed inset-x-0 bottom-0 z-30 drop-shadow-[0_-2px_8px_rgb(11_58_36/0.18)]">
        <Wave />
        <div className="bg-brand text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 pt-1 pb-3.5 sm:gap-8 lg:px-8">
            {/* Avanzamento verso il minimo d'ordine */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white sm:flex">
                <svg {...ICON_PROPS} className="h-5 w-5">
                  <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
                  <circle cx="7" cy="17.5" r="1.75" />
                  <circle cx="17" cy="17.5" r="1.75" />
                </svg>
              </span>
              <div className="min-w-0 flex-1 sm:pb-5">
                <p className="font-display text-sm leading-snug text-white/80 sm:truncate sm:text-base">{title}</p>
                <div
                  className="relative mt-3 mr-2 h-2 rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Avanzamento verso il minimo d'ordine"
                  aria-valuemin={0}
                  aria-valuemax={MIN_ORDER_EUR}
                  aria-valuenow={Math.min(totals.subtotal, MIN_ORDER_EUR)}
                  aria-valuetext={`${formatEur(totals.subtotal)} su ${formatEur(MIN_ORDER_EUR)}`}
                >
                  <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${progress}%` }} />
                  <Milestone at={100} reached={totals.canCheckout} label={`Minimo d'ordine ${formatEur(MIN_ORDER_EUR)}`} align="end" />
                </div>
              </div>
            </div>

            {/* Riepilogo e azioni */}
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={openDrawer}
                aria-label={`Apri il carrello: ${totals.itemCount} articoli, spesa ${formatEur(totals.subtotal)}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
              >
                <span className="relative">
                  <svg {...ICON_PROPS} className="h-6 w-6 text-white">
                    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="17" cy="20" r="1" />
                  </svg>
                  <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-promo px-1 text-[11px] font-bold text-white">
                    {totals.itemCount}
                  </span>
                </span>
                <span className="hidden leading-tight sm:block">
                  {/* La spesa senza consegna: è la cifra che conta per il minimo d'ordine */}
                  <span className="block text-xs text-white/70">Spesa</span>
                  <span className="block font-display text-[17px] font-bold text-white">{formatEur(totals.subtotal)}</span>
                </span>
              </button>

              {totals.canCheckout ? (
                <Link
                  href="/checkout"
                  className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint sm:px-5"
                >
                  Vai alla cassa
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openDrawer}
                  className="rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:px-5"
                >
                  Vedi carrello
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
