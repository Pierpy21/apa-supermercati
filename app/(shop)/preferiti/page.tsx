import type { Metadata } from "next";
import { FavoritesList } from "@/components/catalog/favorites-list";

export const metadata: Metadata = {
  title: "Preferiti",
  description: "I prodotti salvati tra i preferiti.",
};

export default function FavoritesPage() {
  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Preferiti</h1>
        <p className="mt-2 text-ink-soft">I prodotti che salvi restano disponibili qui e nel tuo carrello.</p>
      </header>

      <div className="mt-6">
        <FavoritesList />
      </div>
    </>
  );
}
