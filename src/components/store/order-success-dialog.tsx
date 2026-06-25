"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Copy, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OrderSuccessDialogProps {
  orderNumber: string | null;
  onClose: () => void;
}

export function OrderSuccessDialog({
  orderNumber,
  onClose,
}: OrderSuccessDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors silently
    }
  };

  return (
    <Dialog open={!!orderNumber} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
            >
              <CheckCircle2 className="size-10 text-emerald-600" />
            </motion.div>
          </motion.div>
          <DialogTitle className="mt-3 text-2xl font-bold">
            Order Placed!
          </DialogTitle>
          <DialogDescription>
            Thank you for your purchase. We&rsquo;ve received your order and
            will send a confirmation email shortly.
          </DialogDescription>
        </DialogHeader>

        {orderNumber && (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order Number
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold tracking-tight">
                  {orderNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                A confirmation has been sent to your email.
              </p>
              <p className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Estimated delivery: 3–5 business days.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 sm:justify-center">
          <Button
            size="lg"
            onClick={onClose}
            className="h-11 w-full text-base"
          >
            <ShoppingBag className="size-5" />
            Continue Shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
