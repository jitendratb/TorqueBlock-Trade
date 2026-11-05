"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import OtpForm from "./OtpForm";

export default function LoginModal() {
    const router = useRouter();
    const open = useUiStore((s) => s.loginOpen);
    const close = useUiStore((s) => s.closeLogin);
    const notify = useUiStore((s) => s.notify);

    const handleSuccess = (profile) => {
        close();
        if (!profile) return notify("error", "You're logged in, but we couldn't load your trade account. Please refresh in a moment.");
        if (profile.isApproved) return notify("success", `Welcome back${profile.name ? `, ${profile.name}` : ""}.`);
        if (profile.address?.id) return notify("info", "Logged in. Your trade account is awaiting activation by our team.");
        notify("info", "Logged in. Complete your business details to start ordering.");
        router.push("/register");
    };

    return (
        <Modal
            open={open}
            onClose={close}
            label="Authentication"
            className="max-w-[460px] w-full rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-[#22262E]/95 border border-white/10 backdrop-blur-xl shadow-2xl text-white"
        >
            {open && (
                <>
                    <OtpForm onSuccess={handleSuccess} onRegister={close} />
                    <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
                        New to Trade?{" "}
                        <Link href="/register" onClick={close} className="font-bold text-[#F59E0B] hover:text-amber-400 transition-colors">
                            Register here
                        </Link>
                    </p>
                </>
            )}
        </Modal>
    );
}
