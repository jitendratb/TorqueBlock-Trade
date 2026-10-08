import Link from "next/link";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import PageHero from "@/components/layout/PageHero";
import { formatPercent, getDealerDiscount } from "@/lib/pricing";

export const metadata = {
    title: "Trade Program Strategy",
    description: "How Torque Block moves from B2C to B2B: what business buyers need, what the backend already supports, the automated order journey and the scaling plan.",
};

const SECTIONS = [
    { id: "idea", label: "The Idea" },
    { id: "needs", label: "Buyer Needs" },
    { id: "built", label: "Already Built" },
    { id: "journey", label: "Automated Journey" },
    { id: "pricing", label: "Pricing" },
    { id: "phases", label: "Scaling Plan" },
    { id: "kpis", label: "Numbers" },
    { id: "risks", label: "Risks" },
    { id: "decisions", label: "Decisions" },
];

const COMPARISON = [
    ["Who buys", "One rider", "Dealers, workshops, service centres, fleets"],
    ["Order size", "1–2 tyres, once", "Several sizes at once, every month"],
    ["Price", "MRP and offers", "One fixed dealer price below MRP"],
    ["Invoice", "Retail bill", "GST tax invoice with input credit"],
    ["Payment", "Pay online upfront", "Proforma, then online or bank transfer"],
    ["Relationship", "One-time visit", "Ongoing account with a named trade desk"],
    ["How we win them", "Ads and Google search", "Sales calls, WhatsApp, referrals"],
];

const NEEDS = [
    { q: "“Will I make money on this?”", a: "Show the dealer price next to MRP on every size." },
    { q: "“Can I get it this week?”", a: "Ship from our Bengaluru and Delhi hubs and give dispatch updates on WhatsApp." },
    { q: "“Is the paperwork clean?”", a: "A proper GST invoice on every order so they can claim input credit." },
    { q: "“Is it in stock right now?”", a: "Live stock count on every size, straight from our inventory." },
    { q: "“Can I reorder without the hassle?”", a: "One click on Order. Billing details are saved after the first order." },
    { q: "“Who do I call when something goes wrong?”", a: "One trade desk number for orders, stock and fitment questions." },
];

const BUILT = [
    ["Dealer accounts", "Users already have a “dealer” type and a GSTIN field. WhatsApp OTP login works today.", "models/user.model.js · /auth"],
    ["Capturing new partners", "Callback leads store every enquiry for the sales team.", "/leads/callback-leads"],
    ["B2B sales pipeline", "Company, branch, contact person, lead priority, assigned rep, remarks and “contacted” tracking.", "/b2b (b2bEnterprise)"],
    ["Follow-ups", "CRM, customer outreach and task lists for the sales team.", "/crm · /customer-outreach · /task-list"],
    ["Catalogue", "Brands, categories, tyre families, sizes and smart search.", "/brands · /category-v2 · /intent · /size"],
    ["Stock", "Inventory, vendor stock, stock history and back-in-stock alerts.", "/inventory · /vendor-stock · /notify"],
    ["Invoices", "Proforma invoice and tax invoice PDFs with invoice numbering.", "utils/proformaInvoicePdf.js · taxInvoicePdf.js"],
    ["Payments", "Razorpay checkout, payment webhook and a reconciliation queue.", "/user-orders · queues/reconciliation"],
    ["Dispatch", "Delivery records with courier and status, plus branches as hubs.", "/delivery · /branch"],
    ["Messaging", "WhatsApp (Meta API), SleekFlow, WhatsApp bot and a background notification worker.", "services/meta.service.js · workers/"],
    ["Team access", "Roles and permissions so each person sees only what they need.", "/rbac · /roles · /permissions"],
    ["Performance", "Sales analytics and sales-team incentives.", "/salesAnalytics · /incentive"],
];

const JOURNEY = [
    { step: "Discover", partner: "Finds the dealer portal via our sales team, WhatsApp, or the store footer.", system: "The store footer already shows “Torque Block Trade — Coming Soon”. Switch it to a live link.", status: "today" },
    { step: "Apply", partner: "Fills a 2-minute form with GSTIN and business type.", system: "Saved as a lead tagged TRADE-DEALER in the existing leads list.", status: "today" },
    { step: "Get verified", partner: "Gets a call, then logs in with WhatsApp OTP.", system: "Team checks GSTIN and marks the user as “dealer” in the dashboard.", status: "today" },
    { step: "Order", partner: "Searches a size, sees live stock and dealer price, clicks Order.", system: "Order saved as a TRADE-ORDER lead with a reference number, built in this portal.", status: "today" },
    { step: "Proforma & pay", partner: "Receives a proforma on WhatsApp, pays online or by bank.", system: "Team picks up the TRADE-ORDER lead and issues the proforma PDF and a Razorpay link.", status: "next" },
    { step: "Dispatch", partner: "Gets tracking updates until delivery.", system: "Delivery record from the nearest hub; WhatsApp updates through the notification worker.", status: "next" },
    { step: "Reorder", partner: "Gets a nudge when fast movers are due.", system: "Use order history and last-seen data to trigger WhatsApp reminders.", status: "later" },
    { step: "Grow", partner: "Gets better prices and priority stock as volume grows.", system: "Sales analytics per partner; incentives for the reps who grow them.", status: "later" },
];

