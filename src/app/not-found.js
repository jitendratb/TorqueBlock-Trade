import { FiAlertCircle, FiArrowLeft, FiPackage } from "react-icons/fi";
import Button from "@/components/ui/Button";

export default function NotFound() {
    return (
        <main className="relative min-h-[75vh] flex items-center justify-center px-4 py-20 bg-[#0B0F19] overflow-hidden">
            <span aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
            
            <div className="relative mx-auto max-w-md w-full rounded-3xl border border-white/10 bg-[#141824] p-8 sm:p-10 text-center shadow-2xl backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-3xl text-orange-400">
                    <FiAlertCircle />
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-orange-400">Error 404</p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Page Not Found</h1>
                <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-zinc-400">
                    The trade catalogue page, tyre model, or resource you are looking for does not exist or has been moved.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button href="/" variant="primary" size="md" full icon={<FiArrowLeft />}>
                        Live Stock
                    </Button>
                    <Button href="/orders" variant="ghost" size="md" full icon={<FiPackage />}>
                        My Orders
                    </Button>
                </div>
            </div>
        </main>
    );
}
