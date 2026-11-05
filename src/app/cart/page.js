"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoCartOutline } from "react-icons/io5";
import { splitGst } from "@/lib/format";
import { useAuthStore, selectIsApproved } from "@/store/authStore";
import { useCatalogStore } from "@/store/catalogStore";
import { useSettings } from "@/components/site/SettingsProvider";
import { BILLING_FIELDS, profileToBilling, validateFields } from "@/forms/AccountForms";
import { useAccountStore, selectCanUseCredit, selectLockedBranch } from "@/store/accountStore";
import { useOrderListStore } from "@/store/orderStore";
import { usePlaceOrder } from "@/hooks/usePlaceOrder";
import { useUiStore } from "@/store/ui.store";
import ItemsStep from "@/components/orders/ItemsStep";
import BillingStep from "@/components/orders/BillingStep";
import PaymentStep from "@/components/orders/PaymentStep";
import OrderSuccessModal from "@/components/orders/OrderSuccessModal";

export default function CartPage() {
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
    const [billing, setBilling] = useState(null);
    const [errors, setErrors] = useState({});
    const [paymentChoice, setPaymentChoice] = useState("razorpay");
    const [branchChoice, setBranchChoice] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    useEffect(() => {
        if (isApproved) {
            loadTradePrices();
            loadAccount();
        }
    }, [isApproved, loadTradePrices, loadAccount]);

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

        loadProfile();
        refreshAccount();
    };

    return (
        <main className="relative min-h-[calc(100vh-120px)] py-12 px-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-[0.08em] uppercase text-white">
                            ORDER CART
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                            Review tyre batch, commercial billing &amp; dispatch terms
                        </p>
                    </div>
                    {items.length > 0 && (
                        <span className="inline-flex items-center rounded-full border border-[#A35229]/40 bg-[#A35229]/20 px-3 py-1 text-xs font-bold text-[#F59E0B]">
                            {units} {units === 1 ? "tyre" : "tyres"}
                        </span>
                    )}
                </div>

                {/* Card Container (Matches Screenshot Design Language) */}
                <div className="rounded-2xl sm:rounded-3xl bg-[#22262E]/95 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden flex flex-col min-h-[460px]">
                    {items.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center my-auto">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#2D323B] text-zinc-400">
                                <IoCartOutline className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wider text-white">NO TYRES IN CART</h2>
                                <p className="max-w-xs mt-1.5 text-xs text-zinc-400">Browse the wholesale catalog and use the order button to add tyre sizes into your bulk batch.</p>
                            </div>
                            <Link
                                href="/#stock"
                                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] py-3 px-6 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all shadow-md shadow-[#A35229]/25"
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
                            onClose={() => setStep("items")}
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
                </div>
            </div>

            <OrderSuccessModal open={Boolean(confirmedOrder)} onClose={() => setConfirmedOrder(null)} order={confirmedOrder} />
        </main>
    );
}

