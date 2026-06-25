import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, generateOrderNumber } from "@/lib/format";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Cutting-edge gadgets, audio gear, and smart devices.",
    icon: "Cpu",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Apparel, footwear, and accessories for every season.",
    icon: "Shirt",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor, and essentials for a beautiful home.",
    icon: "Home",
  },
];

const products = [
  {
    name: "Aurora Wireless Headphones",
    description:
      "Immersive sound with active noise cancellation, 40-hour battery life, and plush memory-foam ear cushions. Bluetooth 5.3 with multipoint pairing.",
    price: 199.99,
    comparePrice: 249.99,
    stock: 45,
    images: [
      "https://sfile.chatglm.cn/images-ppt/1ec5958347df.png",
      "https://sfile.chatglm.cn/images-ppt/a535745458c6.jpg",
    ],
    categorySlug: "electronics",
    featured: true,
    rating: 4.8,
    reviewCount: 327,
    sku: "AUR-WH-001",
    brand: "Aurora",
  },
  {
    name: "Pulse Smartwatch Series 7",
    description:
      "Track your fitness, heart rate, and sleep with a vibrant always-on AMOLED display. Water-resistant up to 50m with 7-day battery life.",
    price: 299.99,
    comparePrice: null,
    stock: 30,
    images: [
      "https://sfile.chatglm.cn/images-ppt/5a628666dbbc.jpg",
      "https://sfile.chatglm.cn/images-ppt/2de9fc3c0038.png",
    ],
    categorySlug: "electronics",
    featured: true,
    rating: 4.7,
    reviewCount: 214,
    sku: "PLS-SW-007",
    brand: "Pulse",
  },
  {
    name: "Sonic Bluetooth Speaker",
    description:
      "Portable 360° sound with deep bass and IPX7 waterproof rating. 20 hours of playtime on a single charge.",
    price: 79.99,
    comparePrice: 99.99,
    stock: 60,
    images: [
      "https://sfile.chatglm.cn/images-ppt/7fbb5c9e2f5c.jpg",
      "https://sfile.chatglm.cn/images-ppt/0fe3172b27de.jpg",
    ],
    categorySlug: "electronics",
    featured: false,
    rating: 4.5,
    reviewCount: 189,
    sku: "SNC-BS-012",
    brand: "Sonic",
  },
  {
    name: "Vista Mirrorless Camera",
    description:
      "24.2MP APS-C sensor with 4K video recording. Compact body with interchangeable lenses and built-in stabilization.",
    price: 899.99,
    comparePrice: null,
    stock: 12,
    images: [
      "https://sfile.chatglm.cn/images-ppt/8e828e7376d7.jpg",
      "https://sfile.chatglm.cn/images-ppt/d2c87ea6ff8b.jpg",
    ],
    categorySlug: "electronics",
    featured: true,
    rating: 4.9,
    reviewCount: 98,
    sku: "VST-MC-024",
    brand: "Vista",
  },
  {
    name: "Cloud Runner Sneakers",
    description:
      "Ultra-lightweight running shoes with responsive cushioning and breathable knit upper. Designed for everyday comfort.",
    price: 129.99,
    comparePrice: null,
    stock: 80,
    images: [
      "https://sfile.chatglm.cn/images-ppt/867d93c44151.jpg",
      "https://sfile.chatglm.cn/images-ppt/b9d0ea73ef35.jpg",
    ],
    categorySlug: "fashion",
    featured: true,
    rating: 4.6,
    reviewCount: 412,
    sku: "CLD-RN-031",
    brand: "Cloud",
  },
  {
    name: "Nomad Leather Backpack",
    description:
      "Full-grain leather backpack with padded laptop compartment and water-resistant lining. Ages beautifully over time.",
    price: 159.99,
    comparePrice: 189.99,
    stock: 25,
    images: [
      "https://sfile.chatglm.cn/images-ppt/29826f0b5dcf.jpg",
      "https://sfile.chatglm.cn/images-ppt/1870112084d0.png",
    ],
    categorySlug: "fashion",
    featured: true,
    rating: 4.8,
    reviewCount: 156,
    sku: "NMD-LB-045",
    brand: "Nomad",
  },
  {
    name: "Aviator Polarized Sunglasses",
    description:
      "Classic aviator frames with UV400 polarized lenses and lightweight titanium construction. Includes premium case.",
    price: 89.99,
    comparePrice: null,
    stock: 50,
    images: [
      "https://sfile.chatglm.cn/images-ppt/0f5861793cb6.jpg",
      "https://sfile.chatglm.cn/images-ppt/bb81038a34fb.jpg",
    ],
    categorySlug: "fashion",
    featured: false,
    rating: 4.4,
    reviewCount: 234,
    sku: "AVT-SG-058",
    brand: "Aviator",
  },
  {
    name: "Heritage Denim Jacket",
    description:
      "Timeless denim jacket made from organic cotton with a relaxed fit. Pre-washed for a soft, broken-in feel.",
    price: 119.99,
    comparePrice: null,
    stock: 40,
    images: [
      "https://sfile.chatglm.cn/images-ppt/74c37072ab0b.jpg",
      "https://sfile.chatglm.cn/images-ppt/9e0928aa6dab.jpg",
    ],
    categorySlug: "fashion",
    featured: false,
    rating: 4.5,
    reviewCount: 178,
    sku: "HRT-DJ-067",
    brand: "Heritage",
  },
  {
    name: "Lumen LED Desk Lamp",
    description:
      "Adjustable brightness and color temperature with touch controls and USB charging port. Energy-efficient LED with 50,000-hour lifespan.",
    price: 59.99,
    comparePrice: 79.99,
    stock: 70,
    images: [
      "https://sfile.chatglm.cn/images-ppt/d827d8a28f02.jpg",
      "https://sfile.chatglm.cn/images-ppt/0912e20bd8bc.jpg",
    ],
    categorySlug: "home-living",
    featured: true,
    rating: 4.7,
    reviewCount: 301,
    sku: "LMN-DL-072",
    brand: "Lumen",
  },
  {
    name: "Artisan Ceramic Mug Set",
    description:
      "Set of 4 handcrafted ceramic mugs with a matte glaze finish. Microwave and dishwasher safe. 350ml capacity each.",
    price: 34.99,
    comparePrice: null,
    stock: 120,
    images: [
      "https://sfile.chatglm.cn/images-ppt/2a63ef6b9902.jpg",
      "https://sfile.chatglm.cn/images-ppt/b99030a8e7d6.jpg",
    ],
    categorySlug: "home-living",
    featured: false,
    rating: 4.6,
    reviewCount: 267,
    sku: "ART-MS-089",
    brand: "Artisan",
  },
  {
    name: "Verde Indoor Plant Pot",
    description:
      "Modern minimalist plant pot with drainage tray. Made from eco-friendly recycled materials. Fits 6-inch plants.",
    price: 24.99,
    comparePrice: null,
    stock: 90,
    images: [
      "https://sfile.chatglm.cn/images-ppt/f4b1bb95bf26.jpg",
      "https://sfile.chatglm.cn/images-ppt/ad306cadfa4d.jpg",
    ],
    categorySlug: "home-living",
    featured: false,
    rating: 4.3,
    reviewCount: 145,
    sku: "VRD-PP-094",
    brand: "Verde",
  },
  {
    name: "Ergo Pro Office Chair",
    description:
      "Ergonomic mesh office chair with adjustable lumbar support, armrests, and seat height. Breathable design for all-day comfort.",
    price: 449.99,
    comparePrice: 549.99,
    stock: 15,
    images: [
      "https://sfile.chatglm.cn/images-ppt/f5334d518109.jpg",
      "https://sfile.chatglm.cn/images-ppt/fa2aa7ddb0c2.jpg",
    ],
    categorySlug: "home-living",
    featured: true,
    rating: 4.8,
    reviewCount: 203,
    sku: "ERG-OC-101",
    brand: "Ergo",
  },
];

