const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export function formatEur(value: number): string {
  return eur.format(value);
}

const dateTime = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
