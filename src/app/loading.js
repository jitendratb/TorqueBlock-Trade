import { SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-[80vh] w-full bg-[#0B0F19] pt-24 sm:pt-28">
            <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-pulse">
                {/* Hero skeleton */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 md:p-12 space-y-4">
                    <div className="h-4 w-32 rounded-full bg-orange-500/20" />
                    <div className="h-10 w-72 max-w-full rounded-2xl bg-white/10" />
                    <div className="h-4 w-96 max-w-full rounded-lg bg-white/5" />
                    <div className="h-12 max-w-2xl rounded-2xl bg-white/5 mt-6" />
                </div>

                {/* Grid items skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-40 rounded-lg bg-white/10" />
                        <div className="h-6 w-24 rounded-lg bg-white/5" />
                    </div>
                    <SkeletonCard count={4} />
                </div>
            </div>
        </div>
    );
}