const customerNames = [
  "Olivia Martinez",
  "Liam Thompson",
  "Emma Chen",
  "Noah Patel",
  "Ava Rodriguez",
  "Ethan Kim",
  "Sophia Williams",
  "Mason Garcia",
  "Isabella Brown",
  "Lucas Anderson",
  "Mia Nguyen",
  "Logan Taylor",
  "Charlotte Davis",
  "Jackson Lee",
  "Amelia Wilson",
];

const cities = [
  { city: "New York", state: "NY", zip: "10001", country: "USA" },
  { city: "Los Angeles", state: "CA", zip: "90001", country: "USA" },
  { city: "Chicago", state: "IL", zip: "60601", country: "USA" },
  { city: "Houston", state: "TX", zip: "77001", country: "USA" },
  { city: "Phoenix", state: "AZ", zip: "85001", country: "USA" },
  { city: "Seattle", state: "WA", zip: "98101", country: "USA" },
  { city: "Miami", state: "FL", zip: "33101", country: "USA" },
  { city: "Denver", state: "CO", zip: "80201", country: "USA" },
];

const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "delivered",
  "delivered",
  "cancelled",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const existingCount = await db.product.count();
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: "Database already seeded",
        counts: {
          categories: await db.category.count(),
          products: existingCount,
          orders: await db.order.count(),
        },
      });
    }

    if (force) {
      await db.orderItem.deleteMany();
      await db.order.deleteMany();
      await db.product.deleteMany();
      await db.category.deleteMany();
    }

    // Create categories
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const created = await db.category.create({ data: cat });
      categoryMap[cat.slug] = created.id;
    }

    // Create products
    const productRecords: { id: string; name: string; price: number; image: string }[] = [];
    for (const prod of products) {
      const created = await db.product.create({
        data: {
          name: prod.name,
          slug: slugify(prod.name),
          description: prod.description,
          price: prod.price,
          comparePrice: prod.comparePrice,
          stock: prod.stock,
          images: JSON.stringify(prod.images),
          categoryId: categoryMap[prod.categorySlug],
          featured: prod.featured,
          active: true,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          sku: prod.sku,
          brand: prod.brand,
        },
      });
      productRecords.push({
        id: created.id,
        name: created.name,
        price: created.price,
        image: prod.images[0],
      });
    }

    // Generate sample orders spread over the last 30 days
    const now = new Date();
    const orderCount = 48;
    for (let i = 0; i < orderCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - daysAgo);
      createdAt.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
        0
      );

      const itemCount = 1 + Math.floor(Math.random() * 3);
      const items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        image: string | null;
      }[] = [];
      const usedProductIds = new Set<string>();
      for (let j = 0; j < itemCount; j++) {
        let prod = pick(productRecords);
        let guard = 0;
        while (usedProductIds.has(prod.id) && guard < 10) {
          prod = pick(productRecords);
          guard++;
        }
        usedProductIds.add(prod.id);
        items.push({
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1 + Math.floor(Math.random() * 2),
          image: prod.image,
        });
      }

      const subtotal = items.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      const shipping = subtotal > 100 ? 0 : 9.99;
      const total = Math.round((subtotal + tax + shipping) * 100) / 100;

      const customer = pick(customerNames);
      const city = pick(cities);
      const status = pick(orderStatuses);
      const paymentStatus =
        status === "cancelled"
          ? "refunded"
          : status === "pending"
          ? "unpaid"
          : "paid";

      await db.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: customer,
          customerEmail: `${customer
            .toLowerCase()
            .replace(/\s+/g, ".")}@example.com`,
          customerPhone: `+1 ${200 + Math.floor(Math.random() * 800)}-${String(
            100 + Math.floor(Math.random() * 900)
          )}-${String(1000 + Math.floor(Math.random() * 9000))}`,
          shippingAddress: JSON.stringify({
            address: `${100 + Math.floor(Math.random() * 9000)} Main St`,
            ...city,
          }),
          status,
          paymentStatus,
          paymentMethod: pick(["card", "card", "paypal", "card"]),
          subtotal,
          tax,
          shipping,
          discount: 0,
          total,
          createdAt,
          updatedAt: createdAt,
          items: { create: items },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      counts: {
        categories: await db.category.count(),
        products: await db.product.count(),
        orders: await db.order.count(),
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
