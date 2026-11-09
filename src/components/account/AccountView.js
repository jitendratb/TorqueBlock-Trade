"use client";

import { FiUser } from "react-icons/fi";
import { Button, LoadingState, ErrorState } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/authStore";
import BusinessAccount from "./BusinessAccount";
import useIsMounted from "@/hooks/useIsMounted";

// /account — login gate around the business account.
export default function AccountView() {
    const isMounted = useIsMounted();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const authStatus = useAuthStore((s) => s.status);
    const openLogin = useUiStore((s) => s.openLogin);

    if (!isMounted) {
        return (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-8 sm:p-12 text-center shadow-xl backdrop-blur-xl">
                <LoadingState message="Loading your business account…" />
            </div>
        );
    }

    if (!token) {
        return (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-8 sm:p-12 text-center shadow-xl backdrop-blur-xl space-y-4">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shadow-sm">
                    <FiUser className="text-2xl" />
                </div>
                <div className="relative">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">Your Business Account</h2>
                    <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Log in with your trade mobile number to manage your profile, credit, branches and team.
                    </p>
                </div>
                <div className="relative pt-2">
                    <Button size="lg" className="justify-center py-3 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-orange-500/25" onClick={openLogin}>
                        Trade Login
                    </Button>
                </div>
            </div>
        );
    }

    if (!profile) {
        if (authStatus === "error") {
            return (
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-8 text-center shadow-xl backdrop-blur-xl">
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
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-8 sm:p-12 text-center shadow-xl backdrop-blur-xl">
                <LoadingState message="Loading your business account…" />
            </div>
        );
    }

    return <BusinessAccount />;
}
