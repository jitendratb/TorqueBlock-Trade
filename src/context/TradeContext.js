"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TOKEN_KEY, USER_KEY } from "@/lib/api";
import { splitGst } from "@/lib/pricing";
import { submitOrder } from "@/services/tradeService";

const CART_KEY = "tradeOrderList";
const BUSINESS_KEY = "tradeBusiness";

const TradeContext = createContext(null);

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
        // Storage can be unavailable (private mode); everything still works for this session.
    }
}

export function TradeProvider({ children }) {
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [detailsRequest, setDetailsRequest] = useState(null);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    // Hydrate from localStorage after mount so server and client markup match.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of an external store on mount
        setItems(readStorage(CART_KEY, []));
        setUser(readStorage(USER_KEY, null));
        setBusiness(readStorage(BUSINESS_KEY, null));
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (hydrated) writeStorage(CART_KEY, items);
    }, [items, hydrated]);

    const showToast = useCallback((next) => {
        clearTimeout(toastTimer.current);
        setToast(next);
        toastTimer.current = setTimeout(() => setToast(null), 5000);
    }, []);

    const addItem = useCallback(
        (line) => {
            setItems((prev) => {
                const existing = prev.find((i) => i.id === line.id);
                if (existing) return prev.map((i) => (i.id === line.id ? { ...i, quantity: i.quantity + line.quantity } : i));
                return [...prev, line];
            });
            showToast({ type: "info", text: `Added ${line.quantity} × ${line.productName} ${line.size} to your order list` });
        },
        [showToast]
    );

    const updateQuantity = useCallback((id, quantity) => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)));
    }, []);

    const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

    const saveBusiness = useCallback((details) => {
        writeStorage(BUSINESS_KEY, details);
        setBusiness(details);
    }, []);

    // Sends the order with the saved business details. If none are saved yet, asks once,
    // then continues automatically — every later order is a single click.
    const placeOrder = useCallback(
        (lines) =>
            new Promise((resolve, reject) => {
                const send = async (details) => {
                    try {
                        const res = await submitOrder(details, lines);
                        showToast({ type: "success", text: `Order placed (${res.reference}). We'll confirm dispatch on WhatsApp.` });
                        resolve(res);
                    } catch (err) {
                        showToast({ type: "error", text: err.message || "Order failed. Please try again or WhatsApp us." });
                        reject(err);
                    }
                };
                if (business) send(business);
                else setDetailsRequest({ onSave: (details) => { saveBusiness(details); setDetailsRequest(null); send(details); }, onCancel: () => { setDetailsRequest(null); reject(new Error("cancelled")); } });
            }),
        [business, saveBusiness, showToast]
    );

    const placeCartOrder = useCallback(async () => {
        await placeOrder(items);
        setItems([]);
        setCartOpen(false);
    }, [items, placeOrder]);

    const login = useCallback((token, nextUser) => {
        writeStorage(TOKEN_KEY, token);
        writeStorage(USER_KEY, nextUser);
        setUser(nextUser);
    }, []);

    const logout = useCallback(() => {
        writeStorage(TOKEN_KEY, null);
        writeStorage(USER_KEY, null);
        setUser(null);
    }, []);

    const summary = useMemo(() => {
        const total = items.reduce((sum, l) => sum + (l.price || 0) * l.quantity, 0);
        const units = items.reduce((sum, l) => sum + l.quantity, 0);
        return { total, units, ...splitGst(total) };
    }, [items]);

    const value = useMemo(
        () => ({
            items, summary, user, business, isDealer: user?.userType === "dealer",
            addItem, updateQuantity, removeItem, placeOrder, placeCartOrder, saveBusiness, setDetailsRequest,
            login, logout, cartOpen, setCartOpen, loginOpen, setLoginOpen, detailsRequest, toast, setToast,
        }),
        [items, summary, user, business, addItem, updateQuantity, removeItem, placeOrder, placeCartOrder, saveBusiness, login, logout, cartOpen, loginOpen, detailsRequest, toast]
    );

    return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTrade() {
    const ctx = useContext(TradeContext);
    if (!ctx) throw new Error("useTrade must be used inside TradeProvider");
    return ctx;
}
