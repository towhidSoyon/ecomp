"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
  orderStatusLabel,
} from "@/components/admin/status-badge";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";

type FilterStatus = "all" | OrderStatus;

const TABS: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function OrdersManager() {
  const queryClient = useQueryClient();

  const [tab, setTab] = React.useState<FilterStatus>("all");
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch ALL orders (for counts + filter tabs). Single query, client filters.
  const { data, isLoading, isError, refetch } = useQuery<{ orders: Order[] }>({
    queryKey: ["orders", "admin", "all"],
    queryFn: async () => {
      const res = await fetch("/api/orders?status=all");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json;
    },
  });

  const allOrders = data?.orders ?? [];

  const counts = React.useMemo(() => {
    const map: Record<FilterStatus, number> = {
      all: allOrders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of allOrders) {
      map[o.status] = (map[o.status] ?? 0) + 1;
    }
    return map;
  }, [allOrders]);

  const filtered = React.useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [allOrders, tab, debounced]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update");
      }
      return json;
    },
    onSuccess: (_data, vars) => {
      toast.success(`Order marked as ${orderStatusLabel(vars.status)}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openDetail = (o: Order) => {
    setSelected(o);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterStatus)}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-transparent p-0 sm:w-auto sm:bg-muted">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className={cn(
                "gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "border border-transparent data-[state=active]:border-input"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  t.id === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {formatNumber(counts[t.id] ?? 0)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, customer, email..."
          className="pl-9"
          aria-label="Search orders"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-40" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-32" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Failed to load orders.{" "}
                  <button
                    className="text-emerald-600 underline-offset-2 hover:underline"
                    onClick={() => refetch()}
                  >
                    Try again
                  </button>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openDetail(o)}
                      className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      {o.orderNumber}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{o.customerName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {o.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {o.items.length}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(o.total)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={o.status}
                        onValueChange={(v) =>
                          statusMutation.mutate({
                            id: o.id,
                            status: v as OrderStatus,
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-32"
                          aria-label={`Change status for ${o.orderNumber}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {orderStatusLabel(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(o)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && filtered.length > 0 && (
          <div className="border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {formatNumber(filtered.length)} of{" "}
              {formatNumber(allOrders.length)} orders
            </p>
          </div>
        )}
      </div>

      <OrderDetailDialog
        order={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {statusMutation.isPending && (
        <div
          className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-md"
          role="status"
        >
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          Updating...
        </div>
      )}
    </div>
  );
}
