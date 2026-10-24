import type { Metadata } from "next";
import { Suspense } from "react";
import { AddressForm } from "@/components/account/address-form";
import { PreferencesForm } from "@/components/account/preferences-form";
import { getCustomer } from "@/lib/data/customer";
import type { Address } from "@/lib/types";

export const metadata: Metadata = {
  title: "Il tuo account",
};

async function AccountContent() {
  const customer = await getCustomer();

  return (
    <div className="flex flex-col gap-6">
      <Section titleId="profile-title" title="Profilo">
        <dl className="grid gap-4 sm:grid-cols-3">
          <ReadOnlyField label="Nome e cognome" value={`${customer.firstName} ${customer.lastName}`} />
          <ReadOnlyField label="Email" value={customer.email} />
          <ReadOnlyField label="Telefono" value={customer.phone} />
        </dl>
        <p className="text-sm text-ink-muted">I dati del profilo sono di sola lettura.</p>
      </Section>

      <Section titleId="addresses-title" title="Indirizzi salvati">
        <ul className="flex flex-col gap-3">
          {customer.addresses.map((address) => (
            <AddressItem key={address.id} address={address} isDefault={address.id === customer.defaultAddressId} />
          ))}
        </ul>

        <details className="group rounded-lg border border-dashed border-line-strong px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-lg leading-none group-open:hidden">
              +
            </span>
            <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">
              −
            </span>
            Aggiungi indirizzo
          </summary>
          <AddressForm />
        </details>
      </Section>

      <Section titleId="payments-title" title="Metodi di pagamento">
        <ul className="divide-y divide-line">
          {customer.paymentMethods.map((method) => (
            <li key={method.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
              <span className="font-medium">{method.label}</span>
              <span className="text-sm text-ink-soft">{method.detail}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-muted">I metodi di pagamento si scelgono al momento dell’ordine.</p>
      </Section>

      <Section titleId="privacy-title" title="Privacy e notifiche">
        <p className="text-sm text-ink-soft">
          Scegli quali messaggi ricevere. Gli aggiornamenti sull’ordine sono sempre attivi.
        </p>
        <PreferencesForm preferences={customer.preferences} />
      </Section>
    </div>
  );
}

interface SectionProps {
  titleId: string;
  title: string;
  children: React.ReactNode;
}

function Section({ titleId, title, children }: SectionProps) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 id={titleId} className="font-display text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

interface AddressItemProps {
  address: Address;
  isDefault: boolean;
}

function AddressItem({ address, isDefault }: AddressItemProps) {
  return (
    <li className="rounded-lg border border-line p-4">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {address.label}
          {isDefault && <span className="text-xs font-medium text-brand">Predefinito</span>}
        </p>
        <p className="text-sm text-ink-soft">
          {address.recipient} · {address.street}, {address.cap} {address.city}
        </p>
        {address.notes && <p className="text-sm text-ink-muted">{address.notes}</p>}
      </div>

      <details className="group mt-3">
        <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint [&::-webkit-details-marker]:hidden">
          Modifica
          <span className="sr-only"> indirizzo {address.label}</span>
        </summary>
        <AddressForm address={address} />
      </details>
    </li>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="font-display text-2xl font-bold md:text-3xl">Il tuo account</h1>
      <div className="mt-6">
        <Suspense fallback={<AccountSkeleton />}>
          <AccountContent />
        </Suspense>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Caricamento del profilo</span>
      <div aria-hidden="true" className="h-48 rounded-xl bg-line/60" />
      <div aria-hidden="true" className="h-64 rounded-xl bg-line/60" />
      <div aria-hidden="true" className="h-56 rounded-xl bg-line/60" />
    </div>
  );
}
