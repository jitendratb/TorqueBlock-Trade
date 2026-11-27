// Section title + optional description, with an action (button) on the right.
export default function PanelHeader({ title, description, action }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
            <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
                {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
