import { connection, NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/data/catalog";
import { productsQuerySchema, zodFieldErrors } from "@/lib/validation/schemas";

/** Valore del parametro, oppure undefined se assente o vuoto. */
function optionalParam(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key);
  return value && value.length > 0 ? value : undefined;
}

// GET /api/products?q=&category=&sub=&deal=
export async function GET(request: NextRequest) {
  // Leggere request.nextUrl è un dato di richiesta: esclude la route dal prerender.
  // Fuori dal try, così il segnale interno di Next non viene intercettato dal catch.
  await connection();
  try {
    const { searchParams } = request.nextUrl;
    const parsed = productsQuerySchema.safeParse({
      q: optionalParam(searchParams, "q"),
      category: optionalParam(searchParams, "category"),
      sub: optionalParam(searchParams, "sub"),
      deal: optionalParam(searchParams, "deal"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parametri di ricerca non validi.",
          fieldErrors: zodFieldErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const { q, category, sub, deal } = parsed.data;
    const products = await getProducts({
      query: q,
      category,
      subcategory: sub,
      deal,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false, error: "Impossibile leggere il catalogo. Riprova tra poco." },
      { status: 500 },
    );
  }
}
