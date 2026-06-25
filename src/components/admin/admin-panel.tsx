"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import type { Category } from "@/lib/types";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  AdminSidebar,
  type AdminSection,
} from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Dashboard } from "@/components/admin/dashboard";
import { ProductsManager } from "@/components/admin/products-manager";
import { OrdersManager } from "@/components/admin/orders-manager";
import { CategoriesManager } from "@/components/admin/categories-manager";

export function AdminPanel() {
  const [section, setSection] = React.useState<AdminSection>("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Shared categories query (deduped by TanStack Query).
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json;
    },
  });
  const categories = categoriesData?.categories ?? [];

  const handleSectionChange = (s: AdminSection) => {
    setSection(s);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r md:block">
        <AdminSidebar
          section={section}
          onSectionChange={handleSectionChange}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Navigate between admin sections.
            </SheetDescription>
          </SheetHeader>
          <AdminSidebar
            section={section}
            onSectionChange={handleSectionChange}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          section={section}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">
          {section === "dashboard" && <Dashboard />}
          {section === "products" && (
            <ProductsManager categories={categories} />
          )}
          {section === "orders" && <OrdersManager />}
          {section === "categories" && (
            <CategoriesManager categories={categories} />
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
