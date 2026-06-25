"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Menu,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/cart-store";
import type { Category } from "@/lib/types";

interface StoreHeaderProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onSelectCategory: (slug: string) => void;
}

export function StoreHeader({
  categories,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onSelectCategory,
}: StoreHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());

  React.useEffect(() => setMounted(true), []);

  const goAdmin = () => router.push("/?view=admin");

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleCategoryClick = (slug: string) => {
    onSelectCategory(slug);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md"
          aria-label="ShopFlow home"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Shop<span className="text-emerald-600">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden flex-1 items-center gap-1 lg:flex"
          aria-label="Categories"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-sm font-medium"
            onClick={() => handleCategoryClick("all")}
          >
            All
          </Button>
          {categories.slice(0, 6).map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              size="sm"
              className="h-9 text-sm font-medium"
              onClick={() => handleCategoryClick(c.slug)}
            >
              {c.name}
            </Button>
          ))}
        </nav>

        {/* Search (desktop) */}
        <div className="relative hidden flex-1 lg:block lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="h-9 pl-9"
            aria-label="Search products"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-9"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )
            ) : (
              <Sun className="size-5" />
            )}
          </Button>

          {/* Admin */}
          <Button
            variant="outline"
            size="sm"
            onClick={goAdmin}
            className="hidden h-9 sm:inline-flex"
          >
            <LayoutDashboard className="size-4" />
            <span className="hidden md:inline">Admin</span>
          </Button>

          {/* Cart */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenCart}
            className="relative h-9 pr-3"
            aria-label={`Open cart, ${totalItems} items`}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-semibold text-white shadow"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[85vw]">
              <SheetHeader className="px-4">
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ShoppingBag className="size-4" />
                  </span>
                  <span className="text-lg font-bold">
                    Shop<span className="text-emerald-600">Flow</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="h-10 pl-9"
                    aria-label="Search products"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  <button
                    onClick={() => handleCategoryClick("all")}
                    className="flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryClick(c.slug)}
                      className="flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      {c.name}
                      {typeof c.productCount === "number" && (
                        <Badge variant="secondary" className="text-xs">
                          {c.productCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                <Separator />

                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    goAdmin();
                  }}
                  className="h-10 justify-start"
                >
                  <LayoutDashboard className="size-4" />
                  Admin Panel
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
