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
                <div className="rounded-2xl border border-[#A35229]/30 bg-[#A35229]/10 p-3.5 text-xs text-zinc-300">
                    <p className="flex items-center gap-1.5 font-bold text-[#F59E0B]">
                        <FiMapPin /> Wholesale Delivery &amp; Invoicing
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                        We generate the GST tax invoice with these details and save them as your billing address.{" "}
                        <Link href="/account" onClick={onClose} className="font-bold text-[#F59E0B] hover:text-amber-300 transition-colors">
                            Edit full profile →
                        </Link>
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#2D323B] p-4">
                    <FormFields fields={BILLING_FIELDS} values={values} errors={errors} onChange={onChange} idPrefix="billing-" />
                </div>
            </div>

            <footer className="space-y-3.5 border-t border-white/10 bg-[#1B1E25] px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{units} tyres selected</span>
                    <span className="text-sm sm:text-base font-black text-white">
                        Total: <span className="text-[#F59E0B]">{formatINR(total)}</span>
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A35229] hover:bg-[#8F4420] active:scale-[0.99] py-3.5 px-4 text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all shadow-lg shadow-[#A35229]/25"
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
