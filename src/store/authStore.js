"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthCookies, configureSession } from "@/api/http";
import AuthService from "@/services/AuthService";
import AddressService from "@/services/AddressService";

// The access token is a JWT whose payload carries the user id (backend utils/auth.helper.js).
const userIdFromToken = (token) => {
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload)).userId || null;
    } catch {
        return null;
    }
};

// Session state. Only the token is persisted; the profile is always re-read from the backend.
export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            profile: null,
            status: "idle", // idle | loading | ready | error

            setToken: (token) => set({ token }),

            startSession: async (token) => {
                set({ token });
                return get().loadProfile();
            },

            loadProfile: async () => {
                const userId = get().token && userIdFromToken(get().token);
                if (!userId) {
                    set({ token: null, profile: null, status: "ready" });
                    return null;
                }
                set({ status: "loading" });
                try {
                    const profile = await AuthService.fetchProfile(userId);
                    set({ profile, status: "ready" });
                    return profile;
                } catch {
                    // The account and registration pages show a retry for this state.
                    set({ profile: null, status: "error" });
                    return null;
                }
            },

            // Registration and the profile editor: contact details go on the login (PUT /auth/:id),
            // the business name and shop address into the address book. Trade approval stays with an admin.
            saveDetails: async (form) => {
                const { profile } = get();
                await Promise.all([
                    AuthService.updateUser(profile.id, {
                        name: form.contactName.trim(),
                        email: form.email.trim(),
                        gstin: form.gstin.trim().toUpperCase(),
                    }),
                    AddressService.ensureTradeAddress({ ...form, phone: form.phone || profile.phone }, profile.address),
                ]);
                return get().loadProfile();
            },

            logout: () => {
                clearAuthCookies();
                set({ token: null, profile: null, status: "ready" });
            },
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
export const selectIsApproved = (s) => Boolean(s.profile?.isApproved);
// Business details were saved (registration done), whether or not an admin has approved them yet.
export const selectHasDetails = (s) => Boolean(s.profile?.isApproved || s.profile?.address?.id);

export default useAuthStore;
