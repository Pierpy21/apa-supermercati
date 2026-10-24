export default function ShopLoading() {
  return (
    <div role="status" className="space-y-8">
      <span className="sr-only">Caricamento in corso</span>
      <div aria-hidden="true" className="space-y-3">
        <div className="h-8 w-64 max-w-full rounded-lg bg-line/60" />
        <div className="h-4 w-80 max-w-full rounded bg-line/40" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="min-h-[190px] rounded-xl bg-line/40" />
        ))}
      </div>
    </div>
  );
}
