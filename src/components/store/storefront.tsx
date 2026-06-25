"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { StoreHeader } from "./store-header";
import { HeroSection } from "./hero-section";
import { CategoryBar, type SortOption } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { ProductDetailDialog } from "./product-detail-dialog";
import { CartDrawer } from "./cart-drawer";
import { CheckoutDialog } from "./checkout-dialog";
import { OrderSuccessDialog } from "./order-success-dialog";
import { StoreFooter } from "./store-footer";

import { useCartStore } from "@/lib/cart-store";
import type { Category, Product } from "@/lib/types";

export default function Storefront() {
  // Filters
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");

  // Dialog state
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = React.useState<
    string | null
  >(null);

  // Cart state
  const cartOpen = useCartStore((s) => s.isOpen);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const addItem = useCartStore((s) => s.addItem);

  // Debounce search input
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  // Data: categories
  const { data: categoriesData } = useQuery<{
    success: boolean;
    categories: Category[];
  }>({
    queryKey: ["store-categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });
  const categories = categoriesData?.categories ?? [];

  // Data: products
  const productsQuery = useQuery<{ success: boolean; products: Product[] }>({
    queryKey: [
      "store-products",
      selectedCategory,
      debouncedSearch,
      sortBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        activeOnly: "true",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/products?${params.toString()}`);
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
  const products = productsQuery.data?.products ?? [];

  // Handlers
  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setDetailOpen(true);
  };

  const handleAddToCart = (p: Product, qty = 1) => {
    addItem(p, qty);
    toast.success("Added to cart", {
      description: `${p.name} × ${qty}`,
    });
  };

  const handleAddFromDetail = (p: Product, qty: number) => {
    addItem(p, qty);
    toast.success("Added to cart", {
      description: `${p.name} × ${qty}`,
    });
  };

  const productsRef = React.useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleBrowseDeals = () => {
    setSelectedCategory("all");
    setSortBy("price-asc");
    // Wait for re-render then scroll
    window.setTimeout(scrollToProducts, 50);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (orderNumber: string) => {
    setCheckoutOpen(false);
    setSuccessOrderNumber(orderNumber);
  };

  const handleSuccessClose = () => {
    setSuccessOrderNumber(null);
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
    scrollToProducts();
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setCartOpen(true)}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          scrollToProducts();
        }}
      />

      <HeroSection
        onShopNow={scrollToProducts}
        onBrowseDeals={handleBrowseDeals}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div ref={productsRef} id="products" className="scroll-mt-32">
          {/* Section header */}
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {selectedCategory === "all"
                  ? "All Products"
                  : categories.find((c) => c.slug === selectedCategory)?.name ??
                    "Products"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {!productsQuery.isLoading && (
                  <>
                    {products.length}{" "}
                    {products.length === 1 ? "item" : "items"}
                    {debouncedSearch && (
                      <>
                        {" "}
                        matching <span className="font-medium">&ldquo;{debouncedSearch}&rdquo;</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <CategoryBar
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="mt-5">
            <ProductGrid
              products={products}
              loading={productsQuery.isLoading}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onResetFilters={resetFilters}
            />
          </div>
        </div>
      </main>

      <StoreFooter
        categories={categories}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          scrollToProducts();
        }}
      />

      {/* Overlays */}
      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddToCart={handleAddFromDetail}
      />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={handleCheckoutSuccess}
      />
      <OrderSuccessDialog
        orderNumber={successOrderNumber}
        onClose={handleSuccessClose}
      />
    </div>
  );
}
