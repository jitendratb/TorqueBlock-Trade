"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiEdit2 } from "react-icons/fi";
import { Button, ErrorState, LoadingState } from "@/ui";
import { whatsappLink } from "@/lib/format";
import { useAuthStore, selectHasDetails } from "@/store/authStore";
import { useSettings } from "@/components/site/SettingsProvider";
import RegistrationForm from "./RegistrationForm";

// An admin activates trade access (the backend's 'dealer' role); until then the details wait for review.
const STATUS_VIEW = {
    approved: { Icon: FiCheckCircle, tone: "text-green-500", title: "Trade Account Active", text: "Trade prices and instant ordering are live across all tyre stock." },
    awaiting: { Icon: FiClock, tone: "text-sky-400", title: "Awaiting Activation", text: "Our team verifies your GSTIN and activates trade prices and ordering. Message us on WhatsApp to speed it up." },
};

function StatusPanel({ profile }) {
    const { contact } = useSettings();
    const view = profile.isApproved ? STATUS_VIEW.approved : STATUS_VIEW.awaiting;
    const { Icon } = view;
    const address = profile.address || {};
    const activationLink = whatsappLink(contact?.whatsapp, `Hi Torque Block! Please activate my trade account for ${address.businessName || "my business"} (GSTIN ${address.gstin || profile.gstin || "-"}, mobile ${profile.phone}).`);
    return (
        <div className="space-y-5 text-center">
            <Icon className={`mx-auto text-6xl ${view.tone}`} />
            <div>
                <h2 className="text-2xl font-black text-white">{view.title}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{view.text}</p>
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm sm:grid-cols-2">
                {[
                    ["Business", address.businessName],
                    ["Contact", address.contactName || profile.name],
                    ["GSTIN", address.gstin || profile.gstin],
                    ["City", address.city && `${address.city}, ${address.state}`],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</dt>
                        <dd className="font-semibold text-white">{value || "—"}</dd>
                    </div>
                ))}
            </dl>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                {!profile.isApproved && activationLink && (
                    <Button href={activationLink} icon={<FaWhatsapp className="text-lg" />}>Message Us on WhatsApp</Button>
                )}
                <Button href="/#stock">Check Stock</Button>
                <Button href="/orders" variant="outline">My Orders</Button>
                <Button href="/account" variant="ghost"> <FiEdit2 /> Edit Profile</Button>
            </div>
        </div>
    );
}

export default function TradeRegistration() {
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const status = useAuthStore((s) => s.status);
    const hasDetails = useAuthStore(selectHasDetails);

    // Logged in: the profile tells whether this user has registered already.
    if (token && !profile) {
        if (status === "error") {
            return (
                <ErrorState
                    title="Account Unavailable"
                    message="We couldn't retrieve your trade profile. Please verify your connection or try again."
                    onRetry={() => useAuthStore.getState().loadProfile()}
                    retryText="Retry"
                />
            );
        }
        return <LoadingState message="Loading your trade account…" />;
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 backdrop-blur-md">
            {hasDetails ? <StatusPanel profile={profile} /> : <RegistrationForm />}
        </div>
    );
}
