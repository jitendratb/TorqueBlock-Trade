"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Multi-size order list. Prices are not stored — they are read from the live dealer price
// map at render time, so a saved list never shows a stale price.
export const useOrderListStore = create(
    persist(
        (set) => ({
            items: [],

            add: (line) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === line.id);
                    return {
                        items: existing
                            ? state.items.map((i) => (i.id === line.id ? { ...i, quantity: i.quantity + line.quantity } : i))
                            : [...state.items, line],
                    };
                }),
            setQuantity: (id, quantity) => set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)) })),
            remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            clear: () => set({ items: [] }),
        }),
        { name: "trade-order-list", skipHydration: true }
    )
);

export const selectUnits = (state) => state.items.reduce((sum, i) => sum + i.quantity, 0);

// Snapshot of a stock row for the order list / order request.
export const toLine = (product, size, quantity) => ({
    id: size.id,
    productName: product.name,
    brandName: product.brand?.name || "",
    image: product.image,
    size: size.size,
    position: size.position,
    spec: size.spec,
    quantity,
});
