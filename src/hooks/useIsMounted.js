"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to determine whether component is mounted on the client.
 * Returns false during SSR and true immediately upon client hydration.
 * Uses useSyncExternalStore to avoid cascading render lint errors.
 */
export default function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}

