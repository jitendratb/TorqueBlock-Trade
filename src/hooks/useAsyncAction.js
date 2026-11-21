"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_ERROR = "Something went wrong. Please try again.";
const NO_ERROR = { message: "", code: "" };


export default function useAsyncAction() {
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState(NO_ERROR);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const setError = useCallback((message = "", code = "") => setState({ message, code }), []);

    const run = useCallback(async (task, { fallback = FALLBACK_ERROR, onSuccess, onError } = {}) => {
        setState(NO_ERROR);
        setBusy(true);
        try {
            const result = await task();
            await onSuccess?.(result);
            return result;
        } catch (err) {
            const message = err?.message || fallback;
            if (mounted.current) setState({ message, code: err?.code || "" });
            onError?.(message, err);
            return undefined;
        } finally {
            if (mounted.current) setBusy(false);
        }
    }, []);

    return { run, busy, error: state.message, errorCode: state.code, setError };
}
