"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/cerca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Cerca prodotti
      </label>
      <input
        id={inputId}
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca tra migliaia di prodotti"
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-line-strong bg-surface pr-4 pl-11 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Avvia la ricerca"
        className="absolute top-1/2 left-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft hover:text-brand"
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
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
