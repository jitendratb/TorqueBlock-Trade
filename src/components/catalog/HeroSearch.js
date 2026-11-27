"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiAward, FiDisc, FiTag, FiX } from "react-icons/fi";
import { MdTwoWheeler } from "react-icons/md";
import { PiArrowUpBold } from "react-icons/pi";
import { Button, Spinner } from "@/components/ui";
import { useStockFilters } from "@/hooks/useStockFilters";
import { findSearchTarget, localSuggestions, sizeMatches, tyreHref } from "@/lib/catalog.utils";
import { suggestCatalog } from "@/services/CatalogService";

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_ROW = "w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-200 hover:bg-orange-500/15 hover:text-white flex items-center justify-between gap-3 group transition-colors";

const GROUPS = [
    { type: "brand", title: "Brands", Icon: FiAward },
    { type: "product", title: "Tyre Models", Icon: FiTag },
    { type: "size", title: "Tyre Sizes", Icon: FiDisc },
    { type: "bike", title: "Compatible Bikes", Icon: MdTwoWheeler },
];

const toSuggestions = (res) => {
    const list = res?.suggestions || [];
    const groups = GROUPS.map((group) => ({
        ...group,
        items: list.filter((s) => s.type === group.type),
    })).filter((g) => g.items.length);
    return groups.length ? groups : null;
};

function SuggestionGroup({ Icon, title, children }) {
    return (
        <div className="mb-2 last:mb-0">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Icon className="text-sm" />
                <span>{title}</span>
            </div>
            {children}
        </div>
    );
}

// Orange on the numbers the user typed ("100", "90") inside the size, as on the main site
function HighlightedSize({ size, query }) {
    const numbers = [...new Set(query.match(/\d+(?:\.\d+)?/g) || [])].sort((a, b) => b.length - a.length);
    if (!numbers.length) return size;
    const pattern = new RegExp(`(${numbers.map((n) => n.replace(".", "\\.")).join("|")})`, "g");
    return size.split(pattern).map((part, i) =>
        numbers.includes(part) ? <span key={i} className="text-orange-400">{part}</span> : part
    );
}

function SizeResults({ items, query, onPick }) {
    return (
        <div className="flex flex-col gap-0.5">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => onPick(item)}
                    className="w-full text-left px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-sm leading-snug text-zinc-100 hover:bg-white/10 active:bg-white/10 flex items-center justify-between gap-2 sm:gap-3 transition-colors"
                >
                    <span className="min-w-0 line-clamp-2 sm:line-clamp-none sm:truncate font-semibold">
                        {item.name} <HighlightedSize size={item.size} query={query} />
                        {item.detail && <span className="text-zinc-300"> {item.detail}</span>}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/15 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-zinc-200">
                        {item.isTube ? "Tube" : "Size"}
                    </span>
                </button>
            ))}
        </div>
    );
}

const PANEL_MAX_HEIGHT = 420;
const PANEL_MIN_BELOW = 280;
const VIEWPORT_GAP = 12;
// Leaves room for the sticky site header when the panel opens upwards
const HEADER_OFFSET = 58;

