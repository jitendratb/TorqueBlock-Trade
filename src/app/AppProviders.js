"use client";

import { useEffect } from "react";
import { SettingsProvider } from "@/modules/site/SettingsProvider";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useOrderListStore } from "@/modules/orders/orderList.store";
import { useCatalogStore } from "@/modules/catalog/catalog.store";
import { useAccountStore } from "@/modules/account/account.store";

// Restores persisted state after mount (keeps SSR markup identical) and loads the dealer profile.
export default function AppProviders({ settings, children }) {
    useEffect(() => {
        useOrderListStore.persist.rehydrate();
        Promise.resolve(useAuthStore.persist.rehydrate()).then(() => useAuthStore.getState().loadProfile());

        // Dealer prices and the business account belong to the session — drop them on logout.
        return useAuthStore.subscribe((state, prev) => {
            if (prev.token && !state.token) {
                useCatalogStore.getState().resetDealerPrices();
                useAccountStore.getState().reset();
            }
        });
    }, []);

    return <SettingsProvider settings={settings}>{children}</SettingsProvider>;
}