const STATUS = {
    today: { label: "Works today", cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    next: { label: "Phase 2: automate", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    later: { label: "Phase 3", cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
};

const PHASES = [
    {
        name: "Launch",
        when: "Month 0–3",
        goal: "Prove that partners order again.",
        points: [
            "Go live on trade.torqueblock.com with this portal.",
            "Start with Bengaluru and Delhi, close to our two hubs.",
            "Onboard the first partners from the existing B2B / OE lead list.",
            "Verify by hand, send proformas on WhatsApp, learn what slows orders down.",
            "Team: 1 trade-desk owner and 2 field sales reps.",
        ],
    },
    {
        name: "Automate",
        when: "Month 3–6",
        goal: "Remove manual steps between order and dispatch.",
        points: [
            "Generate the proforma automatically when an order is placed.",
            "Send the Razorpay payment link and dispatch updates on WhatsApp automatically.",
            "Check GSTIN automatically during sign-up.",
            "Show dealer prices only to verified dealers.",
            "Partner page for past orders and invoices (user orders already exist).",
        ],
    },
    {
        name: "Scale",
        when: "Month 6–12",
        goal: "Grow city by city without growing the team at the same speed.",
        points: [
            "Add new cities through distributor partners.",
            "Credit terms for partners with a clean payment record.",
            "WhatsApp ordering through the existing bot: “Send 10 × 150/60 R17”.",
            "Dealer tiers with better prices and priority stock.",
            "Automatic reorder reminders based on each partner's buying cycle.",
        ],
    },
];

const KPIS = [
    ["Active partners", "Partners who ordered in the last 30 days"],
    ["Repeat rate", "% of partners who order again within 45 days"],
    ["Average order value", "₹ per order"],
    ["Order → dispatch time", "Hours from order to dispatch"],
    ["Fill rate", "% of order lines delivered in full"],
    ["Collection days", "Days from invoice to payment received"],
    ["Lead → partner", "% of applications that place a first order"],
];

const RISKS = [
    ["Trade prices leak to retail buyers", "Show trade prices only after verified login (Phase 2). Partners agree not to advertise online below our store price."],
    ["Competing with our own store", "Turn partners into our fitment network. The store sends fitment jobs to nearby partners, so both sides win."],
    ["Unpaid invoices", "No credit in Phase 1. Offer credit only after 3 on-time paid orders, with a limit per partner."],
    ["Stock runs out for big orders", "Priority allocation rules, live stock checks and back-in-stock alerts (already in the backend)."],
];

const DECISIONS = [
    "Approve the dealer discount levels (or set our own).",
    "Name one owner for the trade desk.",
    "Choose the first partners from the existing B2B lead list.",
    "Set the go-live date and the trade.torqueblock.com subdomain.",
    "Approve the small Phase 2 backend work: a dealer price field and an automatic proforma on order.",
];

function Block({ id, index, title, accent, intro, children }) {
    return (
        <section id={id} className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">{String(index).padStart(2, "0")}</p>
            <h2 className="mt-1 text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
                {title} <span className="text-orange-500">{accent}</span>
            </h2>
            {intro && <p className="mt-3 max-w-3xl text-sm md:text-base font-semibold leading-relaxed text-zinc-300">{intro}</p>}
            <div className="mt-6">{children}</div>
        </section>
    );
}

export default function StrategyPage() {
    return (
        <main className="bg-[#0B0F19]">
            <PageHero
                eyebrow="Trade Program · Meeting Brief"
                title="From B2C to"
                accent="B2B"
                description="Same brand, same design, same backend. A new customer: the businesses that fit tyres for riders every day."
            >
                <nav aria-label="Sections" className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide">
                    {SECTIONS.map((s, i) => (
                        <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:border-orange-500 hover:text-white">
                            <span className="text-orange-500">{i + 1}.</span> {s.label}
                        </a>
                    ))}
                </nav>
            </PageHero>

            <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16">
                <Block
                    id="idea"
                    index={1}
                    title="The idea in"
                    accent="one line"
                    intro="Today we sell one tyre to one rider. With Trade, we sell many tyres to the dealers and workshops riders already trust. One good partner can bring the volume of dozens of retail orders, every month, without paying for ads each time."
                >
                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead className="bg-white/5 text-[11px] uppercase tracking-widest text-zinc-400">
                                <tr>
                                    <th className="px-4 py-3"></th>
                                    <th className="px-4 py-3">Retail store (B2C)</th>
                                    <th className="px-4 py-3 text-orange-400">Trade portal (B2B)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {COMPARISON.map(([label, b2c, b2b]) => (
                                    <tr key={label}>
                                        <td className="px-4 py-3 font-black text-white">{label}</td>
                                        <td className="px-4 py-3 text-zinc-400">{b2c}</td>
                                        <td className="px-4 py-3 font-semibold text-white">{b2b}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Block>

                <Block id="needs" index={2} title="What a business buyer" accent="really needs" intro="Imagine a workshop owner at 9 am with three bikes waiting. These are the six questions in their head, and how the portal answers each one.">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {NEEDS.map(({ q, a }) => (
                            <div key={q} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-lg font-black text-white">{q}</p>
                                <p className="mt-2 flex gap-2 text-sm font-semibold text-zinc-400">
                                    <FiCheck className="mt-0.5 shrink-0 text-orange-500" /> {a}
                                </p>
                            </div>
                        ))}
                    </div>
                </Block>

                <Block id="built" index={3} title="Already in our" accent="backend" intro="We don't need a new system. Nearly every piece a B2B business needs already exists in TorqueBlock-Backend. This portal reuses it without any backend change.">
                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-white/5 text-[11px] uppercase tracking-widest text-zinc-400">
                                <tr>
                                    <th className="px-4 py-3">Business need</th>
                                    <th className="px-4 py-3">What already exists</th>
                                    <th className="px-4 py-3">Where</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {BUILT.map(([need, what, where]) => (
                                    <tr key={need}>
                                        <td className="px-4 py-3 font-black text-white">{need}</td>
                                        <td className="px-4 py-3 text-zinc-300">{what}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-orange-400">{where}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Block>

                <Block id="journey" index={4} title="The fully automated" accent="partner journey" intro="Eight steps from “never heard of us” to “orders every month”. Green steps work in this portal today. The rest plug existing backend pieces together.">
                    <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {JOURNEY.map((j, i) => (
                            <li key={j.step} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-white/15">0{i + 1}</span>
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS[j.status].cls}`}>{STATUS[j.status].label}</span>
                                </div>
                                <h3 className="text-lg font-black uppercase text-white">{j.step}</h3>
                                <p className="text-sm text-zinc-300"><span className="font-bold text-white">Partner:</span> {j.partner}</p>
                                <p className="text-sm text-zinc-400"><span className="font-bold text-orange-400">Behind the scenes:</span> {j.system}</p>
                            </li>
                        ))}
                    </ol>
                </Block>

                <Block id="pricing" index={5} title="Simple" accent="pricing" intro="One dealer price per size. No slabs and no minimum order: dealers already know their products and just want the price. Premium brands carry thinner margins, so they get a smaller discount. These levels are a starting proposal for the meeting.">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {[["Premium brands", "Pirelli, Michelin, Metzeler, Bridgestone", "pirelli"], ["Value-performance brands", "Eurogrip, Vredestein, Apollo, MRF, CEAT, Maxxis, Reise…", "eurogrip"]].map(([name, list, sample]) => (
                            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xl font-black uppercase text-white">{name}</p>
                                <p className="text-xs font-semibold text-zinc-400">{list}</p>
                                <p className="mt-3 text-3xl font-black text-orange-500">{formatPercent(getDealerDiscount(sample))} <span className="text-sm text-zinc-400">below MRP</span></p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">Set in one file (src/lib/pricing.js) and can change in minutes. Phase 2 moves this to a dealer price field in the backend.</p>
                </Block>

                <Block id="phases" index={6} title="How we" accent="scale" intro="Three phases. Each one has a single goal, and we only move on when that goal is met.">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {PHASES.map((p, i) => (
                            <div key={p.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Phase {i + 1} · {p.when}</p>
                                <h3 className="mt-1 text-2xl font-black uppercase text-white">{p.name}</h3>
                                <p className="mt-1 text-sm font-bold text-zinc-300">Goal: {p.goal}</p>
                                <ul className="mt-4 space-y-2">
                                    {p.points.map((pt) => (
                                        <li key={pt} className="flex gap-2 text-sm text-zinc-400">
                                            <FiCheck className="mt-0.5 shrink-0 text-orange-500" /> {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Block>

                <Block id="kpis" index={7} title="The numbers" accent="we watch" intro="Seven numbers tell us whether Trade is working. The sales-analytics module can report most of them.">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {KPIS.map(([name, desc]) => (
                            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="font-black text-white">{name}</p>
                                <p className="mt-1 text-sm text-zinc-400">{desc}</p>
                            </div>
                        ))}
                    </div>
                </Block>

                <Block id="risks" index={8} title="Risks and how we" accent="handle them">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {RISKS.map(([risk, fix]) => (
                            <div key={risk} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="font-black text-white">{risk}</p>
                                <p className="mt-1 text-sm text-zinc-400">{fix}</p>
                            </div>
                        ))}
                    </div>
                </Block>

                <Block id="decisions" index={9} title="Decisions" accent="needed today">
                    <ol className="space-y-2">
                        {DECISIONS.map((d, i) => (
                            <li key={d} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-black">{i + 1}</span>
                                {d}
                            </li>
                        ))}
                    </ol>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600">
                            See the live portal <FiArrowRight />
                        </Link>
                        <Link href="/#stock" className="inline-flex items-center gap-2 rounded-xl border border-orange-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-orange-500 hover:bg-orange-500 hover:text-white">
                            Check stock
                        </Link>
                    </div>
                </Block>
            </div>
        </main>
    );
}
