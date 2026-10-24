"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { placeOrder } from "@/app/actions/orders";
import { useCart } from "@/components/cart/cart-provider";
import { CartSummary } from "@/components/cart/cart-summary";
import { useToast } from "@/components/ui/toast-provider";
import { MIN_ORDER_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/format";
import type { Address, DeliverySlot, PaymentMethod, SubstitutionPreference } from "@/lib/types";

export interface CheckoutFormProps {
  addresses: Address[];
  defaultAddressId: string;
  slots: DeliverySlot[];
  paymentMethods: PaymentMethod[];
  /** Data di oggi (YYYY-MM-DD) nel fuso del negozio, calcolata sul server */
  todayIso: string;
}

interface SlotGroup {
  key: string;
  label: string;
  slots: DeliverySlot[];
}

interface SubstitutionOption {
  value: SubstitutionPreference;
  title: string;
  description: string;
}

const SUBSTITUTION_OPTIONS: SubstitutionOption[] = [
  {
    value: "ask",
    title: "Contattami per scegliere un'alternativa",
    description: "Ti scriviamo prima di sostituire un articolo non disponibile.",
  },
  {
    value: "equivalent",
    title: "Sostituisci con un prodotto equivalente",
    description: "Scegliamo per te un articolo simile per qualità e prezzo.",
  },
  {
    value: "refund",
    title: "Non sostituire, rimborsa l'articolo",
    description: "L'articolo non disponibile non viene addebitato.",
  },
];

const SECTION_CLASS = "flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6";
// float-left toglie la legend dal bordo del fieldset e la rende un normale elemento del flex
const LEGEND_CLASS = "float-left flex w-full items-center gap-3 font-display text-lg font-semibold";

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Raggruppa le fasce per giorno, mantenendo l'ordine ricevuto dal server. */
function groupSlotsByDay(slots: DeliverySlot[], todayIso: string): SlotGroup[] {
  const tomorrowIso = addDays(todayIso, 1);
  const groups = new Map<string, SlotGroup>();

  for (const slot of slots) {
    let group = groups.get(slot.date);
    if (!group) {
      const label = slot.date === todayIso ? "Oggi" : slot.date === tomorrowIso ? "Domani" : slot.dayLabel;
      group = { key: slot.date, label, slots: [] };
      groups.set(slot.date, group);
    }
    group.slots.push(slot);
  }

  return [...groups.values()];
}

function defaultSlotId(slots: DeliverySlot[]): string {
  const available = slots.filter((slot) => slot.remaining > 0);
  return (available.find((slot) => slot.recommended) ?? available[0])?.id ?? "";
}

export function CheckoutForm({ addresses, defaultAddressId, slots, paymentMethods, todayIso }: CheckoutFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const { lines, productsById, totals, hydrated, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  const [addressId, setAddressId] = useState(
    () => addresses.find((a) => a.id === defaultAddressId)?.id ?? addresses[0]?.id ?? "",
  );
  const [slotId, setSlotId] = useState(() => defaultSlotId(slots));
  const [substitution, setSubstitution] = useState<SubstitutionPreference>("ask");
  const [paymentMethodId, setPaymentMethodId] = useState(() => paymentMethods[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const notesId = useId();

  if (hydrated && lines.length === 0 && !placed) {
    return <EmptyCheckout />;
  }

  const groups = groupSlotsByDay(slots, todayIso);
  const canSubmit =
    hydrated &&
    totals.canCheckout &&
    lines.length > 0 &&
    addressId !== "" &&
    slotId !== "" &&
    paymentMethodId !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isPending) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await placeOrder({
          lines,
          slotId,
          addressId,
          substitution,
          paymentMethodId,
          notes: notes.trim() || undefined,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        setPlaced(true);
        clear();
        notify("Ordine inviato");
        router.push(`/ordini/${result.data.orderId}?nuovo=1`);
      } catch {
        setError("Non siamo riusciti a inviare l'ordine. Riprova tra poco.");
      }
    });
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold md:text-3xl">Conferma ordine</h1>

      <form
        onSubmit={handleSubmit}
        aria-busy={isPending}
        className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="flex min-w-0 flex-col gap-6">
          <fieldset className={SECTION_CLASS}>
            <legend className={LEGEND_CLASS}>
              <StepNumber n={1} />
              Indirizzo di consegna
            </legend>
            {addresses.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <RadioCard
                    key={address.id}
                    name="address"
                    value={address.id}
                    checked={addressId === address.id}
                    onSelect={setAddressId}
                  >
                    <span className="font-semibold">{address.label}</span>
                    <span className="text-sm text-ink-soft">{address.recipient}</span>
                    <span className="text-sm text-ink-soft">
                      {address.street}, {address.cap} {address.city}
                    </span>
                  </RadioCard>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Non hai ancora un indirizzo di consegna.</p>
            )}
            <Link
              href="/account"
              className="w-fit rounded-sm text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Aggiungi o modifica
            </Link>
          </fieldset>

          <fieldset className={SECTION_CLASS}>
            <legend className={LEGEND_CLASS}>
              <StepNumber n={2} />
              Fascia di consegna
            </legend>
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-ink-soft">{group.label}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {group.slots.map((slot) => {
                      const soldOut = slot.remaining <= 0;
                      const lowAvailability = !soldOut && slot.remaining <= 2;
                      return (
                        <RadioCard
                          key={slot.id}
                          name="slot"
                          value={slot.id}
                          checked={slotId === slot.id}
                          disabled={soldOut}
                          onSelect={setSlotId}
                        >
                          <span
                            className={
                              soldOut
                                ? "font-display text-base font-semibold text-ink-muted line-through"
                                : "font-display text-base font-semibold"
                            }
                          >
                            {slot.start} – {slot.end}
                          </span>
                          <span
                            className={lowAvailability ? "text-xs font-medium text-warn" : "text-xs text-ink-soft"}
                          >
                            {soldOut
                              ? "Esaurita"
                              : lowAvailability
                                ? slot.remaining === 1
                                  ? "Ultimo posto"
                                  : `Ultimi ${slot.remaining} posti`
                                : "Posti disponibili"}
                          </span>
                          {slot.recommended && !soldOut && (
                            <span className="mt-1 w-fit rounded-md border border-brand px-1.5 py-0.5 text-xs font-medium text-brand">
                              Consigliata
                            </span>
                          )}
                        </RadioCard>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-soft">Non ci sono fasce disponibili in questo momento.</p>
            )}
          </fieldset>

          <fieldset className={SECTION_CLASS}>
            <legend className={LEGEND_CLASS}>
              <StepNumber n={3} />
              Se un prodotto non è disponibile
            </legend>
            <div className="grid gap-3">
              {SUBSTITUTION_OPTIONS.map((option) => (
                <RadioCard
                  key={option.value}
                  name="substitution"
                  value={option.value}
                  checked={substitution === option.value}
                  onSelect={setSubstitution}
                >
                  <span className="font-semibold">{option.title}</span>
                  <span className="text-sm text-ink-soft">{option.description}</span>
                </RadioCard>
              ))}
            </div>
          </fieldset>

          <fieldset className={SECTION_CLASS}>
            <legend className={LEGEND_CLASS}>
              <StepNumber n={4} />
              Metodo di pagamento
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <RadioCard
                  key={method.id}
                  name="payment"
                  value={method.id}
                  checked={paymentMethodId === method.id}
                  onSelect={setPaymentMethodId}
                >
                  <span className="font-semibold">{method.label}</span>
                  <span className="text-sm text-ink-soft">{method.detail}</span>
                </RadioCard>
              ))}
            </div>
          </fieldset>

          <div className={SECTION_CLASS}>
            <div className="flex items-center gap-3">
              <StepNumber n={5} />
              <label htmlFor={notesId} className="font-display text-lg font-semibold">
                Note per il rider
              </label>
            </div>
            <textarea
              id={notesId}
              name="notes"
              rows={3}
              maxLength={300}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              aria-describedby={`${notesId}-hint`}
              className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm placeholder:text-ink-muted focus-visible:border-brand"
              placeholder="Citofono, piano o indicazioni per l'ingresso"
            />
            <p id={`${notesId}-hint`} className="text-sm text-ink-muted">
              Facoltativo.
            </p>
          </div>
        </div>

        <aside aria-label="Riepilogo ordine" className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5">
            {error && (
              <div role="alert" className="rounded-lg bg-warn-tint px-4 py-3 text-sm font-medium text-warn">
                {error}
              </div>
            )}

            <h2 className="font-display text-lg font-semibold">Riepilogo</h2>

            {lines.length > 0 && (
              <details className="group rounded-lg border border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span>Articoli ({totals.itemCount})</span>
                  <svg
                    viewBox="0 0 24 24"
                    width={18}
                    height={18}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <ul className="divide-y divide-line border-t border-line">
                  {lines.map((line) => {
                    const product = productsById.get(line.productId);
                    if (!product) return null;
                    return (
                      <li key={line.productId} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                        <span className="min-w-0 truncate">
                          {line.quantity} × {product.name}
                        </span>
                        <span className="shrink-0 font-medium">{formatEur(product.price * line.quantity)}</span>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}

            <CartSummary />

            {hydrated && lines.length > 0 && !totals.canCheckout && (
              <p className="text-sm text-ink-soft">
                Il minimo d’ordine è di {formatEur(MIN_ORDER_EUR)}. Aggiungi ancora{" "}
                {formatEur(totals.missingToMinimum)} per confermare.
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-brand font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-muted"
            >
              {isPending ? "Invio in corso…" : `Conferma ordine · ${formatEur(totals.total)}`}
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}

interface StepNumberProps {
  n: number;
}

function StepNumber({ n }: StepNumberProps) {
  return (
    <span
      aria-hidden="true"
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand text-sm font-semibold text-brand"
    >
      {n}
    </span>
  );
}

interface RadioCardProps<T extends string> {
  name: string;
  value: T;
  checked: boolean;
  disabled?: boolean;
  onSelect: (value: T) => void;
  children: ReactNode;
}

function RadioCard<T extends string>({ name, value, checked, disabled = false, onSelect, children }: RadioCardProps<T>) {
  const generatedId = useId();
  const id = `${generatedId}-${value}`;

  return (
    <div className="min-w-0">
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="flex h-full cursor-pointer flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong peer-checked:border-brand peer-checked:bg-brand-tint peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:cursor-not-allowed peer-disabled:opacity-60 peer-disabled:hover:border-line"
      >
        {children}
      </label>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <section
      aria-labelledby="empty-checkout-title"
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-line bg-surface px-6 py-12 text-center"
    >
      <h1 id="empty-checkout-title" className="font-display text-xl font-bold">
        Il carrello è vuoto
      </h1>
      <p className="text-ink-soft">Aggiungi dei prodotti prima di confermare l’ordine.</p>
      <Link
        href="/"
        className="flex h-11 items-center justify-center rounded-lg bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Torna alla spesa
      </Link>
    </section>
  );
}
