import type { Customer, DeliveryZone, PaymentMethod } from "@/lib/types";

export const paymentMethods: PaymentMethod[] = [
  { id: "card-4821", type: "card", label: "Visa •••• 4821", detail: "Pagamento online al momento dell'ordine" },
  { id: "wallet", type: "wallet", label: "Apple Pay / Google Pay", detail: "Pagamento online dal telefono" },
  { id: "pos", type: "pos", label: "POS alla consegna", detail: "Paghi con carta al rider" },
];

export const deliveryZones: DeliveryZone[] = [
  { cap: "95121", name: "Catania Sud", served: true },
  { cap: "95124", name: "Catania Centro storico", served: true },
  { cap: "95128", name: "Catania Nord / Corso Italia", served: true },
  { cap: "95129", name: "Catania Borgo", served: true },
  { cap: "95131", name: "Catania Centro", served: true },
  { cap: "95030", name: "Area esterna (Gravina, Mascalucia)", served: false },
];

export const customer: Customer = {
  id: "cus_giusy",
  firstName: "Giusy",
  lastName: "Apa",
  email: "giusy.apa@example.com",
  phone: "+39 333 000 0000",
  defaultAddressId: "addr_casa",
  addresses: [
    {
      id: "addr_casa",
      label: "Casa",
      recipient: "Giusy Apa",
      street: "Via Etnea 140",
      cap: "95131",
      city: "Catania",
      notes: "Citofono Apa, 2° piano",
    },
  ],
  paymentMethods,
  preferences: {
    serviceUpdates: true,
    weeklyPromotions: true,
    personalizedOffers: true,
  },
  favoriteProductIds: ["latte-intero-apa", "uova-bio-6pz", "uova-contadino-10pz"],
};
