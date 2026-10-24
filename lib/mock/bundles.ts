import type { Bundle } from "@/lib/types";

export const bundles: Bundle[] = [
  {
    id: "kit-colazione",
    name: "Kit colazione",
    description: "Tutto per la colazione di domani mattina",
    items: [
      { productId: "latte-intero-apa", quantity: 1, label: "Latte", note: "Fresco, alta qualità" },
      { productId: "cornetti-6pz", quantity: 1, label: "Cornetti", note: "Dal nostro forno" },
      { productId: "spremuta-arancia-1l", quantity: 1, label: "Spremuta", note: "Arance rosse di Sicilia" },
    ],
  },
];
