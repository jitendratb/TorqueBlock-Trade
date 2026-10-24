import PageHero from "@/components/site/PageHero";
import AccountView from "@/components/account/AccountView";

export const metadata = {
    title: "My Account | Torque Block Trade",
    description: "Manage your business profile, credit line, branches and sales team.",
    robots: { index: false, follow: true },
};

export default function AccountPage() {
    return (
        <main>
            <PageHero eyebrow="Trade Account" title="My Business" accent="Account" description="Edit your business profile and billing address, track credit, and manage branches and salesmen." />
            <div className="bg-[#0B0F19] pb-20">
                <div className="mx-auto max-w-4xl px-4 md:px-6">
                    <AccountView />
                </div>
            </div>
        </main>
    );
}
