"use client";

import { useState } from "react";
import { FiCheckCircle, FiClock, FiEdit2, FiXCircle } from "react-icons/fi";
import Button from "@/ui/Button";
import { useAuthStore } from "@/modules/auth/auth.store";
import OtpForm from "@/modules/auth/components/OtpForm";
import DealerForm from "./DealerForm";

const STEPS = ["Verify mobile", "Business details"];

const STATUS_VIEW = {
    approved: { Icon: FiCheckCircle, tone: "text-green-500", title: "Dealer Account Active", text: "Dealer prices and instant ordering are live across all tyre stock." },
    pending: { Icon: FiClock, tone: "text-sky-400", title: "Application Under Review", text: "Our team is verifying your business details. Dealer prices and ordering unlock once approved." },
    suspended: { Icon: FiXCircle, tone: "text-red-500", title: "Account Suspended", text: "Please contact our team on WhatsApp to reactivate your dealer account." },
    rejected: { Icon: FiXCircle, tone: "text-red-500", title: "Please check your details", text: "Please review your business details or contact us on WhatsApp." },
};

function Stepper({ current }) {
    return (
        <ol className="mb-6 grid grid-cols-2 gap-2">
            {STEPS.map((label, i) => (
                <li key={label} className={`rounded-xl border px-3 py-2 text-center text-[11px] font-black uppercase tracking-wider ${i <= current ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/10 text-zinc-500"}`}>
                    {i + 1}. {label}
                </li>
            ))}
        </ol>
    );
}

function StatusPanel({ profile, onEdit }) {
    const view = STATUS_VIEW[profile.dealerStatus] || STATUS_VIEW.approved;
    const { Icon } = view;
    return (
        <div className="space-y-5 text-center">
            <Icon className={`mx-auto text-6xl ${view.tone}`} />
            <div>
                <h2 className="text-2xl font-black text-white">{view.title}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{view.text}</p>
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm sm:grid-cols-2">
                {[
                    ["Business", profile.businessName],
                    ["Type", profile.businessType],
                    ["GSTIN", profile.gstin],
                    ["City", profile.address && `${profile.address.city}, ${profile.address.state}`],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</dt>
                        <dd className="font-semibold text-white">{value || "—"}</dd>
                    </div>
                ))}
            </dl>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/#stock">Check Stock</Button>
                <Button href="/orders" variant="outline">My Orders</Button>
                {/* Approved dealers edit their profile in My Account; others resubmit the application. */}
                {profile.dealerStatus === "approved" ? (
                    <Button href="/account" variant="ghost">
                        <FiEdit2 /> Edit Profile
                    </Button>
                ) : (
                    <Button variant="ghost" onClick={onEdit}>
                        <FiEdit2 /> Edit Details
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function DealerRegistration() {
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const status = useAuthStore((s) => s.status);
    const [editing, setEditing] = useState(false);

    const card = "rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-md";

    if (!token) {
        return (
            <div className={card}>
                <Stepper current={0} />
                <h2 className="mb-1 text-xl font-black text-white">Verify your mobile number</h2>
                <p className="mb-5 text-sm text-zinc-400">We&apos;ll send a one-time password on WhatsApp. This number becomes your dealer login.</p>
                <OtpForm />
            </div>
        );
    }

    if (!profile) {
        return <div className={`${card} h-64 animate-pulse`} aria-label={status === "loading" ? "Loading your account" : "Account unavailable"} />;
    }

    const showForm = editing || !profile.businessName || profile.dealerStatus === "none";

    return (
        <div className={card}>
            {showForm && <Stepper current={1} />}
            {showForm ? (
                <>
                    <h2 className="mb-1 text-xl font-black text-white">Business details</h2>
                    <p className="mb-5 text-sm text-zinc-400">Used for your GST invoice and delivery.</p>
                    <DealerForm onSaved={() => setEditing(false)} />
                </>
            ) : (
                <StatusPanel profile={profile} onEdit={() => setEditing(true)} />
            )}
        </div>
    );
}
