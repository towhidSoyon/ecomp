// Shared TypeScript types for the ecommerce app

export type ProductStatus = "active" | "inactive";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  featured: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  sku: string | null;
  brand: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  stock: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: Order[];
  topProducts: { name: string; sold: number; revenue: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
}
