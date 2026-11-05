"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/ui";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/ui.store";
import OtpForm from "@/components/auth/OtpForm";

export default function LoginPage() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const profile = useAuthStore((s) => s.profile);
    const notify = useUiStore((s) => s.notify);

    useEffect(() => {
        if (token && profile?.isApproved) {
            router.replace("/orders");
        }
    }, [token, profile, router]);

    const handleSuccess = (userProfile) => {
        if (!userProfile) return notify("error", "You're logged in, but we couldn't load your trade account.");
        if (userProfile.isApproved) {
            notify("success", `Welcome back${userProfile.name ? `, ${userProfile.name}` : ""}.`);
            router.push("/orders");
            return;
        }
        if (userProfile.address?.id) {
            notify("info", "Logged in. Your trade account is awaiting activation.");
            router.push("/register");
            return;
        }
        notify("info", "Logged in. Complete your business details to start ordering.");
        router.push("/register");
    };

    return (
        <main className="relative min-h-[calc(100vh-120px)] flex items-center justify-center py-16 px-4 sm:px-6">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-b from-[#A35229]/15 to-transparent blur-3xl opacity-50" />
            </div>

            {/* Authentication Card (Matches Screenshot) */}
            <div className="relative z-10 w-full max-w-[460px] rounded-2xl sm:rounded-3xl bg-[#22262E]/95 border border-white/10 p-6 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5">
                    <Logo href="/" className="w-[110px]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A35229] border border-[#A35229]/30 bg-[#A35229]/10 px-2 py-0.5 rounded-full">
                        Trade Portal
                    </span>
                </div>

                <OtpForm onSuccess={handleSuccess} onRegister={() => router.push("/register")} />

                <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
                    New to Trade?{" "}
                    <Link href="/register" className="font-bold text-[#F59E0B] hover:text-amber-400 transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </main>
    );
}

