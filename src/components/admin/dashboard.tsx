"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardStats, Order } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/status-badge";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#64748b",
  shipped: "#71717a",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function ChangeBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        positive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
      )}
    >
      <Icon className="size-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  helper?: string;
  accent?: "emerald" | "amber" | "red" | "slate";
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  slate:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
};

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  helper,
  accent = "slate",
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              ACCENT_STYLES[accent]
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight">
              {value}
            </span>
            {helper && (
              <span className="mt-1 text-xs text-muted-foreground">
                {helper}
              </span>
            )}
          </div>
          {change !== undefined && <ChangeBadge value={change} />}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill }}
          />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function RecentOrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No recent orders.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{o.customerName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {o.customerEmail}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right text-sm font-medium">
              {formatCurrency(o.total)}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={o.status} />
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={o.paymentStatus} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery<{
    stats: DashboardStats;
  }>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json;
    },
  });

  const stats = data?.stats;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Failed to load dashboard data.{" "}
        <button
          className="text-emerald-600 underline-offset-2 hover:underline"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  const salesData = stats.salesByDay.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const statusData = stats.ordersByStatus.map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  const topProductsData = stats.topProducts.map((p) => ({
    name:
      p.name.length > 22 ? p.name.slice(0, 20) + "…" : p.name,
    fullName: p.name,
    revenue: Math.round(p.revenue),
    sold: p.sold,
  }));

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          change={stats.revenueChange}
          helper="vs last 30 days"
          accent="emerald"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          icon={ShoppingCart}
          change={stats.ordersChange}
          helper="vs last 30 days"
          accent="slate"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          helper="in catalog"
          accent="slate"
        />
        <StatCard
          title="Customers"
          value={formatNumber(stats.totalCustomers)}
          icon={Users}
          helper="unique buyers"
          accent="slate"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <ShoppingCart className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Pending Orders</p>
              <p className="text-2xl font-semibold">
                {formatNumber(stats.pendingOrders)}
              </p>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-300">
              Needs attention
            </span>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <TriangleAlert className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Low Stock Products</p>
              <p className="text-2xl font-semibold">
                {formatNumber(stats.lowStockProducts)}
              </p>
            </div>
            <span className="text-xs text-red-700 dark:text-red-300">
              ≤ 20 units
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue (Last 14 Days)</CardTitle>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRight className="size-3" />
                Daily totals
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={salesData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  minTickGap={20}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  width={60}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by status donut */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip />}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top products + recent orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No sales recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topProductsData}
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickFormatter={(v) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    content={
                      <ChartTooltip
                        formatter={(v: number) => formatCurrency(v)}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <span className="text-xs text-muted-foreground">
                Last {stats.recentOrders.length} orders
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={stats.recentOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
