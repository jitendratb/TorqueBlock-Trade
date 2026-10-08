"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { GSTIN_PATTERN, submitDealerApplication } from "@/services/tradeService";

const BUSINESS_TYPES = ["Tyre Dealer", "Workshop / Garage", "Authorised Service Centre", "Rental / Fleet", "Race Team / Track Day", "Distributor"];

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500";
const labelClass = "mb-1.5 block text-[11px] font-black uppercase tracking-widest text-zinc-400";

const EMPTY = { businessName: "", contactName: "", phone: "", email: "", gstin: "", city: "", businessType: BUSINESS_TYPES[0], notes: "" };

export default function DealerForm() {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle");

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const gstin = form.gstin.trim().toUpperCase();
        if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
        if (!GSTIN_PATTERN.test(gstin)) return setError("Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5).");

        setStatus("sending");
        try {
            await submitDealerApplication({ ...form, gstin });
            setStatus("done");
        } catch (err) {
            setError(err.message || "Could not submit. Please try again or WhatsApp us.");
            setStatus("idle");
        }
    };

    if (status === "done") {
        return (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                <FiCheckCircle className="text-6xl text-green-500" />
                <h2 className="text-2xl font-black text-white">Application received</h2>
                <p className="max-w-sm text-sm text-zinc-400">
                    We will verify your GSTIN and activate your dealer login. You can already check stock and place orders.
                </p>
                <Link href="/#stock" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600">
                    Check Stock <FiArrowRight />
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="businessName">Business / Firm name</label>
                    <input id="businessName" required className={inputClass} value={form.businessName} onChange={set("businessName")} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="contactName">Contact person</label>
                    <input id="contactName" required className={inputClass} value={form.contactName} onChange={set("contactName")} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="phone">Mobile (WhatsApp)</label>
                    <input id="phone" required inputMode="numeric" maxLength={10} className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="gstin">GSTIN</label>
                    <input id="gstin" required maxLength={15} className={`${inputClass} uppercase`} placeholder="29ABCDE1234F1Z5" value={form.gstin} onChange={set("gstin")} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="email">Email (optional)</label>
                    <input id="email" type="email" className={inputClass} value={form.email} onChange={set("email")} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="city">City</label>
                    <input id="city" required className={inputClass} value={form.city} onChange={set("city")} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="businessType">Business type</label>
                    <select id="businessType" className={`${inputClass} bg-[#111827]`} value={form.businessType} onChange={set("businessType")}>
                        {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

            <button disabled={status === "sending"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 disabled:opacity-60">
                {status === "sending" ? "Submitting…" : "Register as Dealer"} <FiArrowRight />
            </button>
            <p className="text-center text-[11px] text-zinc-500">Your details are used only to verify your dealer account.</p>
        </form>
    );
}
