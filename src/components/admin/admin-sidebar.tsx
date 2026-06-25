"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Store,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AdminSection =
  | "dashboard"
  | "products"
  | "orders"
  | "categories";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "categories", label: "Categories", icon: Tags },
];

interface AdminSidebarProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onNavigate?: () => void;
}

export function AdminSidebar({
  section,
  onSectionChange,
  onNavigate,
}: AdminSidebarProps) {
  const router = useRouter();

  const handleNav = (id: AdminSection) => {
    onSectionChange(id);
    onNavigate?.();
  };

  const handleViewStore = () => {
    onNavigate?.();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">ShopFlow</span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Manage
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2.5"
          onClick={handleViewStore}
        >
          <Store className="size-4" />
          View Store
        </Button>
        <p className="px-2 pt-3 text-[11px] text-muted-foreground">
          ShopFlow Admin v1.0
        </p>
      </div>
    </div>
  );
}
