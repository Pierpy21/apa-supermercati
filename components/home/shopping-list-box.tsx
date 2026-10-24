"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { getReorderLines } from "@/app/actions/orders";
import { buildCartFromList } from "@/app/actions/shopping-list";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { PlusBadge } from "@/components/ui/plus-badge";

const PLACEHOLDER = "2 latte\nuova\nyogurt greco\narance";

/** Trasforma le righe non trovate in un testo leggibile per l'utente. */
function joinNotFound(items: string[]): string {
  return items.map((item) => `"${item}"`).join(", ");
}

/** Riquadro "Lista della spesa": incolla una lista, il carrello si prepara da solo. */
export function ShoppingListBox() {
  const { merge } = useCart();
  const { notify } = useToast();
  const [text, setText] = useState("");
  const [notFound, setNotFound] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const textareaId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || isPending) return;

    startTransition(async () => {
      const result = await buildCartFromList(text);
      if (!result.success) {
        notify(result.error);
        return;
      }

      const { lines, unmatched } = result.data;
      merge(lines);
      setNotFound(unmatched);
      // Le righe non trovate restano nel campo, così l'utente può correggerle
      setText(unmatched.join("\n"));

      const count = lines.length;
      if (count === 0) {
        notify("Nessun prodotto trovato nella lista");
      } else {
        notify(count === 1 ? "Aggiunto 1 prodotto" : `Aggiunti ${count} prodotti`);
      }
    });
  }

  return (
    <section
      aria-labelledby={`${textareaId}-title`}
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <h2 id={`${textareaId}-title`} className="flex items-center gap-2.5 font-display text-xl font-bold text-ink">
        Lista della spesa
        <PlusBadge />
      </h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <label htmlFor={textareaId} className="block text-sm text-ink-soft">
          Scrivi o incolla la tua lista, un prodotto per riga
        </label>
        <textarea
          id={textareaId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder={PLACEHOLDER}
          disabled={isPending}
          className="w-full resize-y rounded-lg border border-line-strong bg-tag-tint/50 px-3 py-2.5 text-sm leading-7 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none disabled:opacity-60"
        />
        {notFound.length > 0 ? (
          <p className="text-xs text-ink-soft">
            Non abbiamo trovato {joinNotFound(notFound)}. Prova a scriverli in altro modo.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {isPending ? "Preparo il carrello…" : "Prepara il carrello"}
        </button>
      </form>
    </section>
  );
}

export interface ReorderButtonProps {
  orderId: string;
}

/** Aggiunge al carrello tutte le righe di un ordine passato. */
export function ReorderButton({ orderId }: ReorderButtonProps) {
  const { merge, openDrawer } = useCart();
  const { notify } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await getReorderLines(orderId);
      if (!result.success) {
        notify(result.error);
        return;
      }
      if (result.data.length === 0) {
        notify("Nessun prodotto disponibile da riordinare");
        return;
      }
      merge(result.data);
      openDrawer();
      notify("Prodotti aggiunti al carrello");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
    >
      {isPending ? "Aggiungo…" : "Aggiungi tutto al carrello"}
    </button>
  );
}
