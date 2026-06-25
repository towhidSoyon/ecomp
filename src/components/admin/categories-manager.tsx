"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderTree,
  Loader2,
  Package,
  Plus,
  Tag,
} from "lucide-react";

import type { Category } from "@/lib/types";
import { formatNumber } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoriesManagerProps {
  categories: Category[];
}

const ICON_OPTIONS = [
  "Tag",
  "FolderTree",
  "Package",
  "Sparkles",
  "Headphones",
  "Shirt",
  "Home",
  "Coffee",
] as const;

export function CategoriesManager({ categories: propCategories }: CategoriesManagerProps) {
  const queryClient = useQueryClient();

  // Fetch fresh categories with product counts
  const { data, isLoading, isError, refetch } = useQuery<{ categories: Category[] }>({
    queryKey: ["categories", "admin"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json;
    },
    initialData: propCategories.length ? { categories: propCategories } : undefined,
  });

  const categories = data?.categories ?? [];
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState<string>(ICON_OPTIONS[0]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          icon,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create category");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Category created");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      setName("");
      setDescription("");
      setIcon(ICON_OPTIONS[0]);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {formatNumber(categories.length)} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Failed to load categories.{" "}
          <button
            className="text-emerald-600 underline-offset-2 hover:underline"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <FolderTree className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No categories yet</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Create your first category to organize products.
          </p>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Tag className="size-5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                  <Package className="size-3" />
                  {formatNumber(c.productCount ?? 0)} products
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {c.description || "No description provided."}
                </p>
              </div>
              <div className="mt-auto pt-2 text-xs text-muted-foreground">
                <span className="font-mono">/{c.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add category dialog */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new product category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Electronics"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIcon(opt)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                      (icon === opt
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-input bg-background hover:bg-accent")
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
