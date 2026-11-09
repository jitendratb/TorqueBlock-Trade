"use client";

import { FiMapPin } from "react-icons/fi";
import Link from "next/link";
import { FormFields } from "@/ui";
import { formatINR } from "@/lib/format";
import { BILLING_FIELDS } from "@/forms/AccountForms";

// Step 2 — Billing & delivery details used for the GST invoice.
export default function BillingStep({ values, errors, onChange, units, total, onBack, onNext, onClose }) {
    return (
        <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto px-4 sm:px-5 py-4">
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs text-zinc-300">
                    <p className="flex items-center gap-1.5 font-bold text-orange-400">
                        <FiMapPin /> Wholesale Delivery &amp; Invoicing
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        We generate the GST tax invoice with these details and save them as your billing address.{" "}
                        <Link href="/account" onClick={onClose} className="font-bold text-orange-400 hover:text-orange-300 transition-colors">
                            Edit full profile →
                        </Link>
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                    <FormFields fields={BILLING_FIELDS} values={values} errors={errors} onChange={onChange} idPrefix="billing-" />
                </div>
            </div>

            <footer className="space-y-3.5 border-t border-white/10 bg-black/40 backdrop-blur-xl px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{units} tyres selected</span>
                    <span className="text-sm sm:text-base font-black text-white">
                        Total: <span className="text-orange-400">{formatINR(total)}</span>
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-black uppercase tracking-[0.08em] text-white transition-all shadow-lg shadow-orange-500/25"
                >
                    <span>CONTINUE TO PAYMENT</span>
                    <span className="text-base leading-none">→</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                    <button type="button" onClick={onBack} className="transition-colors hover:text-white">
                        ← Back to Review Items
                    </button>
                    <span>Step 2 of 3</span>
                </div>
            </footer>
        </>
    );
}
