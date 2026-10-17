"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/ui/Logo";
import { Modal } from "@/ui/Overlay";
import { useUiStore } from "@/store/ui.store";
import OtpForm from "./OtpForm";

export default function LoginModal() {
    const router = useRouter();
    const open = useUiStore((s) => s.loginOpen);
    const close = useUiStore((s) => s.closeLogin);
    const notify = useUiStore((s) => s.notify);

    // After login, send dealers who have not registered their business to finish registration.
    const handleSuccess = (profile) => {
        close();
        if (profile?.isDealer || profile?.businessName) return notify("success", `Welcome back${profile.name ? `, ${profile.name}` : ""}.`);
        notify("info", "Logged in. Complete your business details to start ordering.");
        router.push("/register");
    };

    return (
        <Modal open={open} onClose={close} label="Dealer login">
            {/* Remount on open so the form always starts at the phone step. */}
            {open && (
                <>
                    <Logo href={null} className="w-[110px]" />
                    <h2 className="mt-4 text-2xl font-black tracking-tight">
                        Dealer <span className="text-orange-500">Login</span>
                    </h2>
                    <p className="mb-5 mt-1 text-sm text-zinc-400">Sign in with your registered mobile number.</p>
                    <OtpForm onSuccess={handleSuccess} />
                    <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
                        New dealer?{" "}
                        <Link href="/register" onClick={close} className="font-bold text-orange-500 hover:text-orange-400">
                            Register here
                        </Link>
                    </p>
                </>
            )}
        </Modal>
    );
}
