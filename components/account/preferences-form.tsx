"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { updatePreferences } from "@/app/actions/account";
import { useToast } from "@/components/ui/toast-provider";
import type { CustomerPreferences } from "@/lib/types";

export interface PreferencesFormProps {
  preferences: CustomerPreferences;
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const { notify } = useToast();
  const [isPending, startTransition] = useTransition();
  const [weeklyPromotions, setWeeklyPromotions] = useState(preferences.weeklyPromotions);
  const [personalizedOffers, setPersonalizedOffers] = useState(preferences.personalizedOffers);
  const baseId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await updatePreferences({ weeklyPromotions, personalizedOffers });
        notify(result.success ? "Preferenze salvate" : result.error);
      } catch {
        notify("Non siamo riusciti a salvare le preferenze. Riprova.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <fieldset className="divide-y divide-line">
        <legend className="sr-only">Consensi e notifiche</legend>

        <SwitchRow
          id={`${baseId}-service`}
          title="Aggiornamenti sul tuo ordine"
          description="Conferme, cambi di fascia oraria e stato della consegna."
          note="Sempre attivi: servono per seguire il tuo ordine e non si possono disattivare."
          checked
          disabled
        />

        <SwitchRow
          id={`${baseId}-promotions`}
          title="Offerte del volantino settimanale"
          description="Ricevi ogni settimana le offerte del volantino APA."
          checked={weeklyPromotions}
          onChange={setWeeklyPromotions}
        />

        <SwitchRow
          id={`${baseId}-personalized`}
          title="Suggerimenti in base ai tuoi acquisti"
          description="Proposte di prodotti e offerte basate sullo storico della tua spesa. Puoi disattivarle quando vuoi."
          checked={personalizedOffers}
          onChange={setPersonalizedOffers}
        />
      </fieldset>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 items-center justify-center rounded-lg border border-line-strong px-5 font-semibold text-ink transition-colors hover:bg-brand-tint disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Salvataggio…" : "Salva preferenze"}
        </button>
      </div>
    </form>
  );
}

interface SwitchRowProps {
  id: string;
  title: string;
  description: string;
  note?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function SwitchRow({ id, title, description, note, checked, disabled = false, onChange }: SwitchRowProps) {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p id={titleId} className="font-medium text-ink">
          {title}
        </p>
        <p id={descriptionId} className="mt-1 text-sm text-ink-soft">
          {description}
        </p>
        {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70 ${
          checked ? "bg-brand" : "bg-line-strong"
        }`}
      >
        <span
          aria-hidden="true"
          className={`block size-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
