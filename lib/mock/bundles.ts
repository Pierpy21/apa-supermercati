import type { Bundle } from "@/lib/types";

export const bundles: Bundle[] = [
  {
    id: "kit-colazione",
    name: "Kit colazione",
    description: "Tutto per la colazione di domani mattina",
    items: [
      { productId: "latte-intero-apa", quantity: 1, label: "Latte", note: "Con vitamina D" },
      { productId: "cornetti-6pz", quantity: 1, label: "Croissant", note: "All'albicocca, 10 pezzi" },
      { productId: "spremuta-arancia-1l", quantity: 1, label: "Succo d'arancia", note: "Brick da 1 litro" },
    ],
  },
];
