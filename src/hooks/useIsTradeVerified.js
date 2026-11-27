import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";

// An approved owner has the dealer role; an admin-activated business account counts too, since the role can be lost later.
export default function useIsTradeVerified() {
    const isApproved = useAuthStore((s) => Boolean(s.profile?.isApproved));
    const isActive = useAccountStore((s) => Boolean(s.account?.isActive));
    return isApproved || isActive;
}
