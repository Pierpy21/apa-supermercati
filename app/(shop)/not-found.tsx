import Link from "next/link";

export default function ShopNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-16">
      <p className="text-sm font-semibold text-brand">Errore 404</p>
      <h1 className="font-display text-3xl font-bold text-ink">Pagina non trovata</h1>
      <p className="text-ink-soft">La pagina che cerchi non esiste o è stata spostata.</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
      >
        Torna alla spesa
      </Link>
    </div>
  );
}
