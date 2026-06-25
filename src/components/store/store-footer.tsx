"use client";

import * as React from "react";
import { ShoppingBag, Mail, Github, Twitter, Instagram } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface StoreFooterProps {
  categories?: { name: string; slug: string }[];
  onSelectCategory?: (slug: string) => void;
}

export function StoreFooter({
  categories = [],
  onSelectCategory,
}: StoreFooterProps) {
  const [email, setEmail] = React.useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed! Welcome to ShopFlow.", {
      description: "Look out for exclusive deals in your inbox.",
    });
    setEmail("");
  };

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag className="size-5" />
              </span>
              <span className="text-lg font-bold">
                Shop<span className="text-emerald-600">Flow</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Curated products for modern living. Quality you can trust,
              delivered with care to your doorstep.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-5 flex w-full max-w-sm flex-col gap-2 sm:flex-row"
              aria-label="Newsletter signup"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="pl-9"
                  aria-label="Email for newsletter"
                />
              </div>
              <Button type="submit" className="h-9">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Shop categories */}
          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {categories.length > 0 ? (
                <>
                  <li>
                    <button
                      className="text-left transition-colors hover:text-foreground"
                      onClick={() => onSelectCategory?.("all")}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.slice(0, 5).map((c) => (
                    <li key={c.slug}>
                      <button
                        className="text-left transition-colors hover:text-foreground"
                        onClick={() => onSelectCategory?.(c.slug)}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  <li>
                    <span className="transition-colors hover:text-foreground">
                      All Products
                    </span>
                  </li>
                  <li>New Arrivals</li>
                  <li>Best Sellers</li>
                  <li>On Sale</li>
                  <li>Gift Cards</li>
                </>
              )}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="text-sm font-semibold">Customer Service</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Help Center
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Track Your Order
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Shipping &amp; Returns
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Size Guide
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Contact Us
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold">About</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Our Story
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Sustainability
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Careers
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Press
              </li>
              <li className="cursor-pointer transition-colors hover:text-foreground">
                Affiliate Program
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ShopFlow, Inc. All rights
            reserved. &middot; Privacy &middot; Terms
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Twitter"
            >
              <Twitter className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
