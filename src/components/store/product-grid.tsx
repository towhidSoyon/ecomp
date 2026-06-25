"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onResetFilters?: () => void;
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

export function ProductGrid({
  products,
  loading,
  onSelectProduct,
  onAddToCart,
  onResetFilters,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-7 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-semibold">No products found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you&rsquo;re
            looking for.
          </p>
        </div>
        {onResetFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            Reset filters
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, idx) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
        >
          <ProductCard
            product={p}
            onSelect={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        </motion.div>
      ))}
    </div>
  );
}
