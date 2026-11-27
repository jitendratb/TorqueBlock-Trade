import clsx from "clsx";
import { FiCheckCircle } from "react-icons/fi";
import { TRADE_AUDIENCE, TRADE_PROOF } from "@/constants/trust";

const AVATAR_SIZES = {
    sm: { stack: "-space-x-1.5", item: "h-5 w-5 border text-[9px]" },
    md: { stack: "-space-x-2.5", item: "h-8 w-8 border-2 text-sm" },
    responsive: { stack: "-space-x-1.5 sm:-space-x-2.5", item: "h-5 w-5 border text-[9px] sm:h-8 sm:w-8 sm:border-2 sm:text-sm" },
};

const GLASS = "relative isolate overflow-hidden border border-white/15 bg-white/10 backdrop-blur-xl";
const SUBLINE = TRADE_PROOF.subline.charAt(0).toLowerCase() + TRADE_PROOF.subline.slice(1);

function AvatarStack({ size = "md" }) {
    const { stack, item } = AVATAR_SIZES[size];
    return (
        <span aria-hidden="true" className={clsx("flex shrink-0", stack)}>
            {TRADE_AUDIENCE.map(({ Icon, label, tint }) => (
                <span key={label} className={clsx("grid place-items-center rounded-full border-[#F1F5F9] bg-gradient-to-br text-white", tint, item)}>
                    <Icon />
                </span>
            ))}
        </span>
    );
}

function ProofCount({ className }) {
    const count = TRADE_PROOF.dealers || "";
    const plus = count.endsWith("+");
    return (
        <span className={clsx("font-black leading-none tracking-tight text-white", className)}>
            {plus ? count.slice(0, -1) : count}
            {plus && <span className="text-orange-500">+</span>}
        </span>
    );
}

function ProofHeadline({ countClassName, className }) {
    return (
        <p className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap sm:gap-2">
            <ProofCount className={countClassName} />
            <span className={clsx("font-bold uppercase", className)}>{TRADE_PROOF.headline}</span>
        </p>
    );
}

function AudienceLine({ withSubline = false, className }) {
    return (
        <p className={clsx("flex min-w-0 items-center gap-1.5 text-xs font-medium", className)}>
            <FiCheckCircle aria-hidden="true" className="shrink-0 text-emerald-400" />
            <span className="truncate">
                {TRADE_PROOF.audience}
                {withSubline && ` ${SUBLINE}`}
            </span>
        </p>
    );
}

// Desktop glass card (bottom-right of the hero) — the trade version of the website's rating card.
export function TradeProofCard({ className }) {
    return (
        <div className={clsx(GLASS, "flex w-fit items-center gap-3.5 rounded-2xl px-4 py-3 shadow-2xl shadow-black/30", className)}>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 block h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <AvatarStack />
            <div className="leading-tight">
                <ProofHeadline countClassName="text-xl" className="text-[11px] tracking-[0.12em] text-white/75" />
                <AudienceLine withSubline className="mt-1 text-white/70" />
            </div>
        </div>
    );
}

// Slim single-row version for phones/tablets; the hero kicker already names the audience on phones.
export function TradeProofPill({ className }) {
    return (
        <div className={clsx(GLASS, "flex w-fit max-w-full items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 shadow-lg shadow-black/30 sm:gap-2.5 sm:pr-4", className)}>
            <AvatarStack size="responsive" />
            <ProofHeadline countClassName="text-sm sm:text-base" className="text-[10px] tracking-[0.08em] text-white/80 sm:text-[11px]" />
            <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-white/20 sm:block" />
            <AudienceLine className="hidden text-white/75 sm:flex" />
        </div>
    );
}
