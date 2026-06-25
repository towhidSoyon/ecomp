"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, Phone, User } from "lucide-react";

import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
  orderStatusLabel,
} from "@/components/admin/status-badge";

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailDialog({
  order,
  open,
  onClose,
}: OrderDetailDialogProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<OrderStatus>("pending");

  React.useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  const mutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const res = await fetch(`/api/orders/${order!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update order");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!order) return null;

  const addr = order.shippingAddress ?? {
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Placed {formatDateTime(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Customer</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="truncate">{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Shipping Address</h4>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <address className="not-italic leading-relaxed text-muted-foreground">
                {addr.address}
                <br />
                {addr.city}
                {addr.city && addr.state ? ", " : ""}
                {addr.state} {addr.zip}
                <br />
                {addr.country}
              </address>
            </div>
          </div>
        </div>

        {/* Status control */}
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Payment:</span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as OrderStatus)}
            >
              <SelectTrigger className="w-44" aria-label="Update status">
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
              disabled={mutation.isPending || status === order.status}
              onClick={() => mutation.mutate(status)}
            >
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Update
            </Button>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="size-10 rounded-md border object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="text-sm font-medium">{it.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(it.price)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(it.price * it.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>
              {order.shipping === 0
                ? "Free"
                : formatCurrency(order.shipping)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <p className="pt-1 text-xs text-muted-foreground">
            Payment method:{" "}
            <span className="capitalize">{order.paymentMethod}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
