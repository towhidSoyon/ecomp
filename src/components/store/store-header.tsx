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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/lib/auth";
import { AuthPendingAction } from "@/lib/auth-config";
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
  const { user, signOut, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [pendingAction, setPendingAction] = React.useState<AuthPendingAction | null>(null);
  const totalItems = useCartStore((s) => s.getTotalItems());

  const handleAuthOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingAction(null);
    }
    setAuthOpen(nextOpen);
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const goAdmin = () => {
    if (user?.role === "admin") {
      router.push("/?view=admin");
      return;
    }

    setPendingAction("admin");
    setAuthMode("login");
    setAuthOpen(true);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navigateToProducts = (slug: string) => {
    const params = new URLSearchParams();
    if (slug && slug !== "all") {
      params.set("category", slug);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ""}`);
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
            onClick={() => navigateToProducts("all")}
          >
            All Products
          </Button>
          {categories.slice(0, 6).map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              size="sm"
              className="h-9 text-sm font-medium"
              onClick={() => navigateToProducts(c.slug)}
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
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>

          {/* Auth / Admin */}
          {loading ? null : user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" size="sm" onClick={goAdmin} className="h-9">
                <LayoutDashboard className="size-4" />
                <span className="hidden md:inline">Admin</span>
              </Button>
              <Link href="/profile" className="flex items-center">
                <Avatar>
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="h-9">
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAuthMode("login");
                setAuthOpen(true);
              }}
              className="hidden h-9 sm:inline-flex"
            >
              Sign in
            </Button>
          )}

          {/* Cart */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenCart}
            className="relative h-9 pr-3"
            aria-label={mounted ? `Open cart, ${totalItems} items` : "Open cart"}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {mounted && totalItems > 0 && (
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
                    onClick={() => navigateToProducts("all")}
                    className="flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    All Products
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateToProducts(c.slug)}
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

                {user && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push('/profile');
                    }}
                    className="h-10 justify-start"
                  >
                    Profile
                  </Button>
                )}

                {user ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="h-10 justify-start"
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthMode("login");
                      setAuthOpen(true);
                    }}
                    className="h-10 justify-start"
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={handleAuthOpenChange}
        mode={authMode}
        onSuccess={() => {
          if (pendingAction === "admin") {
            router.push("/?view=admin");
            setPendingAction(null);
            return;
          }

          if (authMode === "login") {
            router.push("/");
          }
        }}
      />
    </header>
  );
}
