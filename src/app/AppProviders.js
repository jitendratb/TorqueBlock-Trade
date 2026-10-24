"use client";

import { useEffect } from "react";
import { SettingsProvider } from "@/components/site/SettingsProvider";
import { useAuthStore } from "@/store/authStore";
import { useOrderListStore } from "@/store/orderStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useAccountStore } from "@/store/accountStore";

import { ErrorBoundary } from "@/ui";

// Restores persisted state after mount (keeps SSR markup identical) and loads the trade profile.
export default function AppProviders({ settings, children }) {
    useEffect(() => {
        useOrderListStore.persist.rehydrate();
        Promise.resolve(useAuthStore.persist.rehydrate()).then(() => useAuthStore.getState().loadProfile());

        // Trade prices and the business account belong to the session — drop them on logout.
        return useAuthStore.subscribe((state, prev) => {
            if (prev.token && !state.token) {
                useCatalogStore.getState().resetTradePrices();
                useAccountStore.getState().reset();
            }
        });
    }, []);

    return (
        <ErrorBoundary>
            <SettingsProvider settings={settings}>{children}</SettingsProvider>
        </ErrorBoundary>
    );
}
