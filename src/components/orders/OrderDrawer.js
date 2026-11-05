"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    address: ["Billing &", "Address", "Step 2 of 3 · Invoicing details", "items"],
    payment: ["Payment", "Method", "Step 3 of 3 · Choose how to pay", "address"],
};

function StepHeader({ step, units, hasItems, onBack }) {
    const config = STEP_TITLES[step];
    if (!config) {
        return (
            <div className="flex items-center gap-2.5">
                <div>
                    <h2 className="text-sm sm:text-base font-black tracking-[0.08em] uppercase text-white">
                        ORDER CART
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                        Review tyre batch & wholesale invoice
                    </p>
                </div>
                {hasItems && (
                    <span className="inline-flex items-center rounded-full border border-[#A35229]/40 bg-[#A35229]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#F59E0B]">
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
            >
                <FiArrowLeft size={16} />
            </button>
            <div>
                <h2 className="text-sm sm:text-base font-black tracking-[0.08em] uppercase text-white">
                    {title} <span className="text-[#A35229]">{accent}</span>
                </h2>
                <p className="text-[11px] text-zinc-400">{subtitle}</p>
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
                className="w-full max-w-full sm:max-w-md md:max-w-lg bg-[#22262E] text-white border-l border-white/10"
                header={<StepHeader step={currentStep} units={units} hasItems={items.length > 0} onBack={setStep} />}
            >
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#2D323B] text-zinc-400">
                            <IoCartOutline className="text-3xl" />
                        </div>
                        <div>
                            <p className="text-base font-bold uppercase tracking-wider text-white">NO TYRES IN CART</p>
                            <p className="max-w-xs mt-1 text-xs text-zinc-400">Browse the wholesale catalog and add tyre sizes into your bulk batch.</p>
                        </div>
                        <Link
                            href="/#stock"
                            onClick={close}
                            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] py-3 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all shadow-md shadow-[#A35229]/25"
                        >
                            <span>BROWSE TYRE STOCK</span>
                            <span>→</span>
                        </Link>
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
