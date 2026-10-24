import clsx from "clsx";

const TONES = {
    green: "bg-green-500/15 text-green-400",
    orange: "bg-orange-500/15 text-orange-400",
    sky: "bg-sky-500/15 text-sky-400",
    red: "bg-red-500/15 text-red-400",
};

export default function Badge({ tone = "orange", className, children }) {
    return <span className={clsx("inline-block rounded-md px-2 py-1 text-[11px] font-bold", TONES[tone], className)}>{children}</span>;
}
