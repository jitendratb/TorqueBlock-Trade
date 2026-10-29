"use client";

import { FiUser } from "react-icons/fi";
import { Button, LoadingState, ErrorState } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import BusinessAccount from "./BusinessAccount";

const CARD = "rounded-3xl border border-white/10 bg-[#141824] p-5 md:p-7 shadow-xl";

// /account — login gate around the business account.
export default function AccountView() {
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const authStatus = useAuthStore((s) => s.status);
    const openLogin = useUiStore((s) => s.openLogin);

    if (!token) {
        return (
            <div className={`${CARD} text-center`}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                    <FiUser className="text-2xl" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">Your Business Account</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">Log in with your trade mobile number to manage your profile, credit, branches and team.</p>
                <Button className="mt-6" onClick={openLogin}>Trade Login</Button>
            </div>
        );
    }

    if (!profile) {
        if (authStatus === "error") {
            return (
                <div className={CARD}>
                    <ErrorState
                        title="Failed to Load Account"
                        message="We couldn't retrieve your business account. Please verify your connection or try again."
                        onRetry={() => useAuthStore.getState().loadProfile()}
                        retryText="Retry"
                    />
                </div>
            );
        }
        return (
            <div className={CARD}>
                <LoadingState message="Loading your business account…" />
            </div>
        );
    }

    return (
        <div className={CARD}>
            <BusinessAccount />
        </div>
    );
}
