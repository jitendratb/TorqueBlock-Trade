import AccountView from "@/components/account/AccountView";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "My Account | Torque Block Trade",
    description: "Manage your business profile, credit line, branches and sales team.",
    robots: { index: false, follow: true },
};

export default function AccountPage() {
    return (
        <main className="bg-[#0B0E17] min-h-[calc(100dvh-120px)] pt-24 sm:pt-28 pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
                <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Business Account" }]} />
                <AccountView />
            </div>
        </main>
    );
}
