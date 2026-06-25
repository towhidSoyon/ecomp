"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Plus, Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onSelect: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ProductCard({
  product,
  onSelect,
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = React.useState(false);
  const outOfStock = product.stock <= 0;
  const hasSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasSale
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect(product)}
        onKeyDown={handleKeyDown}
        className="group relative h-full cursor-pointer gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.name}`}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0] ?? ""}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top-left badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            {hasSale && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                Sale · -{discountPct}%
              </Badge>
            )}
            {product.featured && (
              <Badge
                variant="secondary"
                className="bg-background/90 text-foreground backdrop-blur"
              >
                Featured
              </Badge>
            )}
            {outOfStock && (
              <Badge variant="destructive" className="bg-red-600 text-white">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick add button on hover (desktop) */}
          {!outOfStock && (
            <Button
              size="icon"
              onClick={handleAdd}
              className="absolute bottom-2 right-2 size-9 translate-y-2 opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 p-3 sm:p-4">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">
            {product.name}
          </h3>
          <RatingStars rating={product.rating} />

          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {hasSale && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.comparePrice!)}
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={outOfStock}
              className="h-9 min-w-9 sm:px-3"
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
              <span className="hidden sm:inline">
                {added ? "Added" : "Add"}
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
