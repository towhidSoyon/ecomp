"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) => {
        const existing = get().items.find(
          (item) => item.productId === product.id
        );
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity: Math.min(
                      item.quantity + quantity,
                      product.stock || 99
                    ),
                  }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? "",
            quantity,
            slug: product.slug,
            stock: product.stock || 99,
          };
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: "shopflow-cart" }
  )
);
