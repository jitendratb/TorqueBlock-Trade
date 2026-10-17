"use client";

import { create } from "zustand";

let toastTimer;

// Global UI state: which overlay is open and the current toast.
export const useUiStore = create((set) => ({
    loginOpen: false,
    orderListOpen: false,
    menuOpen: false,
    toast: null,

    openLogin: () => set({ loginOpen: true, menuOpen: false }),
    closeLogin: () => set({ loginOpen: false }),
    setOrderListOpen: (orderListOpen) => set({ orderListOpen, menuOpen: false }),
    setMenuOpen: (menuOpen) => set({ menuOpen }),

    notify: (type, text) => {
        clearTimeout(toastTimer);
        set({ toast: { type, text, id: Date.now() } });
        toastTimer = setTimeout(() => set({ toast: null }), 5000);
    },
    dismissToast: () => set({ toast: null }),
}));
