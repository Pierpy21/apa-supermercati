"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCartBarVisible } from "@/components/cart/cart-bar";
import { PlusBadge } from "@/components/ui/plus-badge";

// Anteprima estetica della funzione Plus "Ricette": le risposte sono di esempio
// e non modificano il carrello. Qui andrà collegato il servizio ricette.

interface Message {
  id: number;
  from: "user" | "assistant";
  text: string;
  ingredients?: string[];
}

const SUGGESTIONS: { name: string; ingredients: string[] }[] = [
  { name: "Pasta alla Norma", ingredients: ["Spaghetti", "Passata di pomodoro", "Melanzane", "Ricotta salata", "Basilico"] },
  { name: "Caponata", ingredients: ["Melanzane", "Sedano", "Cipolla", "Olive verdi", "Capperi", "Passata di pomodoro"] },
  { name: "Colazione siciliana", ingredients: ["Cornetti all'albicocca", "Spremuta di arance rosse", "Latte fresco"] },
];

const HIDDEN_ON = ["/checkout"];

function ChefIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 14.5V20h10v-5.5" />
      <path d="M7 14.5a4 4 0 0 1-.6-7.9A5 5 0 0 1 12 3a5 5 0 0 1 5.6 3.6 4 4 0 0 1-.6 7.9" />
      <path d="M7 17h10" />
    </svg>
  );
}

/** Pulsante fisso in basso a destra e pannello dell'assistente ricette (Plus) */
export function RecipeAssistant() {
  const pathname = usePathname();
  const cartBarVisible = useCartBarVisible();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "assistant",
      text: "Ciao! Dimmi cosa vuoi cucinare e preparo la lista degli ingredienti da aggiungere al carrello.",
    },
  ]);
  const nextId = useRef(1);
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (HIDDEN_ON.includes(pathname)) return null;

  function ask(text: string) {
    const recipe = text.trim();
    if (!recipe) return;
    const known = SUGGESTIONS.find((s) => s.name.toLowerCase() === recipe.toLowerCase());
    const userMessage: Message = { id: nextId.current++, from: "user", text: recipe };
    const reply: Message = known
      ? {
          id: nextId.current++,
          from: "assistant",
          text: `Per ${known.name} ti servono:`,
          ingredients: known.ingredients,
        }
      : {
          id: nextId.current++,
          from: "assistant",
          text: `Ottima scelta! Presto potrò preparare gli ingredienti per «${recipe}» direttamente dal catalogo APA.`,
        };
    setMessages((prev) => [...prev, userMessage, reply]);
    setDraft("");
  }

  // Sopra la barra carrello quando è visibile, altrimenti vicino al bordo
  const offset = cartBarVisible ? "bottom-[124px]" : "bottom-5";
  // Il pannello si apre sopra il pulsante (56px di altezza + 12px di spazio)
  const panelOffset = cartBarVisible ? "bottom-[192px]" : "bottom-[88px]";

  return (
    <>
      {open ? (
        <section
          role="dialog"
          aria-label="Assistente ricette"
          className={`fixed right-4 z-40 flex max-h-[min(70vh,560px)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-line ${panelOffset}`}
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-brand">
              <ChefIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                Ricette
                <PlusBadge />
              </p>
              <p className="text-xs text-ink-muted">Dalla ricetta al carrello</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4" aria-live="polite">
            {messages.map((message) =>
              message.from === "user" ? (
                <p key={message.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2 text-sm text-white">
                  {message.text}
                </p>
              ) : (
                <div key={message.id} className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 text-sm text-ink ring-1 ring-line">
                  <p>{message.text}</p>
                  {message.ingredients ? (
                    <>
                      <ul className="mt-2 space-y-1">
                        {message.ingredients.map((ingredient) => (
                          <li key={ingredient} className="flex items-center gap-2 text-ink-soft">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        disabled
                        className="mt-3 w-full cursor-not-allowed rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-ink-muted"
                      >
                        Aggiungi al carrello · presto disponibile
                      </button>
                    </>
                  ) : null}
                </div>
              ),
            )}
          </div>

          <div className="space-y-3 border-t border-line px-4 py-3">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.name}
                  type="button"
                  onClick={() => ask(suggestion.name)}
                  className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink hover:border-brand hover:text-brand"
                >
                  {suggestion.name}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor={inputId} className="sr-only">
                Cosa vuoi cucinare?
              </label>
              <input
                id={inputId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Cosa vuoi cucinare?"
                className="h-11 min-w-0 flex-1 rounded-full bg-paper px-4 text-sm text-ink ring-1 ring-line placeholder:text-ink-muted focus:ring-2 focus:ring-brand focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Invia"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-hover"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Chiudi l'assistente ricette" : "Apri l'assistente ricette"}
        className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-[bottom,background-color] hover:bg-brand-hover ${offset}`}
      >
        <ChefIcon className="h-7 w-7" />
      </button>
    </>
  );
}
