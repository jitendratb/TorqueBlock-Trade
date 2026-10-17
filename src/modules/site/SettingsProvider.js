"use client";

import { createContext, useContext } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ settings, children }) {
    return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const settings = useContext(SettingsContext);
    if (!settings) throw new Error("useSettings must be used inside SettingsProvider");
    return settings;
}
