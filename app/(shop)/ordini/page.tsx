import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderList } from "@/components/orders/order-list";
import { getOrders } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "I tuoi ordini",
};

async function OrdersContent() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}

function OrdersSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Caricamento degli ordini</span>
      <div aria-hidden="true" className="h-44 rounded-xl bg-line/60" />
      <div aria-hidden="true" className="h-44 rounded-xl bg-line/60" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="font-display text-2xl font-bold md:text-3xl">I tuoi ordini</h1>
      <div className="mt-6">
        <Suspense fallback={<OrdersSkeleton />}>
          <OrdersContent />
        </Suspense>
      </div>
    </div>
  );
}
