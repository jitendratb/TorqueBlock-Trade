"use client";

import { useEffect, useState } from "react";
import { BILLING_FIELDS } from "@/constants/forms";
import { useSettings } from "@/context/SettingsContext";
import { splitGst } from "@/lib/format";
import { profileToBilling } from "@/lib/formHelpers";
import { useAccountStore, selectCanUseCredit, selectLockedBranch } from "@/store/accountStore";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/uiStore";
import useForm from "./useForm";
import { usePlaceOrder } from "./usePlaceOrder";

export function useCheckout({ active = true, onOrderComplete } = {}) {
    const { gstRate } = useSettings();
    const notify = useUiStore((s) => s.notify);

    const { items, setQuantity, remove, clear } = useOrderListStore();
    const isApproved = useAuthStore(selectIsApproved);
    const profile = useAuthStore((s) => s.profile);
    const loadProfile = useAuthStore((s) => s.loadProfile);
    const tradePrices = useCatalogStore((s) => s.tradePrices);
    const loadTradePrices = useCatalogStore((s) => s.loadTradePrices);

    const account = useAccountStore((s) => s.account);
    const loadAccount = useAccountStore((s) => s.loadAccount);
    const refreshAccount = useAccountStore((s) => s.refresh);
    const canUseCredit = useAccountStore(selectCanUseCredit);
    const lockedBranch = useAccountStore(selectLockedBranch);

    const { placeOrder, ensureCanOrder } = usePlaceOrder();

    const [step, setStep] = useState("items");
    // Billing starts empty and is filled from the profile when the user reaches the address step.
    const { values: billing, setValues: setBilling, errors, onChange: onBillingChange, validate } = useForm(null);
    const [paymentChoice, setPaymentChoice] = useState("razorpay");
    const [branchChoice, setBranchChoice] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    useEffect(() => {
        if (active && isApproved) {
            loadTradePrices();
            loadAccount();
        }
    }, [active, isApproved, loadTradePrices, loadAccount]);

    const lines = items.map((item) => ({ ...item, price: tradePrices?.[item.id] ?? null }));
    const total = lines.reduce((sum, l) => sum + (l.price || 0) * l.quantity, 0);
    const units = lines.reduce((sum, l) => sum + l.quantity, 0);
    const totals = { total, ...splitGst(total, gstRate) };

    const creditUsable = canUseCredit && (account?.availableCredit || 0) >= total;
    const mode = paymentChoice === "credit" && creditUsable ? "credit" : "razorpay";
    const branchId = lockedBranch?.id || branchChoice || account?.branches?.[0]?.id || null;
    const currentStep = items.length ? step : "items";

    const goToBilling = () => {
        if (!ensureCanOrder()) return;
        setBilling((current) => current || profileToBilling(profile, account));
        setStep("address");
    };

    const goToPayment = () => {
        if (!validate(BILLING_FIELDS)) {
            notify("error", "Please fix the highlighted billing details.");
            return;
        }
        setStep("payment");
    };

    const pay = async () => {
        if (sending) return;
        const isCredit = mode === "credit";
        setSending(true);
        let order;
        try {
            order = await placeOrder(lines, billing, isCredit ? "Pay on Credit" : "Razorpay", branchId);
        } finally {
            setSending(false);
        }
        if (!order?.confirmed) return;

        setConfirmedOrder({
            ...order,
            paymentMethod: isCredit ? "Pay on Credit" : "Razorpay",
            creditDays: account?.creditDays,
            paidAmount: order.paidAmount || total,
            billingAddress: billing,
            items: lines,
        });
        clear();
        setStep("items");
        setBilling(null);
        onOrderComplete?.();

        loadProfile();
        refreshAccount();
    };

    return {
        items,
        lines,
        total,
        units,
        totals,
        gstRate,
        isApproved,
        account,
        defaultBilling: billing || profileToBilling(profile, account),
        billing,
        errors,
        step,
        currentStep,
        setStep,
        mode,
        setPaymentChoice,
        creditUsable,
        branchId,
        setBranchChoice,
        lockedBranch,
        sending,
        confirmedOrder,
        clearConfirmedOrder: () => setConfirmedOrder(null),
        setQuantity,
        remove,
        goToBilling,
        goToPayment,
        onBillingChange,
        pay,
    };
}

export default useCheckout;

