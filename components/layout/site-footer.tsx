import Link from "next/link";
import { STORE_NAME } from "@/lib/constants";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Spesa online",
    links: [
      { label: "Come funziona", href: "#" },
      { label: "Zone servite", href: "#" },
      { label: "Fasce di consegna", href: "/checkout" },
    ],
  },
  {
    title: "Assistenza",
    links: [
      { label: "Contatti", href: "#" },
      { label: "Resi e rimborsi", href: "#" },
    ],
  },
  {
    title: "APA Supermercati",
    links: [
      { label: "Punti vendita", href: "#" },
      { label: "Lavora con noi", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 lg:px-8">
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-brand hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-muted lg:px-8">
          {STORE_NAME} S.r.l. · Sede a Catania · P.IVA 01234567890
        </p>
      </div>
    </footer>
  );
}
