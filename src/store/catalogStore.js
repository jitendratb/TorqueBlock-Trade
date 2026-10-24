"use client";

import { create } from "zustand";
import CatalogService from "@/services/CatalogService";

// Trade price map shared by the stock list and the order list. Loaded once per session.
export const useCatalogStore = create((set, get) => ({
    tradePrices: null,
    status: "idle", // idle | loading | ready | error

    loadTradePrices: async () => {
        if (["loading", "ready"].includes(get().status)) return;
        set({ status: "loading" });
        try {
            set({ tradePrices: await CatalogService.fetchTradePrices(), status: "ready" });
        } catch {
            set({ status: "error" });
        }
    },

    resetTradePrices: () => set({ tradePrices: null, status: "idle" }),
}));

export default useCatalogStore;
