import "server-only";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import {
  customer as seedCustomer,
  deliveryZones,
  paymentMethods,
} from "@/lib/mock/customer";
import type {
  Address,
  Customer,
  CustomerPreferences,
  DeliverySlot,
  DeliveryZone,
  PaymentMethod,
} from "@/lib/types";

// Data layer del cliente. Oggi usa uno store in memoria inizializzato dai mock;
// quando arriverà il database basterà sostituire il corpo di queste funzioni
// mantenendo le firme.

/** Indirizzo in ingresso: senza id è un nuovo indirizzo. */
export type AddressInput = Omit<Address, "id"> & { id?: string };

interface CustomerStore {
  customer: Customer;
}

// Su globalThis per sopravvivere all'HMR in sviluppo.
const globalForCustomer = globalThis as typeof globalThis & {
  __apaCustomerStore?: CustomerStore;
};

function getStore(): CustomerStore {
  if (!globalForCustomer.__apaCustomerStore) {
    globalForCustomer.__apaCustomerStore = { customer: structuredClone(seedCustomer) };
  }
  return globalForCustomer.__apaCustomerStore;
}

// Il negozio opera sull'orario di Catania, indipendentemente dal fuso del server.
const STORE_TIME_ZONE = "Europe/Rome";

const SLOT_WINDOWS: readonly { start: string; end: string }[] = [
  { start: "09:00", end: "10:30" },
  { start: "12:00", end: "13:30" },
  { start: "16:00", end: "17:30" },
  { start: "18:00", end: "19:30" },
  { start: "20:00", end: "21:00" },
];

const romeClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: STORE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const longDate = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function romeNow(now: Date): { date: string; minutes: number } {
  const parts = romeClock.formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    minutes: Number(read("hour")) * 60 + Number(read("minute")),
  };
}

function addDays(isoDate: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T12:00:00Z`));
}

/** Disponibilità deterministica della fascia (alcune risultano esaurite). */
function slotRemaining(slotId: string): number {
  let hash = 7;
  for (let i = 0; i < slotId.length; i++) {
    hash = (hash * 31 + slotId.charCodeAt(i)) % 997;
  }
  return hash % 5 === 0 ? 0 : (hash % 12) + 1;
}

export async function getCustomer(): Promise<Customer> {
  await connection();
  return structuredClone(getStore().customer);
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  return deliveryZones.map((zone) => ({ ...zone }));
}

export async function findZone(cap: string): Promise<DeliveryZone | null> {
  const normalized = cap.trim();
  const zone = deliveryZones.find((item) => item.cap === normalized);
  return zone ? { ...zone } : null;
}

/**
 * Fasce di consegna di oggi e domani. Quelle di oggi già iniziate vengono escluse.
 * Una sola fascia è `recommended`: la prima con posti disponibili.
 */
export async function getDeliverySlots(): Promise<DeliverySlot[]> {
  await connection();
  const now = romeNow(new Date());
  const today = now.date;
  const tomorrow = addDays(today, 1);

  const slots: DeliverySlot[] = [];
  for (const date of [today, tomorrow]) {
    const isToday = date === today;
    for (const window of SLOT_WINDOWS) {
      if (isToday && toMinutes(window.start) <= now.minutes) continue;
      const id = `${date}-${window.start.slice(0, 2)}`;
      slots.push({
        id,
        date,
        dayLabel: `${isToday ? "Oggi" : "Domani"}, ${formatLongDate(date)}`,
        start: window.start,
        end: window.end,
        remaining: slotRemaining(id),
        recommended: false,
      });
    }
  }

  const firstAvailable = slots.find((slot) => slot.remaining > 0);
  return slots.map((slot) => ({
    ...slot,
    recommended: slot.id === firstAvailable?.id,
  }));
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return paymentMethods.map((method) => ({ ...method }));
}

/** Aggiorna l'indirizzo con lo stesso id, oppure lo aggiunge e lo rende predefinito. */
export async function saveAddress(input: AddressInput): Promise<Address> {
  const store = getStore();
  const address: Address = {
    id: input.id ?? `addr_${randomUUID().slice(0, 8)}`,
    label: input.label,
    recipient: input.recipient,
    street: input.street,
    cap: input.cap,
    city: input.city,
    ...(input.notes ? { notes: input.notes } : {}),
  };

  const addresses = store.customer.addresses;
  const index = addresses.findIndex((item) => item.id === address.id);
  if (index >= 0) {
    addresses[index] = address;
  } else {
    addresses.push(address);
    store.customer.defaultAddressId = address.id;
  }

  return { ...address };
}

export async function savePreferences(
  prefs: Pick<CustomerPreferences, "weeklyPromotions" | "personalizedOffers">,
): Promise<CustomerPreferences> {
  const store = getStore();
  store.customer.preferences = {
    serviceUpdates: true,
    weeklyPromotions: prefs.weeklyPromotions,
    personalizedOffers: prefs.personalizedOffers,
  };
  return { ...store.customer.preferences };
}
