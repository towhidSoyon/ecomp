"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  onCheckout,
}: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const totalItems = useCartStore((s) => s.getTotalItems());

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const remainingForFreeShip = Math.max(0, 100 - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / 100) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex flex-row items-center justify-between gap-2 border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <ShoppingBag className="size-5" />
            Your Cart
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalItems}
              </Badge>
            )}
          </SheetTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
              Clear
            </Button>
          )}
          <SheetDescription className="sr-only">
            Review the items in your cart and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Looks like you haven&rsquo;t added anything yet.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/20">
              {remainingForFreeShip > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Add{" "}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(remainingForFreeShip)}
                  </span>{" "}
                  more to unlock <strong>free shipping</strong>.
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <ShoppingBag className="size-3.5" />
                  You&rsquo;ve unlocked free shipping!
                </p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShipProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <ul className="flex flex-col divide-y">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 p-4"
                    >
                      <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-2 text-sm font-medium leading-snug">
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>

                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.price)}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3.5" />
                            </Button>
                            <span
                              className="w-8 text-center text-sm font-semibold tabular-nums"
                              aria-live="polite"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Subtotal:{" "}
                            <span className="font-semibold text-foreground">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(subtotal + shipping)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={onCheckout}
                className="mt-4 h-12 w-full text-base"
              >
                Checkout
                <ArrowRight className="size-4" />
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Taxes calculated at checkout.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
