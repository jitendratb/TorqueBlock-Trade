"use client";

import { useRouter } from "next/navigation";
import { FiUser } from "react-icons/fi";
import Button from "@/ui/Button";
import { useUiStore } from "@/store/ui.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useAccountStore } from "../account.store";
import BusinessAccount from "./BusinessAccount";
import { Skeleton } from "./AccountUi";

const CARD = "rounded-3xl border border-white/10 bg-[#141824] p-5 md:p-7 shadow-xl";

// /account — login gate around the business account.
export default function AccountView() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderFilter = useAccountStore((s) => s.setOrderFilter);

    if (!token) {
        return (
            <div className={`${CARD} text-center`}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                    <FiUser className="text-2xl" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">Your Business Account</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">Log in with your dealer mobile number to manage your profile, credit, branches and team.</p>
                <Button className="mt-6" onClick={openLogin}>Dealer Login</Button>
            </div>
        );
    }

    if (!profile) return <div className={CARD}><Skeleton rows={3} /></div>;

    return (
        <div className={CARD}>
            <BusinessAccount
                onFilterOrders={(filter) => {
                    setOrderFilter(filter);
                    router.push("/orders");
                }}
            />
        </div>
    );
}
