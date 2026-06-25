"use client";

import * as React from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Category, Product } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormDialogProps {
  product?: Product | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  brand: string;
  sku: string;
  categoryId: string;
  images: string[];
  featured: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "0",
  brand: "",
  sku: "",
  categoryId: "",
  images: [""],
  featured: false,
  active: true,
};

function toFormState(product?: Product | null): FormState {
  if (!product) return { ...EMPTY };
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    comparePrice:
      product.comparePrice != null ? String(product.comparePrice) : "",
    stock: String(product.stock),
    brand: product.brand ?? "",
    sku: product.sku ?? "",
    categoryId: product.categoryId,
    images: product.images.length ? [...product.images] : [""],
    featured: product.featured,
    active: product.active,
  };
}

export function ProductFormDialog({
  product,
  categories,
  open,
  onClose,
}: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(product);

  const [form, setForm] = React.useState<FormState>(() => toFormState(product));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(toFormState(product));
      setErrors({});
    }
  }, [open, product]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateImage = (idx: number, value: string) =>
    setForm((prev) => {
      const images = [...prev.images];
      images[idx] = value;
      return { ...prev, images };
    });

  const addImage = () =>
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));

  const removeImage = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.length === 1 ? [""] : prev.images.filter((_, i) => i !== idx),
    }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      next.price = "Enter a valid price";
    if (
      form.comparePrice &&
      (isNaN(Number(form.comparePrice)) || Number(form.comparePrice) < 0)
    )
      next.comparePrice = "Enter a valid compare price";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      next.stock = "Enter a valid stock quantity";
    if (!form.categoryId) next.categoryId = "Select a category";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: Number(form.stock),
        brand: form.brand.trim() || null,
        sku: form.sku.trim() || null,
        categoryId: form.categoryId,
        images: form.images.map((i) => i.trim()).filter(Boolean),
        featured: form.featured,
        active: form.active,
      };

      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }
      return data;
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product details below."
              : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pf-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Wireless Headphones"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="pf-description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the product..."
              rows={4}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pf-price">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="99.99"
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-compare">Compare Price</Label>
              <Input
                id="pf-compare"
                type="number"
                step="0.01"
                min="0"
                value={form.comparePrice}
                onChange={(e) => update("comparePrice", e.target.value)}
                placeholder="129.99"
                aria-invalid={Boolean(errors.comparePrice)}
              />
              {errors.comparePrice && (
                <p className="text-xs text-destructive">{errors.comparePrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-stock">
                Stock <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="100"
                aria-invalid={Boolean(errors.stock)}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pf-brand">Brand</Label>
              <Input
                id="pf-brand"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Acme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-sku">SKU</Label>
              <Input
                id="pf-sku"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="WH-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => update("categoryId", v)}
            >
              <SelectTrigger
                id="pf-category"
                className="w-full"
                aria-invalid={Boolean(errors.categoryId)}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Image URLs</Label>
            <div className="space-y-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImagePlus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={img}
                      onChange={(e) => updateImage(idx, e.target.value)}
                      placeholder="https://..."
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={addImage}
            >
              <Plus className="size-4" />
              Add image
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="pf-featured"
                checked={form.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <Label htmlFor="pf-featured" className="cursor-pointer">
                Featured product
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="pf-active"
                checked={form.active}
                onCheckedChange={(v) => update("active", v)}
              />
              <Label htmlFor="pf-active" className="cursor-pointer">
                Active (visible in store)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
