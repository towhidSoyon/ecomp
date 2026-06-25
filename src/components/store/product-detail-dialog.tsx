"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAddToCart: (p: Product, quantity: number) => void;
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
            "size-4",
            i <= rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {rating.toFixed(1)} · {0} reviews
      </span>
    </div>
  );
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductDetailDialogProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState(0);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setQuantity(1);
      setActiveImage(0);
      setAdded(false);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const hasSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasSale
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const images = product.images.length ? product.images : [""];

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Image gallery */}
          <div className="flex flex-col gap-3 p-4 sm:p-6">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.5, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square overflow-hidden rounded-xl border bg-muted"
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                className="size-full object-cover"
              />
              {hasSale && (
                <Badge className="absolute left-3 top-3 bg-amber-500 text-white hover:bg-amber-500">
                  Sale · -{discountPct}%
                </Badge>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      i === activeImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === activeImage}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 overflow-y-auto border-t p-4 sm:p-6 md:border-l md:border-t-0">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {product.category.name}
                </Badge>
              )}
              {product.featured && (
                <Badge variant="outline">Featured</Badge>
              )}
              {product.sku && (
                <span className="ml-auto text-xs text-muted-foreground">
                  SKU: <span className="font-mono">{product.sku}</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {product.brand && (
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  {product.brand}
                </p>
              )}
              <h2 className="text-pretty text-2xl font-bold leading-tight">
                {product.name}
              </h2>
              <RatingStars rating={product.rating} />
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {hasSale && (
                <span className="pb-1 text-base text-muted-foreground line-through">
                  {formatCurrency(product.comparePrice!)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div>
              {outOfStock ? (
                <Badge variant="destructive" className="bg-red-600 text-white">
                  Out of Stock
                </Badge>
              ) : lowStock ? (
                <Badge
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  Only {product.stock} left
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Check className="size-3" />
                  In Stock
                </Badge>
              )}
            </div>

            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <Separator />

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-1 rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </Button>
                <span
                  className="w-10 text-center text-sm font-semibold tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock || outOfStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              onClick={handleAdd}
              disabled={outOfStock}
              className="h-12 w-full text-base"
            >
              {added ? (
                <>
                  <Check className="size-5 text-emerald-500" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="size-5" />
                  Add to Cart · {formatCurrency(product.price * quantity)}
                </>
              )}
            </Button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-2">
                <Truck className="size-4 text-emerald-600" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Free over $100
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  2-yr warranty
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-2">
                <Package className="size-4 text-emerald-600" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Easy returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
