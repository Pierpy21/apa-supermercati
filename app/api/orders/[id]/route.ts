import { NextResponse, type NextRequest } from "next/server";
import { getOrder } from "@/lib/data/orders";
import { orderIdSchema } from "@/lib/validation/schemas";

// GET /api/orders/[id]
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  try {
    // TODO auth: l'ordine deve appartenere al cliente in sessione.
    const { id } = await ctx.params;
    const parsed = orderIdSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Numero ordine non valido." },
        { status: 400 },
      );
    }

    const order = await getOrder(parsed.data);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Ordine ${parsed.data} non trovato.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Impossibile leggere l'ordine. Riprova tra poco." },
      { status: 500 },
    );
  }
}
