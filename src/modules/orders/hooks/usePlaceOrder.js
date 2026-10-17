"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSettings } from "@/modules/site/SettingsProvider";
import { createOrder, verifyOrderPayment } from "../orders.api";
import { loadRazorpayScript } from "@/lib/razorpay";

const shortId = (id = "") => String(id).slice(-6).toUpperCase();

// Places a real backend order in one call with Razorpay payment integration:
// 1. Checks dealer login & billing address
// 2. Initiates backend order & Razorpay order
// 3. Opens Razorpay checkout modal
// 4. Verifies payment signature and deducts inventory
export function usePlaceOrder() {
    const router = useRouter();
    const { orderPaymentMethod } = useSettings();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    // Only approved dealers order (the backend would otherwise charge retail prices).
    const ensureCanOrder = useCallback(() => {
        if (!token) {
            openLogin();
            return false;
        }
        if (!profile) {
            notify("info", "Loading your account, please try again in a moment.");
            return false;
        }
        if (profile.isDealer) return true;

        if (profile.dealerStatus === "pending") {
            notify("info", "Your dealer application is under review. Ordering unlocks as soon as it is approved.");
        } else if (profile.dealerStatus === "suspended") {
            notify("error", "Your dealer account is suspended. Please contact our team on WhatsApp.");
        } else {
            notify("info", "Complete your dealer registration to unlock dealer prices and ordering.");
            setOrderListOpen(false);
            router.push("/register");
        }
        return false;
    }, [token, profile, notify, openLogin, setOrderListOpen, router]);

    const placeOrder = useCallback(
        async (lines, billingAddress = null, paymentMethod = "Razorpay", branchCode = "MAIN") => {
            if (!lines.length || !ensureCanOrder()) return null;

            const addressId = profile?.address?.id || profile?.address?._id || profile?.billingAddressId;
            const isRazorpay = paymentMethod.toLowerCase() === "razorpay";
            const isCredit = paymentMethod.toLowerCase() === "credit" || paymentMethod.toLowerCase().includes("credit");

            try {
                // Step 1: Create order on backend (prices computed by backend with dealer rates)
                const res = await createOrder({
                    paymentMethod: isCredit ? "Pay on Credit" : "Razorpay",
                    addressId,
                    billingAddress,
                    branchCode,
                    lines
                });

                const orderData = res.data?.data || res.data || res;
                const razorpayOrder = res.razorpayOrder || res.data?.razorpayOrder;
                const razorpayKey = res.razorpayKey || res.data?.razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY;

                // If Credit payment method: order is already approved & confirmed on credit terms
                if (isCredit) {
                    notify("success", `Trade Order #${shortId(orderData?._id)} placed on business credit.`);
                    return {
                        ...orderData,
                        confirmed: true,
                        paymentMethod: "Pay on Credit",
                        paymentId: `CREDIT-${shortId(orderData?._id)}`,
                        paidAmount: orderData.paidAmount || (lines.reduce((s, l) => s + (l.price || 0) * l.quantity, 0)),
                        billingAddress: billingAddress || profile?.address,
                        items: lines
                    };
                }

                // Step 2: If Razorpay payment method, open Razorpay Checkout modal
                if (isRazorpay) {
                    if (!razorpayOrder?.id || !razorpayKey) {
                        console.error("Razorpay order details missing from response:", res);
                        notify("error", "Unable to start Razorpay payment session. Please try again.");
                        return orderData;
                    }

                    const sdkLoaded = await loadRazorpayScript();
                    if (!sdkLoaded || typeof window === "undefined" || !window.Razorpay) {
                        notify("error", "Failed to load Razorpay payment gateway. Please check your internet connection.");
                        return orderData;
                    }

                    return new Promise((resolve) => {
                        const prefillName = billingAddress?.businessName || billingAddress?.contactName || profile?.contactName || profile?.businessName || profile?.name || "";
                        const prefillEmail = billingAddress?.email || profile?.email || "";
                        const prefillPhone = billingAddress?.phone || profile?.phone || "";

                        const options = {
                            key: razorpayKey,
                            amount: razorpayOrder.amount,
                            currency: razorpayOrder.currency || "INR",
                            name: "Torque Block Trade",
                            description: `B2B Order #${shortId(orderData?._id)}`,
                            order_id: razorpayOrder.id,
                            prefill: {
                                name: prefillName,
                                email: prefillEmail,
                                contact: prefillPhone,
                            },
                            theme: {
                                color: "#f97316",
                            },
                            handler: async function (response) {
                                try {
                                    // Step 3: Verify payment signature on backend
                                    const verifyRes = await verifyOrderPayment({
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature,
                                    });

                                    const confirmedData = verifyRes.data?.data || verifyRes.data || orderData;
                                    resolve({
                                        ...orderData,
                                        ...confirmedData,
                                        _id: confirmedData._id || orderData._id,
                                        confirmed: true,
                                        paymentId: response.razorpay_payment_id,
                                        paidAmount: confirmedData.paidAmount || orderData.paidAmount || (razorpayOrder.amount ? razorpayOrder.amount / 100 : 0),
                                        billingAddress: billingAddress || confirmedData?.items?.[0]?.address || profile?.address,
                                        items: lines
                                    });
                                } catch (verifyErr) {
                                    console.error("Payment verification failed:", verifyErr);
                                    notify("error", verifyErr.message || "Payment verification failed. Please contact support.");
                                    resolve(orderData);
                                }
                            },
                            modal: {
                                ondismiss: function () {
                                    notify("info", `Payment cancelled. Order #${shortId(orderData?._id)} remains pending.`);
                                    resolve(null);
                                },
                            },
                        };

                        const rzp = new window.Razorpay(options);
                        rzp.on("payment.failed", function (failResp) {
                            console.error("Razorpay payment failed:", failResp.error);
                            notify("error", failResp.error?.description || "Payment failed. Please try again.");
                        });
                        rzp.open();
                    });
                }

                // If non-razorpay payment (e.g. Bank Transfer)
                notify("success", `Order #${shortId(orderData?._id)} placed. We'll share the proforma invoice on WhatsApp.`);
                return {
                    ...orderData,
                    confirmed: true,
                    billingAddress: billingAddress || profile?.address,
                    items: lines
                };
            } catch (err) {
                notify("error", err.message || "Order failed. Please try again.");
                return null;
            }
        },
        [ensureCanOrder, profile, notify]
    );

    return { placeOrder, ensureCanOrder };
}
