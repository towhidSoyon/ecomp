"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Storefront from "@/components/store/storefront";
import AdminPanel from "@/components/admin/admin-panel";
import { useAuth } from "@/lib/auth";

function AppContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const { user, loading } = useAuth();

  if (view === "admin") {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center text-sm text-muted-foreground">
            Verifying admin access...
          </div>
        </div>
      );
    }

    if (user?.role !== "admin") {
      return <Storefront />;
    }

    return <AdminPanel />;
  }

  return <Storefront />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading ShopFlow…</p>
          </div>
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
