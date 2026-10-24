interface LogoProps {
  size?: "sm" | "md";
}

/** Marchio APA Fresh: "APA" + etichetta "Fresh" e sottotitolo "Supermercati" */
export function Logo({ size = "md" }: LogoProps) {
  const md = size === "md";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`font-display leading-none font-extrabold tracking-tight text-brand ${md ? "text-[28px]" : "text-2xl"}`}
      >
        APA
      </span>
      <span aria-hidden="true" className={`w-px bg-line-strong ${md ? "h-7" : "h-6"}`} />
      <span className="flex flex-col items-start gap-[3px] leading-none">
        <span
          className={`rounded-[3px] bg-brand px-1.5 py-[3px] font-display font-bold tracking-[0.16em] text-white uppercase ${
            md ? "text-[10px]" : "text-[9px]"
          }`}
        >
          Fresh
        </span>
        <span
          className={`font-semibold tracking-[0.14em] text-ink-soft uppercase ${md ? "text-[9px]" : "text-[8px]"}`}
        >
          Supermercati
        </span>
      </span>
    </span>
  );
}
