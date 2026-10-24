"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ricerca a pillola della home mobile, con pulsante tondo di invio */
export function MobileSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/cerca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={submit} className="flex items-center gap-3">
      <label className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-full bg-surface px-5 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">Cerca prodotti</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca prodotti…"
          className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </label>
      <button
        type="submit"
        aria-label="Cerca"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5.5 w-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
      </button>
    </form>
  );
}
