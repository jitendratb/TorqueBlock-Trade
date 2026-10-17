"use client";

import { create } from "zustand";
import { fetchDealerPrices } from "./catalog.api";

// Dealer price map shared by the stock list and the order list. Loaded once per session.
export const useCatalogStore = create((set, get) => ({
    dealerPrices: null,
    status: "idle", // idle | loading | ready | error

    loadDealerPrices: async () => {
        if (["loading", "ready"].includes(get().status)) return;
        set({ status: "loading" });
        try {
            set({ dealerPrices: await fetchDealerPrices(), status: "ready" });
        } catch {
            set({ status: "error" });
        }
    },

    resetDealerPrices: () => set({ dealerPrices: null, status: "idle" }),
}));

// Dealer price when available, otherwise the public selling price.
export const priceFor = (dealerPrices, size) => dealerPrices?.[size.id] ?? size.price;
