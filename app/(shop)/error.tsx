"use client";

export default function ShopError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-start gap-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink">Qualcosa non ha funzionato</h1>
      <p className="text-ink-soft">
        Non siamo riusciti a caricare questa pagina. Riprova tra un momento.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
      >
        Riprova
      </button>
    </div>
  );
}
