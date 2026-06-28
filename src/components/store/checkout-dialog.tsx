"use client";

import * as React from "react";
import { Loader2, ShoppingBag, Lock, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { AuthDialog } from "@/components/auth/auth-dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (orderNumber: string) => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: "card" | "paypal";
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "USA",
  paymentMethod: "card",
};

const TAX_RATE = 0.08;
const FREE_SHIP_THRESHOLD = 100;
const FLAT_SHIPPING = 9.99;

export function CheckoutDialog({
  open,
  onOpenChange,
  onSuccess,
}: CheckoutDialogProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const { user, loading } = useAuth();

  const [form, setForm] = React.useState<FormState>(initialForm);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);

  const resetCheckoutState = React.useCallback(() => {
    setForm((current) => ({
      ...current,
      fullName: user?.name || current.fullName,
      email: user?.email || current.email,
    }));
    setErrors({});
    setSubmitting(false);
  }, [user]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitting(false);
      setErrors({});
    } else {
      resetCheckoutState();
    }
    onOpenChange(nextOpen);
  };

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal > FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.zip.trim()) e.zip = "ZIP is required";
    if (!form.country.trim()) e.country = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (items.length === 0) return;
    if (loading) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        customerName: form.fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }
      clearCart();
      onSuccess(data.order.orderNumber as string);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      setErrors((e) => ({ ...e, email: message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent key={`${open}-${user?.email ?? "guest"}`} className="max-h-[92vh] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b p-4 sm:p-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="size-5 text-emerald-600" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your order below. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid max-h-[calc(92vh-80px)] grid-cols-1 overflow-y-auto md:grid-cols-5"
        >
          {/* Left: form */}
          <div className="flex flex-col gap-5 p-4 sm:p-6 md:col-span-3">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact Information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  error={errors.fullName}
                  required
                >
                  <Input
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                  />
                </Field>
                <Field label="Email" error={errors.email} required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="jane@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                </Field>
                <Field label="Phone" error={errors.phone} required>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                  />
                </Field>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Shipping Address
              </h3>
              <Field label="Street Address" error={errors.address} required>
                <Input
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="123 Main St"
                  autoComplete="street-address"
                  aria-invalid={!!errors.address}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="City" error={errors.city} required>
                  <Input
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="San Francisco"
                    autoComplete="address-level2"
                    aria-invalid={!!errors.city}
                  />
                </Field>
                <Field label="State / Province" error={errors.state} required>
                  <Input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    placeholder="CA"
                    autoComplete="address-level1"
                    aria-invalid={!!errors.state}
                  />
                </Field>
                <Field label="ZIP / Postal Code" error={errors.zip} required>
                  <Input
                    value={form.zip}
                    onChange={(e) => setField("zip", e.target.value)}
                    placeholder="94016"
                    autoComplete="postal-code"
                    aria-invalid={!!errors.zip}
                  />
                </Field>
                <Field label="Country" error={errors.country} required>
                  <Input
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    placeholder="USA"
                    autoComplete="country-name"
                    aria-invalid={!!errors.country}
                  />
                </Field>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Payment Method
              </h3>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) =>
                  setField("paymentMethod", v as "card" | "paypal")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit / Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
              {form.paymentMethod === "card" && (
                <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <Lock className="size-3.5 text-emerald-600" />
                    Demo mode — no real card details required
                  </p>
                  <p className="mt-1">
                    Card fields are simulated for this storefront demo.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right: order summary */}
          <aside className="flex flex-col gap-4 border-t bg-muted/30 p-4 sm:p-6 md:col-span-2 md:border-l md:border-t-0">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Order Summary
            </h3>

            <ScrollArea className="max-h-56">
              <ul className="flex flex-col gap-3 pr-2">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-background">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                      <Badge className="absolute -right-1 -top-1 size-5 items-center justify-center rounded-full bg-primary px-0 text-[10px] font-semibold text-primary-foreground">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-xs font-medium leading-snug">
                        {item.name}
                      </p>
                      <p className="mt-auto text-xs text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-xs text-muted-foreground">
                    Your cart is empty.
                  </li>
                )}
              </ul>
            </ScrollArea>

            <Separator />

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
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8%)</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(tax)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting || items.length === 0 || loading}
              className="mt-2 h-12 w-full text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-5" />
                  Place Order · {formatCurrency(total)}
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="size-3" />
              Secure checkout · Your information is encrypted
            </p>
          </aside>
        </form>
      </DialogContent>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} mode="login" onSuccess={() => {
        setAuthOpen(false);
        if (open) {
          setForm((current) => ({
            ...current,
            fullName: user?.name || current.fullName,
            email: user?.email || current.email,
          }));
        }
      }} />
    </Dialog>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className={cn("text-xs font-medium text-destructive")}>{error}</p>
      )}
    </div>
  );
}
