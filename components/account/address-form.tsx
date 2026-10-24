"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId } from "react";
import { saveAddress } from "@/app/actions/account";
import type { Address } from "@/lib/types";

export interface AddressFormProps {
  /** Se presente il form modifica l'indirizzo, altrimenti ne crea uno nuovo */
  address?: Address;
}

type FieldName = "label" | "recipient" | "street" | "cap" | "city" | "notes";

export function AddressForm({ address }: AddressFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveAddress, null);
  const formId = useId();
  const errors = state && !state.success ? state.fieldErrors : undefined;

  // Dopo il salvataggio ricarica i dati del server (lista indirizzi aggiornata).
  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  const fieldId = (name: FieldName) => `${formId}-${name}`;
  const errorFor = (name: FieldName) => errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-4 pt-4">
      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={fieldId("label")}
          name="label"
          label="Nome dell'indirizzo"
          defaultValue={address?.label ?? ""}
          placeholder="Casa, Ufficio…"
          error={errorFor("label")}
          required
        />
        <TextField
          id={fieldId("recipient")}
          name="recipient"
          label="Destinatario"
          defaultValue={address?.recipient ?? ""}
          autoComplete="name"
          error={errorFor("recipient")}
          required
        />
        <TextField
          id={fieldId("street")}
          name="street"
          label="Via e numero civico"
          defaultValue={address?.street ?? ""}
          autoComplete="street-address"
          error={errorFor("street")}
          className="sm:col-span-2"
          required
        />
        <TextField
          id={fieldId("cap")}
          name="cap"
          label="CAP"
          defaultValue={address?.cap ?? ""}
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
          error={errorFor("cap")}
          required
        />
        <TextField
          id={fieldId("city")}
          name="city"
          label="Città"
          defaultValue={address?.city ?? "Catania"}
          autoComplete="address-level2"
          error={errorFor("city")}
          required
        />
        <TextField
          id={fieldId("notes")}
          name="notes"
          label="Note per il citofono"
          defaultValue={address?.notes ?? ""}
          hint="Facoltativo. Nome sul citofono, piano, scala."
          error={errorFor("notes")}
          className="sm:col-span-2"
        />
      </div>

      {state && !state.success && !errors && (
        <p role="alert" className="rounded-lg bg-warn-tint px-4 py-3 text-sm font-medium text-warn">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {state?.success && (
          <p role="status" className="mr-auto text-sm font-medium text-brand">
            Indirizzo salvato.
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 items-center justify-center rounded-lg bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Salvataggio…" : address ? "Salva modifiche" : "Aggiungi indirizzo"}
        </button>
      </div>
    </form>
  );
}

interface TextFieldProps {
  id: string;
  name: FieldName;
  label: string;
  defaultValue: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  required?: boolean;
  className?: string;
}

function TextField({
  id,
  name,
  label,
  defaultValue,
  error,
  hint,
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  required = false,
  className,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-ink-muted">(obbligatorio)</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 rounded-lg border bg-surface px-3 text-sm placeholder:text-ink-muted ${
          error ? "border-promo" : "border-line-strong"
        }`}
      />
      {hint && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-promo">
          {error}
        </p>
      )}
    </div>
  );
}
