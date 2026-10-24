# APA Supermercati — architettura e contratti

App clienti per la spesa online di APA Supermercati (Catania). Next.js 16 App Router,
TypeScript strict, Tailwind v4, `cacheComponents: true`. Database non ancora presente:
tutti i dati vengono da `lib/mock/*` attraverso il data layer `lib/data/*` (server-only).

## Rotte (`app/(shop)/…`, tutte dentro lo stesso layout negozio)

| Rotta | Contenuto |
|---|---|
| `/` | Home: benvenuto + fascia di consegna, "Lista della spesa" (incolla lista → carrello), **blocchi reparto illustrati**, anteprima offerte, riordino rapido dall'ultimo ordine |
| `/reparti/[slug]` | Reparto: intestazione con illustrazione, filtro sottocategorie via `?sub=`, griglia prodotti |
| `/prodotti/[id]` | Scheda prodotto: immagine, prezzo, formato, prezzo al kg/L, quantità, preferiti, prodotti correlati |
| `/cerca?q=` | Risultati ricerca |
| `/offerte` | Offerte (oggi solo quelle personalizzate "Per te"; nuovi tipi si aggiungono in `DealType`) |
| `/preferiti` | Prodotti salvati (stato client) |
| `/carrello` | Carrello completo con riepilogo e soglie (minimo d'ordine, consegna gratuita) |
| `/checkout` | Indirizzo + copertura CAP, fascia di consegna, sostituzioni, pagamento, conferma |
| `/ordini` | Storico ordini con "Riordina" |
| `/ordini/[id]` | Dettaglio e tracking ordine (6 stati) |
| `/account` | Profilo, indirizzi, consensi privacy distinti (servizio sempre attivo, promo, personalizzazione) |

Route Handlers: `GET /api/products`, `GET /api/orders/[id]`.

## Stato

- **Carrello e preferiti**: client, `components/cart/cart-provider.tsx` (`useCart()`), persistiti in localStorage.
  Il layout passa al provider l'intero catalogo (`getAllProducts()`); i totali si calcolano con `lib/pricing.ts`.
- **Toast**: `components/ui/toast-provider.tsx` (`useToast().notify(msg)`).
- **Ordini, indirizzi, preferenze**: server, store in memoria (`lib/data/*`), mutati da Server Actions in `app/actions/*`.
  Il server ricalcola sempre i prezzi: il client invia solo `{ productId, quantity }`.

## Contratti data layer (server-only)

`lib/data/catalog.ts` — `getCategories()`, `getCategory(slug)`, `getProducts(filters)`, `getProduct(id)`, `getProductCount(category)`, `getAllProducts()`

`lib/data/customer.ts` — `getCustomer()`, `getDeliveryZones()`, `findZone(cap)`, `getDeliverySlots()`, `getPaymentMethods()`, `saveAddress(address)`, `savePreferences(prefs)`

`lib/data/orders.ts` — `getOrders()`, `getOrder(id)`, `createOrder(input)`, `advanceOrder(id)`

Le funzioni che leggono dati mutabili (ordini, cliente) chiamano `await connection()` da `next/server`:
i componenti che le usano vanno dentro `<Suspense>`.

## Server Actions (`app/actions/*`, tutte restituiscono `ActionResult<T>` da `lib/types.ts`)

- `orders.ts` — `placeOrder(input: PlaceOrderInput)` → `{ orderId }`; `advanceOrderStatus(orderId)` → `Order`; `getReorderLines(orderId)` → `CartLine[]`
- `account.ts` — `saveAddress(prev, formData)` (compatibile `useActionState`) → `Address`; `updatePreferences(input)` → `CustomerPreferences`; `checkCoverage(cap)` → `DeliveryZone`
- `shopping-list.ts` — `buildCartFromList(text)` → `{ lines: CartLine[]; matched: { query: string; productId: string }[]; unmatched: string[] }`

`PlaceOrderInput` (in `lib/validation/schemas.ts`): `{ lines: CartLine[]; slotId: string; addressId: string; substitution: SubstitutionPreference; paymentMethodId: string; notes?: string }`

## Componenti condivisi (API stabili)

- `components/product/product-card.tsx` — `<ProductCard product={Product} />`
- `components/product/product-grid.tsx` — `<ProductGrid products={Product[]} emptyMessage?={string} />`
- `components/product/quantity-control.tsx` — `<QuantityControl productId={string} size?="sm" | "md" />` (client; mostra "Aggiungi" se quantità 0)
- `components/product/favorite-button.tsx` — `<FavoriteButton productId={string} />` (client)
- `components/product/price-tag.tsx` — `<PriceTag product={Product} size?="sm" | "lg" />`
- `components/catalog/category-grid.tsx` — `<CategoryGrid categories={Category[]} counts={Record<string, number>} />`
- `components/cart/cart-summary.tsx` — `<CartSummary />` (client; totali, soglie, barra minimo d'ordine)
- `components/cart/cart-bar.tsx` — `<CartBar />` (client; barra fissa in basso con bordo ondulato, avanzamento verso la consegna gratuita di € 35 con tacca del minimo d'ordine; nascosta a carrello vuoto e su /carrello e /checkout)

## Linee guida grafiche

Obiettivo: sembrare il sito di una vera catena di supermercati siciliana, **non** una demo generata.

- Palette (token in `app/globals.css`, usarli come classi Tailwind): `bg-paper` (sfondo carta calda), `bg-surface`,
  `border-line`, `text-ink` / `text-ink-soft` / `text-ink-muted`, `bg-brand` / `hover:bg-brand-hover` / `bg-brand-tint` / `bg-brand-deep`,
  `text-promo` / `bg-promo-tint` (cartellino offerta), `bg-tag` / `bg-tag-tint` (etichetta prezzo gialla), `text-warn` / `bg-warn-tint`.
- Font: `font-display` (Bricolage Grotesque) per titoli e prezzi, `font-sans` (Figtree) per il resto.
- **Vietato**: gradienti, emoji nell'interfaccia, glow/blur decorativi, badge "AI", testi tipo "simulazione/demo",
  `rounded-3xl`, ombre pesanti, `animate-pulse` decorativo, titoli in Title Case inglese.
- Sì: bordi sottili `border-line`, `rounded-lg`/`rounded-xl`, ombre minime (`shadow-sm` solo su hover/overlay),
  icone SVG lineari inline (stroke 1.75, 20px, `currentColor`) — niente librerie di icone.
- Prezzi come cartellini da scaffale: prezzo grande in `font-display font-bold`; in offerta, etichetta gialla `bg-tag` con
  percentuale in `text-promo` e prezzo pieno barrato.
- Copy in italiano naturale, frasi brevi, sentence case ("Aggiungi al carrello", "Fascia di consegna").
- I **blocchi reparto illustrati** (immagini in `public/img/categorie/*.svg`) sono l'elemento distintivo da valorizzare:
  card a tinta piatta (`style={{ backgroundColor: category.tint }}`), titolo grande, illustrazione in basso a destra
  con classe `category-art` e `group-hover:scale-105 group-hover:-rotate-1`.
- Mobile first: header compatto con ricerca su riga propria sotto i 768px, gutter 16px, nessuno scroll orizzontale di pagina.
- Accessibilità: `<button>` e `<Link>` veri, `aria-label` sui pulsanti icona, contrasto AA.

## Immagini prodotto

- `public/img/prodotti/foto-<id>.webp` (600×600, fondo bianco) è la foto principale; `foto-<id>-<n>.webp` sono le
  foto aggiuntive (`Product.gallery`: valori nutrizionali, ingredienti, retro) mostrate nella galleria della scheda.
- Provenienza, **solo per la demo**: packshot da un catalogo online della GDO e una foto fornita dal cliente (latte Parmalat);
  Zymil, burro Brazzale e salmone da Open Food Facts (CC BY-SA 3.0, crediti nel footer). Prima di andare online vanno
  sostituite con foto di cui APA ha i diritti (fornitori o shooting interno).
