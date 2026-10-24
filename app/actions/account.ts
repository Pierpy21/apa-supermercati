"use server";

import { revalidatePath } from "next/cache";
import {
  findZone,
  savePreferences,
  saveAddress as saveAddressRecord,
} from "@/lib/data/customer";
import type { ActionResult, Address, CustomerPreferences, DeliveryZone } from "@/lib/types";
import {
  addressSchema,
  capSchema,
  preferencesSchema,
  zodFieldErrors,
} from "@/lib/validation/schemas";

const GENERIC_ERROR = "Operazione non riuscita. Riprova tra poco.";

function notServedMessage(cap: string): string {
  return `Non consegniamo ancora al CAP ${cap}.`;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Crea o aggiorna un indirizzo. Compatibile con useActionState. */
export async function saveAddress(
  _prev: ActionResult<Address> | null,
  formData: FormData,
): Promise<ActionResult<Address>> {
  try {
    // TODO auth: l'indirizzo deve appartenere al cliente in sessione.
    const parsed = addressSchema.safeParse({
      id: readField(formData, "id") || undefined,
      label: readField(formData, "label"),
      recipient: readField(formData, "recipient"),
      street: readField(formData, "street"),
      cap: readField(formData, "cap"),
      city: readField(formData, "city"),
      notes: readField(formData, "notes") || undefined,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: "Controlla i campi evidenziati.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const zone = await findZone(parsed.data.cap);
    if (!zone || !zone.served) {
      return {
        success: false,
        error: notServedMessage(parsed.data.cap),
        fieldErrors: { cap: [notServedMessage(parsed.data.cap)] },
      };
    }

    const address = await saveAddressRecord(parsed.data);
    revalidatePath("/", "layout");
    return { success: true, data: address };
  } catch (error) {
    console.error("[saveAddress]", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/** Aggiorna i consensi privacy/marketing. Il servizio ordini resta sempre attivo. */
export async function updatePreferences(input: {
  weeklyPromotions: boolean;
  personalizedOffers: boolean;
}): Promise<ActionResult<CustomerPreferences>> {
  try {
    // TODO auth: preferenze del cliente in sessione.
    const parsed = preferencesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Preferenze non valide.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const preferences = await savePreferences(parsed.data);
    revalidatePath("/", "layout");
    return { success: true, data: preferences };
  } catch (error) {
    console.error("[updatePreferences]", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

/** Verifica se il CAP è nella zona di consegna. */
export async function checkCoverage(cap: string): Promise<ActionResult<DeliveryZone>> {
  try {
    const parsed = capSchema.safeParse(cap);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Il CAP non è valido." };
    }

    const zone = await findZone(parsed.data);
    if (!zone || !zone.served) {
      return { success: false, error: notServedMessage(parsed.data) };
    }
    return { success: true, data: zone };
  } catch (error) {
    console.error("[checkCoverage]", error);
    return { success: false, error: GENERIC_ERROR };
  }
}
