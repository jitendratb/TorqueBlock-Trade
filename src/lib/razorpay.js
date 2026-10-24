"use client";

export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if (window.Razorpay) return resolve(true);

        const checkReady = (attemptsLeft = 50) => {
            if (window.Razorpay) {
                return resolve(true);
            }
            if (attemptsLeft <= 0) {
                console.warn("[Razorpay] SDK failed to load within timeout period.");
                return resolve(false);
            }
            setTimeout(() => checkReady(attemptsLeft - 1), 100);
        };

        const existingScript = document.getElementById("razorpay-checkout-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
            existingScript.addEventListener("error", () => resolve(false));
            return checkReady(50);
        }

        const script = document.createElement("script");
        script.id = "razorpay-checkout-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(Boolean(window.Razorpay));
        script.onerror = () => {
            console.error("[Razorpay] Failed to load Razorpay SDK script from CDN");
            resolve(false);
        };
        document.body.appendChild(script);

        checkReady(50);
    });
};
