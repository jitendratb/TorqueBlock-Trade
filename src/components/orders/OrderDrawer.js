"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { Drawer } from "@/ui";
import { splitGst } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useSettings } from "@/components/site/SettingsProvider";
import { BILLING_FIELDS, profileToBilling, validateFields } from "@/forms/AccountForms";
import { useAccountStore, selectCanUseCredit, selectLockedBranch } from "@/store/accountStore";
import { useOrderListStore } from "@/store/orderStore";
import { usePlaceOrder } from "@/hooks/usePlaceOrder";
import ItemsStep from "./ItemsStep";
import BillingStep from "./BillingStep";
import PaymentStep from "./PaymentStep";
import OrderSuccessModal from "./OrderSuccessModal";

const STEP_TITLES = {
    address: ["Billing &", "Address", "Step 2 of 3 · Tax invoicing details", "items"],
    payment: ["Payment", "Method", "Step 3 of 3 · Choose how to pay", "address"],
};

function StepHeader({ step, units, hasItems, onBack }) {
    const config = STEP_TITLES[step];
    if (!config) {
        return (
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                    Order <span className="text-orange-500">List</span>
                </h2>
                {hasItems && (
                    <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-bold text-orange-400">
                        {units} {units === 1 ? "tyre" : "tyres"}
                    </span>
                )}
            </div>
        );
    }
    const [title, accent, subtitle, backTo] = config;
    return (
        <div className="flex items-center gap-2.5">
            <button
                type="button"
                onClick={() => onBack(backTo)}
                aria-label="Back"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
                <FiArrowLeft size={16} />
            </button>
            <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                    {title} <span className="text-orange-500">{accent}</span>
                </h2>
                <p className="text-[10px] font-medium text-zinc-400">{subtitle}</p>
            </div>
        </div>
    );
}

// Checkout: items -> billing & address -> payment (Razorpay or Pay on Credit).
export default function OrderDrawer() {
    const { gstRate } = useSettings();
    const open = useUiStore((s) => s.orderListOpen);
    const setOpen = useUiStore((s) => s.setOrderListOpen);
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
    const [billing, setBilling] = useState(null);
    const [errors, setErrors] = useState({});
    const [paymentChoice, setPaymentChoice] = useState("razorpay");
    const [branchChoice, setBranchChoice] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    useEffect(() => {
        if (open && isApproved) {
            loadTradePrices();
            loadAccount();
        }
    }, [open, isApproved, loadTradePrices, loadAccount]);

    const lines = items.map((item) => ({ ...item, price: tradePrices?.[item.id] ?? null }));
    const total = lines.reduce((sum, l) => sum + (l.price || 0) * l.quantity, 0);
    const units = lines.reduce((sum, l) => sum + l.quantity, 0);
    const totals = { total, ...splitGst(total, gstRate) };

    // Derived, so the choice falls back to Razorpay as soon as credit no longer covers the order.
    const creditUsable = canUseCredit && (account?.availableCredit || 0) >= total;
    const mode = paymentChoice === "credit" && creditUsable ? "credit" : "razorpay";
    // Branches come head office first, which is also the backend's default.
    const branchId = lockedBranch?.id || branchChoice || account?.branches?.[0]?.id || null;
    const currentStep = items.length ? step : "items";

    const goToBilling = () => {
        if (!ensureCanOrder()) return;
        // First visit: start from the saved profile; later visits keep what was typed.
        setBilling((current) => current || profileToBilling(profile, account));
        setStep("address");
    };

    const goToPayment = () => {
        const found = validateFields(BILLING_FIELDS, billing);
        setErrors(found);
        if (Object.keys(found).length) {
            notify("error", "Please fix the highlighted billing details.");
            return;
        }
        setStep("payment");
    };

    const onBillingChange = (name, value) => {
        setBilling((b) => ({ ...b, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const pay = async () => {
        const isCredit = mode === "credit";
        setSending(true);
        const order = await placeOrder(lines, billing, isCredit ? "Pay on Credit" : "Razorpay", branchId);
        setSending(false);
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
        setOpen(false);

        // Checkout may have saved a new billing address, and credit was charged — re-read both.
        loadProfile();
        refreshAccount();
    };

    const close = () => setOpen(false);

    return (
        <>
            <Drawer
                open={open}
                onClose={close}
                label="Order list"
                className="max-w-lg bg-[#10141D]"
                header={<StepHeader step={currentStep} units={units} hasItems={items.length > 0} onBack={setStep} />}
            >
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-500">
                            <IoCartOutline className="text-4xl" />
                        </div>
                        <p className="text-lg font-black text-white">No tyres selected yet</p>
                        <p className="max-w-xs text-sm text-zinc-400">Browse the wholesale catalog and use the cart or order button to add tyre sizes into your bulk batch.</p>
                    </div>
                ) : currentStep === "items" ? (
                    <ItemsStep
                        lines={lines}
                        units={units}
                        totals={totals}
                        gstRate={gstRate}
                        isApproved={isApproved}
                        billing={billing || profileToBilling(profile, account)}
                        onRemove={remove}
                        onQuantity={setQuantity}
                        onNext={goToBilling}
                    />
                ) : currentStep === "address" ? (
                    <BillingStep
                        values={billing}
                        errors={errors}
                        onChange={onBillingChange}
                        units={units}
                        total={total}
                        onBack={() => setStep("items")}
                        onNext={goToPayment}
                        onClose={close}
                    />
                ) : (
                    <PaymentStep
                        billing={billing}
                        units={units}
                        totals={totals}
                        gstRate={gstRate}
                        mode={mode}
                        onMode={setPaymentChoice}
                        creditUsable={creditUsable}
                        account={account}
                        branchId={branchId}
                        onBranch={setBranchChoice}
                        lockedBranch={lockedBranch}
                        sending={sending}
                        onPay={pay}
                        onBack={() => setStep("address")}
                    />
                )}
            </Drawer>

            <OrderSuccessModal open={Boolean(confirmedOrder)} onClose={() => setConfirmedOrder(null)} order={confirmedOrder} />
        </>
    );
}
