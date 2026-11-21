"use client";

import { useEffect, useState } from "react";
import { fetchProductFamily } from "@/services/CatalogService";

export function useProductFamily(identifier, { enabled = true } = {}) {
    const [state, setState] = useState({ identifier: null, data: null });

    useEffect(() => {
        if (!identifier || !enabled) return;
        let mounted = true;
        fetchProductFamily(identifier).then((family) => {
            if (!mounted || !family) return;
            setState({ identifier, data: family });
        });
        return () => {
            mounted = false;
        };
    }, [identifier, enabled]);

    return state.identifier === identifier ? state.data : null;
}

export default useProductFamily;

