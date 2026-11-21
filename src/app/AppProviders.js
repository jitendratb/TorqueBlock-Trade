"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ui";
import { SettingsProvider } from "@/context/SettingsContext";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useOrderListStore } from "@/store/orderStore";

// Restores persisted state after mount (keeps SSR markup identical) and loads the trade profile.
export default function AppProviders({ settings, children }) {
    useEffect(() => {
        useOrderListStore.persist.rehydrate();
        Promise.resolve(useAuthStore.persist.rehydrate()).then(() =>
            useAuthStore.getState().loadProfile()
        );

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
