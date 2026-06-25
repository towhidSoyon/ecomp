"use client";

import * as React from "react";
import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    icon: PackageCheck,
  },
  shipped: {
    label: "Shipped",
    className:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    className:
      "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-red-200 bg-red-100 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
    icon: XCircle,
  },
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  },
  refunded: {
    label: "Refunded",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
  },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const cfg = ORDER_STATUS_STYLES[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn(cfg.className, className)}>
      <Icon className="size-3" />
      {cfg.label}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const cfg = PAYMENT_STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={cn(cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_STYLES[status].label;
}
