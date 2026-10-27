"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiDisc, FiTag, FiLoader, FiX, FiAward, FiSearch } from "react-icons/fi";
import { PiArrowUpBold } from "react-icons/pi";
import { MdTwoWheeler } from "react-icons/md";
import { suggestCatalog } from "@/services/CatalogService";
import { findSearchTarget, localSuggestions, tyreHref } from "@/lib/catalog.utils";
import { useStockFilters } from "@/hooks/useStockFilters";

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_ROW = "w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-200 hover:bg-orange-500/15 hover:text-white flex items-center justify-between gap-3 group transition-colors";

const GROUPS = [
    { type: "brand", title: "Brands", Icon: FiAward },
    { type: "product", title: "Tyre Models", Icon: FiTag },
    { type: "size", title: "Tyre Sizes", Icon: FiDisc },
    { type: "bike", title: "Compatible Bikes", Icon: MdTwoWheeler },
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
                className="relative"
            >
                <div className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 sm:p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] focus-within:border-orange-500/70 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
                    <button
                        type="button"
                        onClick={text ? handleClear : () => inputRef.current?.focus()}
                        aria-label={text ? "Clear search" : "Start a search"}
                        className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 cursor-pointer"
                    >
                        {text ? <FiX className="text-base sm:text-lg" /> : <FiSearch className="text-base sm:text-lg text-white" />}
                    </button>
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
                        className="min-w-0 flex-1 bg-transparent px-1.5 sm:px-2 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder:text-zinc-400 outline-none"
                    />
                    <button
                        type="submit"
                        aria-label="Search"
                        className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ${
                            query ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 hover:bg-orange-600" : "bg-white/20 text-white/70 hover:bg-white/30"
                        }`}
                    >
                        {loading ? <FiLoader className="text-lg animate-spin" /> : <PiArrowUpBold className="text-lg sm:text-xl" />}
                    </button>
                </div>
                {/* Center orange glow underline */}
                <div className="mx-auto mt-[-1px] h-[2px] w-32 sm:w-48 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px]" />
            </form>

            {open && suggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#0e121c]/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/90 max-h-[min(380px,50vh)] overflow-y-auto">
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


export default function HeroSearch({ searchIndex = [], examples = [] }) {
    const [filters, setFilters] = useStockFilters();
    const [paths] = useState(() => new Set(searchIndex.flatMap((p) => [tyreHref(p), ...p.sizes.map((s) => tyreHref(p, s))])));
    return <SearchBox key={filters.query} initialQuery={filters.query} index={searchIndex} tradePaths={paths} examples={examples} onSearch={(query) => setFilters({ query })} />;
}

const SLIDE_MS = 6000;

// Hero background: one image, or a cross-fading slideshow when there are several.
export function HeroSlides({ images = [], alt }) {
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (images.length < 2) return;
        const timer = setInterval(() => setActive((i) => (i + 1) % images.length), SLIDE_MS);
        return () => clearInterval(timer);
    }, [images.length]);

    return images.map((src, i) => (
        <Image
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            quality={85}
            className={`object-cover transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
        />
    ));
}
