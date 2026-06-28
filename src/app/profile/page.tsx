"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import type { Order } from "@/lib/types";
import Storefront from "@/components/store/storefront";
import { StoreHeader } from "@/components/store/store-header";
import ProfileSidebar from "@/components/profile/profile-sidebar";

type ProfileSection = "overview" | "orders" | "account" | "addresses";

export default function ProfilePage() {
  const { user, loading, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const [section, setSection] = React.useState<ProfileSection>("overview");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.email) {
        setOrders([]);
        return;
      }
      setOrdersLoading(true);
      try {
        const res = await fetch(`/api/orders?search=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (!mounted) return;
        setOrders(data?.orders ?? []);
      } catch (err) {
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [user?.email]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (!mounted) return;
        setCategories(json.categories ?? []);
      } catch (e) {
        // noop
      }
    })();
    return () => { mounted = false };
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">You must sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StoreHeader
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => {}}
        onSelectCategory={(slug) => {}}
      />
      <div className="flex min-h-screen bg-muted/30">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r md:block p-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <Separator />

            <ProfileSidebar section={section} onSectionChange={setSection} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b p-6">
            <h1 className="text-2xl font-semibold">Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your account and view order history.</p>
          </div>

          <main className="flex-1 p-6">
            {section === "overview" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2 rounded-lg border bg-card p-6">
                  <h2 className="text-lg font-medium">Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">Update your display name and email address.</p>
                  <form onSubmit={handleSave} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      <Button variant="outline" onClick={() => { signOut(); router.push('/'); }}>Sign out</Button>
                    </div>
                  </form>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-sm font-semibold">Quick Actions</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    <Button onClick={() => router.push('/products')}>Browse products</Button>
                    <Button onClick={() => router.push('/orders')}>View all orders</Button>
                  </div>
                </div>
              </div>
            )}

            {section === "orders" && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Your Orders</h2>
                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading orders…</p>
                ) : !orders || orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders found.</p>
                ) : (
                  <ul className="space-y-3">
                    {orders.map((o) => (
                      <li key={o.id} className="rounded-lg border bg-card p-4">
                        <a href={`/profile/orders/${o.id}`} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{o.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">{o.customerEmail} · {o.status}</div>
                          </div>
                          <div className="text-sm font-semibold">${o.total.toFixed(2)}</div>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {section === "account" && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-medium">Account Settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">Manage account preferences and security.</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Button onClick={() => alert('Not implemented: change password')}>Change password</Button>
                  <Button variant="destructive" onClick={() => alert('Not implemented: delete account')}>Delete account</Button>
                </div>
              </div>
            )}

            {section === "addresses" && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-medium">Addresses</h2>
                <p className="mt-1 text-sm text-muted-foreground">Manage your saved shipping addresses.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
