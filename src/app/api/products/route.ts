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

// GET /api/products - list with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // slug
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest"; // newest, price-asc, price-desc, rating
    const limit = searchParams.get("limit");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const where: any = {};
    if (activeOnly) where.active = true;
    if (featured === "true") where.featured = true;
    if (category && category !== "all") {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };

    const products = await db.product.findMany({
      where,
      orderBy,
      include: { category: true },
      ...(limit ? { take: parseInt(limit, 10) } : {}),
    });

    return NextResponse.json({
      success: true,
      products: products.map(parseProduct),
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - create
export async function POST(request: Request) {
  try {
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

    if (!name || !description || price == null || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        slug: slugify(name) + "-" + Date.now().toString(36).slice(-4),
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock, 10) || 0,
        images: JSON.stringify(images || []),
        categoryId,
        featured: !!featured,
        active: active !== false,
        brand: brand || null,
        sku: sku || null,
        rating: 0,
        reviewCount: 0,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: parseProduct(product) });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
