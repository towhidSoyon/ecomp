import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DashboardStats, Order, OrderItem } from "@/lib/types";

function parseOrder(o: any): Order {
  return {
    ...o,
    shippingAddress: o.shippingAddress ? JSON.parse(o.shippingAddress) : {},
    items: (o.items || []).map((it: any): OrderItem => ({ ...it })),
  };
}

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const prevThirtyDaysAgo = new Date(now);
    prevThirtyDaysAgo.setDate(now.getDate() - 60);

    const [
      allOrders,
      allProducts,
      allCategories,
      recentOrdersRaw,
      ordersLast30,
      ordersPrev30,
    ] = await Promise.all([
      db.order.findMany({ include: { items: true } }),
      db.product.findMany(),
      db.category.findMany(),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: true },
      }),
      db.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.order.findMany({
        where: {
          createdAt: { gte: prevThirtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const deliveredOrPaid = allOrders.filter(
      (o) => o.status !== "cancelled"
    );

    const totalRevenue = deliveredOrPaid.reduce((sum, o) => sum + o.total, 0);
    const revenueLast30 = ordersLast30
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const revenuePrev30 = ordersPrev30
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const revenueChange =
      revenuePrev30 > 0
        ? Math.round(((revenueLast30 - revenuePrev30) / revenuePrev30) * 100)
        : revenueLast30 > 0
        ? 100
        : 0;

    const ordersChange =
      ordersPrev30.length > 0
        ? Math.round(
            ((ordersLast30.length - ordersPrev30.length) /
              ordersPrev30.length) *
              100
          )
        : ordersLast30.length > 0
        ? 100
        : 0;

    const uniqueCustomers = new Set(
      allOrders.map((o) => o.customerEmail)
    ).size;

    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    ).length;

    const lowStockProducts = allProducts.filter(
      (p) => p.stock <= 20
    ).length;

    // Top products by revenue
    const productRevenue = new Map<string, { name: string; sold: number; revenue: number }>();
    for (const order of deliveredOrPaid) {
      for (const item of order.items) {
        const existing = productRevenue.get(item.name) || {
          name: item.name,
          sold: 0,
          revenue: 0,
        };
        existing.sold += item.quantity;
        existing.revenue += item.price * item.quantity;
        productRevenue.set(item.name, existing);
      }
    }
    const topProducts = Array.from(productRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by day (last 14 days)
    const salesByDay: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayOrders = allOrders.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= day && created < nextDay && o.status !== "cancelled";
      });

      salesByDay.push({
        date: day.toISOString().slice(0, 10),
        revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
        orders: dayOrders.length,
      });
    }

    // Orders by status
    const statusCounts = new Map<string, number>();
    for (const o of allOrders) {
      statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
    }
    const ordersByStatus = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({ status, count })
    );

    const stats: DashboardStats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: allOrders.length,
      totalProducts: allProducts.length,
      totalCustomers: uniqueCustomers,
      pendingOrders,
      lowStockProducts,
      revenueChange,
      ordersChange,
      recentOrders: recentOrdersRaw.map(parseOrder),
      topProducts,
      salesByDay,
      ordersByStatus,
    };

    void allCategories;

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
