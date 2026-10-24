"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { checkCoverage } from "@/app/actions/account";
import type { Address, DeliveryZone } from "@/lib/types";

export interface AddressPopoverProps {
  /** Indirizzo di consegna predefinito del cliente */
  address: Address;
}

type CoverageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; cap: string; zone: DeliveryZone };

export function AddressPopover({ address }: AddressPopoverProps) {
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState("");
  const [coverage, setCoverage] = useState<CoverageState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = cap.trim();
    if (!/^\d{5}$/.test(value)) {
      setCoverage({ status: "error", message: "Inserisci un CAP di 5 cifre." });
      return;
    }
    startTransition(async () => {
      const result = await checkCoverage(value);
      if (!result.success) {
        setCoverage({ status: "error", message: result.error });
        return;
      }
      setCoverage({ status: "done", cap: value, zone: result.data });
    });
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 min-w-0 items-center gap-2 rounded-lg px-2 text-left hover:bg-paper"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-brand"
        >
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.25" />
        </svg>
        <span className="min-w-0">
          <span className="block text-xs leading-tight text-ink-muted">Consegna a</span>
          <span className="flex items-center gap-1.5 text-sm leading-tight font-semibold text-ink">
            <span className="hidden max-w-40 truncate md:block">{address.street}</span>
            <span>{address.cap}</span>
          </span>
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="fixed inset-x-4 top-44 z-40 rounded-xl border border-line bg-surface p-4 md:absolute md:top-full md:right-auto md:left-0 md:mt-2 md:w-80"
        >
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Indirizzo di consegna
          </h2>
          <div className="mt-2 rounded-lg bg-paper p-3 text-sm">
            <p className="font-medium text-ink">{address.street}</p>
            <p className="text-ink-soft">
              {address.cap} {address.city}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <label htmlFor={inputId} className="text-sm font-medium text-ink">
              Verifica il CAP
            </label>
            <div className="mt-1 flex gap-2">
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder="95100"
                value={cap}
                onChange={(event) => setCap(event.target.value.replace(/\D/g, ""))}
                className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending}
                className="h-10 shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
              >
                {isPending ? "Verifico…" : "Verifica"}
              </button>
            </div>

            <div role="status" aria-live="polite" className="mt-3 min-h-0 text-sm">
              {coverage.status === "error" ? (
                <p className="rounded-lg bg-warn-tint px-3 py-2 text-warn">{coverage.message}</p>
              ) : null}
              {coverage.status === "done" && coverage.zone.served ? (
                <p className="rounded-lg bg-brand-tint px-3 py-2 text-brand">
                  Consegniamo a {coverage.zone.name} (CAP {coverage.cap}). Puoi ordinare.
                </p>
              ) : null}
              {coverage.status === "done" && !coverage.zone.served ? (
                <p className="rounded-lg bg-warn-tint px-3 py-2 text-warn">
                  Non consegniamo ancora al CAP {coverage.cap}. Prova con un altro indirizzo.
                </p>
              ) : null}
            </div>
          </form>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Gestisci indirizzi
          </Link>
        </div>
      ) : null}
    </div>
  );
}
