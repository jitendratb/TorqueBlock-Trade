"use client";

import { FiUser } from "react-icons/fi";
import { AuthGateCard } from "@/components/auth";
import { Card, ErrorState, LoadingState } from "@/components/ui";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAuthStore } from "@/store/authStore";
import BusinessAccount from "./BusinessAccount";

// /account — login gate around the business account.
export default function AccountView() {
    const isMounted = useIsMounted();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const authStatus = useAuthStore((s) => s.status);

    if (!isMounted) {
        return (
            <Card variant="frosted" className="p-8 sm:p-12 text-center">
                <LoadingState message="Loading your business account…" />
            </Card>
        );
    }

    if (!token) {
        return (
            <AuthGateCard
                icon={<FiUser className="text-2xl" />}
                title="Your Business Account"
                description="Log in with your trade mobile number to manage your profile, credit, branches and team."
            />
        );
    }

    if (!profile) {
        if (authStatus === "error") {
            return (
                <Card variant="frosted" className="p-8 text-center">
                    <ErrorState
                        title="Failed to Load Account"
                        message="We couldn't retrieve your business account. Please verify your connection or try again."
                        onRetry={() => useAuthStore.getState().loadProfile()}
                        retryText="Retry"
                    />
                </Card>
            );
        }
        return (
            <Card variant="frosted" className="p-8 sm:p-12 text-center">
                <LoadingState message="Loading your business account…" />
            </Card>
        );
    }

    return <BusinessAccount />;
}
