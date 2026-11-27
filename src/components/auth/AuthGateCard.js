"use client";

import { Button, Card } from "@/components/ui";
import { useUiStore } from "@/store/uiStore";

export default function AuthGateCard({ icon, title, description, ctaText = "Trade Login", onLogin, }) {
    const openLogin = useUiStore((s) => s.openLogin);

    return (
        <Card variant="frosted" className="p-5 min-[360px]:p-8 sm:p-12 text-center space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shadow-sm">{icon}</div>
            <div className="relative">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white"> {title}</h2>
                <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed"> {description} </p>
            </div>
            <div className="relative pt-2">
                <Button variant="gradient" size="lg" onClick={onLogin || openLogin}> {ctaText} </Button>
            </div>
        </Card>
    );
}

