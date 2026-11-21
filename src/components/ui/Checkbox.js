"use client";

import { forwardRef } from "react";
import clsx from "clsx";

// Checkbox with its label. Pass `label` (or children) and the usual input props.
const Checkbox = forwardRef(function Checkbox({ label, children, className, ...props }, ref) {
    return (
        <label className={clsx("inline-flex cursor-pointer items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300", className)}>
            <input ref={ref} type="checkbox" className="h-4 w-4 rounded accent-[#A35229]" {...props} />
            {label ?? children}
        </label>
    );
});

export default Checkbox;
