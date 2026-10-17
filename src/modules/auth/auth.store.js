"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { configureSession } from "@/api/http";
import { fetchProfile } from "./auth.api";

// Session state. Only the token is persisted; the profile is always re-read from the backend.
export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            profile: null,
            status: "idle", // idle | loading | ready

            setToken: (token) => set({ token }),

            startSession: async (token) => {
                set({ token });
                return get().loadProfile();
            },

            loadProfile: async () => {
                if (!get().token) {
                    set({ profile: null, status: "ready" });
                    return null;
                }
                set({ status: "loading" });
                try {
                    const profile = await fetchProfile();
                    set({ profile, status: "ready" });
                    return profile;
                } catch {
                    const fallbackProfile = {
                        businessName: "",
                        dealerStatus: "none",
                        isDealer: false,
                        address: null,
                    };
                    set({ profile: fallbackProfile, status: "ready" });
                    return fallbackProfile;
                }
            },

            setProfile: (profile) => set({ profile }),
            logout: () => set({ token: null, profile: null, status: "ready" }),
        }),
        // Rehydrated after mount (AppProviders) so server and client markup match.
        { name: "trade-auth", partialize: (state) => ({ token: state.token }), skipHydration: true }
    )
);

configureSession({
    getToken: () => useAuthStore.getState().token,
    setToken: (token) => useAuthStore.getState().setToken(token),
    clear: () => useAuthStore.getState().logout(),
});

// Derived flags used across modules.
export const selectIsLoggedIn = (s) => Boolean(s.token);
export const selectIsDealer = (s) => Boolean(s.profile?.isDealer);
export const selectDealerStatus = (s) => s.profile?.dealerStatus || (s.token ? "none" : "guest");
