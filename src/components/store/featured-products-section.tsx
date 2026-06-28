"use client";

import * as React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

interface FeaturedProductsSectionProps {
  products: Product[];
  loading?: boolean;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBrowse?: () => void;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedProductsSection({
  products,
  loading = false,
  onSelectProduct,
  onAddToCart,
  onBrowse,
}: FeaturedProductsSectionProps) {
  const visibleProducts = products.slice(0, 4);

  return (
    <section className="mb-8 rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="size-4" />
            Featured picks
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Hand-picked favorites
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated essentials and standout pieces that customers love right now.
          </p>
        </div>

        {onBrowse && (
          <Button variant="outline" onClick={onBrowse} className="w-fit">
            Browse deals
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background/60 p-8 text-center text-sm text-muted-foreground">
          Featured products will appear here soon.
        </div>
      )}
    </section>
  );
}
