import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { Product } from "@/lib/types";

function parseProduct(p: any): Product {
  return {
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    comparePrice: p.comparePrice ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, product: parseProduct(product) });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      images,
      categoryId,
      featured,
      active,
      brand,
      sku,
    } = body;

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name) + "-" + id.slice(-4);
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (comparePrice !== undefined)
      updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock, 10) || 0;
    if (images !== undefined) updateData.images = JSON.stringify(images || []);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (featured !== undefined) updateData.featured = !!featured;
    if (active !== undefined) updateData.active = !!active;
    if (brand !== undefined) updateData.brand = brand || null;
    if (sku !== undefined) updateData.sku = sku || null;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: parseProduct(product) });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
