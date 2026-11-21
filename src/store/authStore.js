"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY, clearAuthCookies, configureSession, setAuthCookie } from "@/api";
import AuthService from "@/services/AuthService";
import AddressService from "@/services/AddressService";
import { trimValues } from "@/lib/formHelpers";

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

            setToken: (token) => {
                setAuthCookie(token);
                set({ token });
            },

            startSession: async (token) => {
                get().setToken(token);
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
                    set({ profile: null, status: "error" });
                    return null;
                }
            },

            saveDetails: async (form) => {
                const { profile } = get();
                if (!profile?.id) throw new Error("Your session has expired. Please log in again.");
                const { businessName, contactName, email, gstin } = trimValues(form, ["businessName", "contactName", "email", "gstin"]);
                await Promise.all([
                    AuthService.updateUser(profile.id, {
                        name: businessName || contactName,
                        email,
                        gstin: gstin.toUpperCase(),
                    }),
                    AddressService.ensureTradeAddress(
                        { ...form, phone: form.phone || profile.phone },
                        profile.address
                    ),
                ]);
                return get().loadProfile();
            },

            logout: () => {
                clearAuthCookies();
                set({ token: null, profile: null, status: "ready" });
            },
        }),
        { name: AUTH_STORAGE_KEY, partialize: (state) => ({ token: state.token }), skipHydration: true }
    )
);

configureSession({
    getToken: () => useAuthStore.getState().token,
    // The API layer has already written the cookie; only the store needs the new token.
    setToken: (token) => useAuthStore.setState({ token }),
    clear: () => useAuthStore.getState().logout(),
});

export const selectIsApproved = (s) => Boolean(s.profile?.isApproved);
export const selectHasDetails = (s) =>
    Boolean(s.profile?.isApproved || s.profile?.businessAccountId || s.profile?.address?.id);

export default useAuthStore;
