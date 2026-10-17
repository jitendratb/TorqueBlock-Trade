import PageHero from "@/modules/site/components/PageHero";
import AccountView from "@/modules/account/components/AccountView";

export const metadata = {
    title: "My Account | Torque Block Dealers",
    description: "Manage your dealer business profile, credit line, branches and team.",
};

export default function AccountPage() {
    return (
        <main>
            <PageHero eyebrow="Dealer Account" title="My Business" accent="Account" description="Edit your business profile and billing address, track credit, and manage branches and salesmen." />
            <div className="bg-[#0B0F19] pb-20">
                <div className="mx-auto max-w-4xl px-4 md:px-6">
                    <AccountView />
                </div>
            </div>
        </main>
    );
}
