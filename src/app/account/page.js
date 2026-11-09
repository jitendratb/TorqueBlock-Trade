import Link from "next/link";
import AccountView from "@/components/account/AccountView";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "My Account | Torque Block Trade",
    description: "Manage your business profile, credit line, branches and sales team.",
    robots: { index: false, follow: true },
};

export default function AccountPage() {
    return (
        <main className="bg-[#0B0E17] min-h-[calc(100vh-120px)] pt-20 sm:pt-24 pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
                {/* Breadcrumbs matching reference screenshot */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold pt-1">
                    <Link href="/" className="text-sky-400 hover:text-sky-300 transition-colors">
                        Home
                    </Link>
                    <span className="text-zinc-600">›</span>
                    <span className="text-white font-bold" aria-current="page">
                        My Business Account
                    </span>
                </nav>

                <AccountView />
            </div>
        </main>
    );
}
