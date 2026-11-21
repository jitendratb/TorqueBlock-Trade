import clsx from "clsx";
import { FiCheckCircle } from "react-icons/fi";
import { TRADE_AUDIENCE, TRADE_PROOF } from "@/constants/trust";

function AvatarStack({ size = "md" }) {
    const box = size === "sm" ? "h-5 w-5 text-[9px] border" : "h-8 w-8 text-sm border-2";
    return (
        <span aria-hidden="true" className={clsx("flex", size === "sm" ? "-space-x-1.5" : "-space-x-2.5")}>
            {TRADE_AUDIENCE.map(({ Icon, label, tint }) => (
                <span
                    key={label}
                    className={clsx("grid place-items-center rounded-full border-[#0B0F19] bg-gradient-to-br text-white", tint, box)}
                >
                    <Icon />
                </span>
            ))}
        </span>
    );
}

// Desktop glass card (bottom-right of the hero) — the trade version of the website's rating card.
export function TradeProofCard({ className }) {
    return (
        <div
            className={clsx(
                "relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl",
                className
            )}
        >
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 block h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="leading-tight">
                <p className="text-sm font-black uppercase tracking-wide text-white">{TRADE_PROOF.headline}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">{TRADE_PROOF.subline}</p>
            </div>

            <span aria-hidden="true" className="h-10 w-px bg-white/15" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <AvatarStack />
                    <span className="text-base font-black text-white">
                        {TRADE_PROOF.dealers} <span className="text-orange-400">{TRADE_PROOF.dealersLabel}</span>
                    </span>
                </div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                    <FiCheckCircle aria-hidden="true" className="text-sm text-emerald-400" />
                    {TRADE_PROOF.audience}
                </p>
            </div>
        </div>
    );
}

// Compact pill for phones/tablets (hidden on desktop where the card shows).
export function TradeProofPill({ className }) {
    return (
        <div
            className={clsx(
                "flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur",
                className
            )}
        >
            <AvatarStack size="sm" />
            <span className="text-[11px] font-black text-white">
                {TRADE_PROOF.dealers} <span className="text-orange-400">{TRADE_PROOF.dealersLabel}</span>
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <span className="text-[11px] text-white/80">{TRADE_PROOF.subline}</span>
        </div>
    );
}
