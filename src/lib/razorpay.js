"use client";

const SCRIPT_ID = "razorpay-checkout-script"; // same id as the <Script> in app/layout.js
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const TIMEOUT_MS = 5000;

let loading = null;

// Resolves true once window.Razorpay exists. One shared attempt at a time; a failed attempt can be retried.
export function loadRazorpayScript() {
    if (typeof window === "undefined") return Promise.resolve(false);
    if (window.Razorpay) return Promise.resolve(true);
    if (loading) return loading;

    loading = new Promise((resolve) => {
        const done = (ok) => {
            clearInterval(poll);
            clearTimeout(timer);
            if (!ok) console.warn("[Razorpay] SDK could not be loaded.");
            resolve(ok);
        };

        // The layout already injects the script lazily; only add it if it is missing.
        let script = document.getElementById(SCRIPT_ID);
        if (!script) {
            script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.src = SCRIPT_SRC;
            script.async = true;
            document.body.appendChild(script);
        }
        script.addEventListener("error", () => done(false), { once: true });

        // `load` may already have fired for an existing tag, so poll for the global as well.
        const poll = setInterval(() => window.Razorpay && done(true), 100);
        const timer = setTimeout(() => done(Boolean(window.Razorpay)), TIMEOUT_MS);
    }).then((ok) => {
        if (!ok) loading = null;
        return ok;
    });

    return loading;
}
