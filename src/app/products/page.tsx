"use client";

import { Suspense } from "react";
import Storefront from "@/components/store/storefront";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading products…</p>
          </div>
        </div>
      }
    >
      <Storefront variant="catalog" />
    </Suspense>
  );
}
