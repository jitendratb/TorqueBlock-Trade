"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiDisc, FiTag, FiLoader, FiX, FiAward } from "react-icons/fi";
import { MdTwoWheeler } from "react-icons/md";
import { suggestCatalog } from "@/services/CatalogService";
import { findSearchTarget, localSuggestions, tyreHref } from "@/lib/catalog.utils";
import { useStockFilters } from "@/hooks/useStockFilters";

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_ROW = "w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-200 hover:bg-orange-500/15 hover:text-white flex items-center justify-between gap-3 group transition-colors";

const GROUPS = [
    { type: "bike", title: "Compatible Bikes", Icon: MdTwoWheeler },
    { type: "product", title: "Tyre Models", Icon: FiTag },
    { type: "size", title: "Tyre Sizes", Icon: FiDisc },
    { type: "brand", title: "Brands", Icon: FiAward },
];

// Smart-search suggestions grouped by type (null when empty).
const toSuggestions = (res) => {
    const list = res?.suggestions || [];
    const groups = GROUPS.map((group) => ({ ...group, items: list.filter((s) => s.type === group.type) })).filter((g) => g.items.length);
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

function SearchBox({ initialQuery, onSearch, index, tradePaths }) {
    const router = useRouter();
    const [text, setText] = useState(initialQuery || "");
    const [result, setResult] = useState({ suggestions: null, loading: false });
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setText(initialQuery || "");
    }, [initialQuery]);

    const query = text.trim();
    const canSuggest = query.length >= MIN_QUERY_LENGTH;
    const suggestions = canSuggest ? result.suggestions : null;
    const loading = canSuggest && result.loading;

    // Live suggestions, debounced while typing.
    useEffect(() => {
        if (!canSuggest) return;
        let current = true;
        // Trade-stock matches show at once; smart-search results replace them when (and if) they arrive.
        const timer = setTimeout(async () => {
            const local = toSuggestions({ suggestions: localSuggestions(index, query) });
            setResult({ suggestions: local, loading: true });
            const smart = await suggestCatalog(query, { limit: 10 });
            if (current) setResult({ suggestions: smart?.suggestions?.length ? toSuggestions(smart) : local, loading: false });
        }, 280);
        return () => {
            current = false;
            clearTimeout(timer);
        };
    }, [query, canSuggest, index]);

    // Close the dropdown on an outside click.
    useEffect(() => {
        const onPointerDown = (e) => {
            if (!containerRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    // Listen to native DOM 'search' event on input without triggering React's onSearch warning
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        const onNativeSearch = () => {
            if (!el.value) handleClear();
        };
        el.addEventListener("search", onNativeSearch);
        return () => el.removeEventListener("search", onNativeSearch);
    }, []);

    const search = (value) => {
        setOpen(false);
        onSearch(value.trim());
    };

    const submit = () => {
        const target = findSearchTarget(index, text);
        if (!target) return search(text);
        setOpen(false);
        router.push(target);
    };

    const handleClear = () => {
        setText("");
        setOpen(false);
        onSearch("");
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setText(val);
        if (val.trim()) {
            setOpen(true);
        } else {
            setOpen(false);
            if (initialQuery || text) {
                onSearch("");
            }
        }
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
                className="relative"
            >
                <div className="relative flex items-center rounded-full border border-white/20 bg-black/60 p-1 sm:p-1.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/20 transition-all">
                    {loading ? (
                        <FiLoader className="ml-4 sm:ml-5 text-lg sm:text-xl text-orange-400 shrink-0 animate-spin" />
                    ) : (
                        <FiSearch className="ml-4 sm:ml-5 text-lg sm:text-xl text-zinc-400 shrink-0" />
                    )}
                    <input
                        ref={inputRef}
                        type="search"
                        value={text}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (text.trim().length >= MIN_QUERY_LENGTH) setOpen(true);
                        }}
                        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                        placeholder="Search size, brand or bike (e.g. 140/70 R17)"
                        aria-label="Search motorcycle tyres"
                        className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-zinc-400 outline-none"
                    />
                    {text && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Clear input"
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors mr-1 cursor-pointer"
                        >
                            <FiX className="text-base" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shrink-0 transition-all shadow-md shadow-orange-500/25 mr-1 cursor-pointer"
                    >
                        Search
                    </button>
                </div>
                {/* Center orange glow underline */}
                <div className="mx-auto mt-[-1px] h-[2px] w-48 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px]" />
            </form>

            {open && suggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#0e121c]/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/90 max-h-[380px] overflow-y-auto">
                    {suggestions.map(({ type, title, Icon, items }) => (
                        <SuggestionGroup key={type} Icon={Icon} title={title}>
                            {items.map((item, idx) => (
                                <button key={`${type}-${item.id || item.query}-${idx}`} type="button" onClick={() => pick(item)} className={SUGGESTION_ROW}>
                                    <span className={`font-semibold truncate ${type === "size" ? "font-mono" : ""}`}>{item.text}</span>
                                    {item.path && tradePaths.has(item.path) ? (
                                        <span className="shrink-0 text-[11px] font-bold text-orange-400/90">View tyre</span>
                                    ) : type === "size" && item.count > 0 ? (
                                        <span className="shrink-0 text-[11px] text-zinc-400 group-hover:text-zinc-200">{item.count} tyres</span>
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

// Hero search: applies the query to the shared stock filters and suggests bikes, tyres and sizes while typing.
// searchIndex: toSearchIndex(stock.products); suggestions only link to tyres that are in trade stock.
export default function HeroSearch({ searchIndex = [] }) {
    const [filters, setFilters] = useStockFilters();
    const [paths] = useState(() => new Set(searchIndex.flatMap((p) => [tyreHref(p), ...p.sizes.map((s) => tyreHref(p, s))])));
    // Remounts when the applied query changes (e.g. cleared from the stock list) so the input always shows it.
    return <SearchBox key={filters.query} initialQuery={filters.query} index={searchIndex} tradePaths={paths} onSearch={(query) => setFilters({ query })} />;
}
