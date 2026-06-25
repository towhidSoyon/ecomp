"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Search, Store, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSection } from "@/components/admin/admin-sidebar";

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your store performance",
  },
  products: {
    title: "Products",
    subtitle: "Manage your catalog and inventory",
  },
  orders: {
    title: "Orders",
    subtitle: "Track and fulfill customer orders",
  },
  categories: {
    title: "Categories",
    subtitle: "Organize your product taxonomy",
  },
};

interface AdminTopbarProps {
  section: AdminSection;
  onMenuClick?: () => void;
}

export function AdminTopbar({ section, onMenuClick }: AdminTopbarProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const meta = SECTION_TITLES[section];
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Title */}
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-semibold leading-tight md:text-lg">
          {meta.title}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {meta.subtitle}
        </p>
      </div>

      {/* Search (decorative on large screens) */}
      <div className="relative ml-auto hidden lg:block lg:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Quick search..."
          className="pl-9"
          aria-label="Quick search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted ? (
            isDark ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )
          ) : (
            <Sun className="size-5" />
          )}
        </Button>

        {/* View store */}
        <Button
          variant="outline"
          className="hidden gap-2 sm:inline-flex"
          onClick={() => router.push("/")}
        >
          <Store className="size-4" />
          View Store
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden"
          aria-label="View store"
          onClick={() => router.push("/")}
        >
          <Store className="size-4" />
        </Button>
      </div>
    </header>
  );
}
