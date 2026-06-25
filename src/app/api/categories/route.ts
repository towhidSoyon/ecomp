import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json({
      success: true,
      categories: categories.map((c) => ({
        ...c,
        productCount: c._count.products,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }
    const category = await db.category.create({
      data: {
        name,
        slug: slugify(name) + "-" + Date.now().toString(36).slice(-4),
        description: description || null,
        icon: icon || null,
      },
    });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
