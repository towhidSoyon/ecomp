"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (!mounted) return;
        setOrder(json.order ?? null);
      } catch (e) {
        if (!mounted) return;
        setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      <h1 className="mt-4 text-2xl font-semibold">Order {order?.orderNumber ?? id}</h1>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && !order && <p className="text-sm text-muted-foreground">Order not found.</p>}
      {order && (
        <div className="mt-4 space-y-3">
          <div>Customer: {order.customerName} ({order.customerEmail})</div>
          <div>Status: {order.status}</div>
          <div className="mt-2">Items:</div>
          <ul className="list-disc pl-6">
            {order.items?.map((it: any) => (
              <li key={it.id}>{it.name} × {it.quantity} — ${it.price}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