// Opens the results above the search bar when there isn't room to scroll them below it
function usePanelPlacement(anchorRef, active) {
    const [placement, setPlacement] = useState({ up: false, maxHeight: PANEL_MAX_HEIGHT });
    useLayoutEffect(() => {
        if (!active) return;
        const update = () => {
            const rect = anchorRef.current?.getBoundingClientRect();
            if (!rect) return;
            const below = window.innerHeight - rect.bottom - VIEWPORT_GAP;
            const above = rect.top - HEADER_OFFSET - VIEWPORT_GAP;
            const up = below < PANEL_MIN_BELOW && above > below;
            const maxHeight = Math.max(160, Math.min(PANEL_MAX_HEIGHT, up ? above : below));
            setPlacement((prev) => (prev.up === up && prev.maxHeight === maxHeight ? prev : { up, maxHeight }));
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [anchorRef, active]);
    return placement;
}

const DEFAULT_PLACEHOLDER = "Search by tyre size, brand or bike";
const PLACEHOLDER_MS = 3000;

function useRotatingPlaceholder(examples) {
    const [i, setI] = useState(0);
    useEffect(() => {
        if (examples.length < 2) return;
        const timer = setInterval(() => setI((n) => (n + 1) % examples.length), PLACEHOLDER_MS);
        return () => clearInterval(timer);
    }, [examples.length]);
    return examples.length ? `Search "${examples[i % examples.length]}"` : DEFAULT_PLACEHOLDER;
}

function SearchBox({ initialQuery, onSearch, index, tradePaths, examples = [] }) {
    const router = useRouter();
    const [text, setText] = useState(initialQuery || "");
    const [result, setResult] = useState({ suggestions: null, loading: false });
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const placeholder = useRotatingPlaceholder(examples);

    const query = text.trim();
    const canSuggest = query.length >= MIN_QUERY_LENGTH;
    const suggestions = canSuggest ? result.suggestions : null;
    const loading = canSuggest && result.loading;
    const sizeResults = useMemo(() => (canSuggest ? sizeMatches(index, query) : []), [canSuggest, index, query]);
    const hasResults = Boolean(sizeResults.length || suggestions);
    const formRef = useRef(null);
    const panel = usePanelPlacement(formRef, open && hasResults);

    useEffect(() => {
        if (!canSuggest) return;
        let current = true;
        const timer = setTimeout(async () => {
            const local = toSuggestions({ suggestions: localSuggestions(index, query) });
            setResult({ suggestions: local, loading: true });
            const smart = await suggestCatalog(query, { limit: 10 });
            if (current) {
                setResult({
                    suggestions: smart?.suggestions?.length ? toSuggestions(smart) : local,
                    loading: false,
                });
            }
        }, 280);
        return () => {
            current = false;
            clearTimeout(timer);
        };
    }, [query, canSuggest, index]);

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!containerRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const search = (value) => {
        setOpen(false);
        onSearch(value.trim());
    };

    const submit = () => {
        if (!query) return inputRef.current?.focus();
        const target = findSearchTarget(index, text);
        if (!target) return search(text);
        setOpen(false);
        router.push(target);
    };

    const handleClear = () => {
        setText("");
        setOpen(false);
        if (initialQuery) onSearch("");
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setText(val);
        setOpen(Boolean(val.trim()));
        if (!val.trim() && initialQuery) onSearch("");
    };

    const pick = (item) => {
        if (item.path && tradePaths.has(item.path)) {
            setOpen(false);
            router.push(item.path);
            return;
        }
        search(item.query || item.text);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                role="search"
                ref={formRef}
                className="relative"
            >
                <div className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 sm:p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] focus-within:border-orange-500/70 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={text}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (canSuggest) setOpen(true);
                        }}
                        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                        placeholder={placeholder}
                        aria-label="Search motorcycle tyres by size, brand or bike"
                        className="min-w-0 flex-1 bg-transparent pl-3.5 pr-1 sm:pl-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder:text-zinc-400 outline-none"
                    />
                    {text && (
                        <Button variant="subtle" size="sm" iconOnly pill onClick={handleClear} aria-label="Clear search" icon={<FiX />} />
                    )}
                    <Button
                        type="submit"
                        variant={query ? "primary" : "secondary"}
                        size="md"
                        iconOnly
                        pill
                        aria-label="Search"
                        icon={loading ? <Spinner size="sm" tone="white" label="Searching" /> : <PiArrowUpBold />}
                    />
                </div>
                <div className="mx-auto mt-[-1px] h-[2px] w-32 sm:w-48 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px]" />
            </form>

            {open && hasResults && (
                <div
                    style={{ maxHeight: panel.maxHeight }}
                    className={`absolute left-0 right-0 z-50 rounded-2xl border border-white/15 bg-[#0e121c]/95 backdrop-blur-2xl p-2 sm:p-3 shadow-2xl shadow-black/90 overflow-y-auto overscroll-contain ${panel.up ? "bottom-full mb-2" : "top-full mt-2"}`}
                >
                    {sizeResults.length ? (
                        <SizeResults
                            items={sizeResults}
                            query={query}
                            onPick={(item) => {
                                setOpen(false);
                                router.push(item.path);
                            }}
                        />
                    ) : suggestions.map(({ type, title, Icon, items }) => (
                        <SuggestionGroup key={type} Icon={Icon} title={title}>
                            {items.map((item, idx) => (
                                <button
                                    key={`${type}-${item.id || item.query}-${idx}`}
                                    type="button"
                                    onClick={() => pick(item)}
                                    className={SUGGESTION_ROW}
                                >
                                    <span className={`font-semibold truncate ${type === "size" ? "font-mono" : ""}`}>
                                        {item.text}
                                    </span>
                                    {item.path && tradePaths.has(item.path) ? (
                                        <span className="shrink-0 text-[11px] font-bold text-orange-400/90">
                                            View tyre
                                        </span>
                                    ) : type === "size" && item.count > 0 ? (
                                        <span className="shrink-0 text-[11px] text-zinc-400 group-hover:text-zinc-200">
                                            {item.count} tyres
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </SuggestionGroup>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function HeroSearch({ searchIndex = [], examples = [] }) {
    const [filters, setFilters] = useStockFilters();
    const [paths] = useState(
        () => new Set(searchIndex.flatMap((p) => [tyreHref(p), ...p.sizes.map((s) => tyreHref(p, s))]))
    );
    return (
        <SearchBox
            key={filters.query}
            initialQuery={filters.query}
            index={searchIndex}
            tradePaths={paths}
            examples={examples}
            onSearch={(query) => setFilters({ query })}
        />
    );
}
