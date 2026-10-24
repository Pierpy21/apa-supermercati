"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images: ProductImage[];
  dimmed?: boolean;
}

/** Foto del prodotto con miniature (fronte, valori nutrizionali, …) */
export function ProductGallery({ images, dimmed = false }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-8">
        <Image
          key={current.src}
          src={current.src}
          alt={current.label}
          width={600}
          height={600}
          unoptimized
          priority={active === 0}
          className={`h-auto w-full max-w-sm object-contain ${dimmed ? "opacity-40" : ""}`}
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3" aria-label="Foto del prodotto">
          {images.map((image, index) => {
            const selected = index === active;
            return (
              <li key={image.src}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={selected}
                  aria-label={`Mostra: ${image.label}`}
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5 transition-colors ${
                    selected ? "border-brand ring-1 ring-brand" : "border-line hover:border-line-strong"
                  }`}
                >
                  <Image src={image.src} alt="" width={120} height={120} unoptimized className="size-full object-contain" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
