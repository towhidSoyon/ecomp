import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

function parseOrder(o: any): Order {
  return {
    ...o,
    shippingAddress: o.shippingAddress ? JSON.parse(o.shippingAddress) : {},
    items: (o.items || []).map((it: any): OrderItem => ({ ...it })),
  };
}

// GET /api/orders - list with optional status filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
      ...(limit > 0 ? { take: limit } : {}),
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(parseOrder),
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - create a new order (checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      notes,
    } = body;

    if (
      !customerName ||
      !customerEmail ||
      !shippingAddress ||
      !items ||
      !items.length
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch product prices to validate
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems = items.map((i: any) => {
      const product = i.productId ? productMap.get(i.productId) : null;
      return {
        productId: i.productId || null,
        name: i.name,
        price: product ? product.price : i.price,
        quantity: i.quantity,
        image: i.image || null,
      };
    });

    const subtotal = orderItems.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: JSON.stringify(shippingAddress),
        status: "pending",
        paymentStatus: "paid",
        paymentMethod: paymentMethod || "card",
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const it of orderItems) {
      if (it.productId) {
        await db.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }
    }

    return NextResponse.json({ success: true, order: parseOrder(order) });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
