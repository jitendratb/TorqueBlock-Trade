"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import { ensureTradeAddress } from "@/services/AddressService";
import { createOrder, verifyOrderPayment } from "@/services/OrderService";
import { loadRazorpayScript } from "@/lib/razorpay";

const shortId = (id = "") => String(id).slice(-6).toUpperCase();

export function usePlaceOrder() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const ensureCanOrder = useCallback(() => {
        if (!token) {
            openLogin();
            return false;
        }
        if (!profile) {
            notify("info", "Loading your account, please try again in a moment.");
            return false;
        }
        if (profile.isApproved) return true;

        if (profile.address?.id) {
            notify("info", "Your trade account is awaiting activation. Ordering unlocks as soon as our team approves it.");
        } else {
            notify("info", "Complete your trade registration to unlock trade prices and ordering.");
            setOrderListOpen(false);
            router.push("/register");
        }
        return false;
    }, [token, profile, notify, openLogin, setOrderListOpen, router]);

    const placeOrder = useCallback(
        async (lines, billing, paymentMethod = "Razorpay", branchId = null) => {
            if (!lines.length || !ensureCanOrder()) return null;

            const isCredit = paymentMethod.toLowerCase().includes("credit");

            try {
                const address = await ensureTradeAddress(billing, profile.address);
                const res = await createOrder({
                    paymentMethod: isCredit ? "Pay on Credit" : "Razorpay",
                    addressId: address.id,
                    branchId,
                    lines,
                });

                const orderData = res.data;
                const razorpayOrder = res.razorpayOrder;
                const razorpayKey = res.razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY;

                if (isCredit) {
                    notify("success", `Trade Order #${shortId(orderData?._id)} placed on business credit.`);
                    return {
                        ...orderData,
                        confirmed: true,
                        paymentMethod: "Pay on Credit",
                        paymentId: `CREDIT-${shortId(orderData?._id)}`,
                        billingAddress: billing,
                        items: lines,
                    };
                }

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
                    const options = {
                        key: razorpayKey,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency || "INR",
                        name: "Torque Block Trade",
                        description: `Trade Order #${shortId(orderData?._id)}`,
                        order_id: razorpayOrder.id,
                        prefill: {
                            name: billing.businessName || billing.contactName || profile.name || "",
                            email: billing.email || profile.email || "",
                            contact: billing.phone || profile.phone || "",
                        },
                        theme: {
                            color: "#f97316",
                        },
                        handler: async function (response) {
                            try {
                                const verifyRes = await verifyOrderPayment({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                });

                                const confirmedData = verifyRes.data || orderData;
                                resolve({
                                    ...orderData,
                                    ...confirmedData,
                                    _id: confirmedData._id || orderData._id,
                                    confirmed: true,
                                    paymentId: response.razorpay_payment_id,
                                    paidAmount: confirmedData.paidAmount || orderData.paidAmount || (razorpayOrder.amount ? razorpayOrder.amount / 100 : 0),
                                    billingAddress: billing,
                                    items: lines,
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
            } catch (err) {
                notify("error", err.message || "Order failed. Please try again.");
                return null;
            }
        },
        [ensureCanOrder, profile, notify]
    );

    return { placeOrder, ensureCanOrder };
}

export default usePlaceOrder;
