"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, Badge, FormFields, FormError, ErrorState, EmptyState, Select, SkeletonRows } from "@/ui";
import { useUiStore } from "@/store/ui.store";
import { addSalesman, updateSalesman } from "@/services/AccountService";
import { validateFields } from "@/forms/AccountForms";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import { Notice, PanelHeader } from "./AccountUi";

const BLANK = { name: "", phone: "", email: "", branchCode: "ALL" };

const useBranchOptions = () => {
    const branches = useAccountStore((s) => s.account?.branches);
    return [
        { value: "ALL", label: "All branches" },
        ...(branches || []).map((b) => ({ value: b.branchCode, label: `${b.branchName} (${b.branchCode})` })),
    ];
};

function AddMemberForm({ onDone }) {
    const refresh = useAccountStore((s) => s.refresh);
    const loadTeam = useAccountStore((s) => s.loadTeam);
    const notify = useUiStore((s) => s.notify);
    const branchOptions = useBranchOptions();
    const [form, setForm] = useState(BLANK);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const fields = [
        { name: "name", label: "Full name", placeholder: "Salesman Name", required: true },
        { name: "phone", label: "Mobile (login OTP)", placeholder: "10-digit mobile number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
        { name: "branchCode", label: "Orders for", options: branchOptions, required: true },
        { name: "email", label: "Email", placeholder: "Optional", type: "email" },
    ];

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const found = validateFields(fields, form);
        setErrors(found);
        if (Object.keys(found).length) return;

        setError("");
        setSaving(true);
        try {
            const res = await addSalesman({ ...form, name: form.name.trim(), email: form.email.trim() });
            notify("success", res.message || `${form.name.trim()} can now log in with ${form.phone} and order for your business.`);
            await Promise.all([loadTeam({ force: true }), refresh()]);
            onDone();
        } catch (err) {
            setError(err.message || "Could not add this team member.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <FormFields fields={fields} values={form} errors={errors} onChange={onChange} idPrefix="member-" />
            <Notice>They log in with this mobile number and order for your business at your trade prices and credit terms.</Notice>
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>Cancel</Button>
                <Button type="submit" size="md" loading={saving} loadingText="Adding…">Add Team Member</Button>
            </div>
        </form>
    );
}

function MemberRow({ member }) {
    const refresh = useAccountStore((s) => s.refresh);
    const removeSalesman = useAccountStore((s) => s.removeSalesman);
    const notify = useUiStore((s) => s.notify);
    const branchOptions = useBranchOptions();
    const [mode, setMode] = useState(null); // null | "edit" | "remove"
    const [branchCode, setBranchCode] = useState(member.branchCode || "ALL");
    const [busy, setBusy] = useState(false);

    const memberId = member.id || member.userId;
    const isOwner = member.role === "owner";
    const branchLabel = member.branchCode === "ALL" || !member.branchCode ? "All branches" : `${member.branchName || member.branchCode} (${member.branchCode})`;

    const run = async (task, success) => {
        setBusy(true);
        try {
            await task();
            notify("success", success);
            setMode(null);
        } catch (err) {
            notify("error", err?.message || "Something went wrong. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const saveBranch = () =>
        run(async () => {
            await updateSalesman(memberId, { branchCode });
            await refresh();
        }, `${member.name} now orders for ${branchCode === "ALL" ? "all branches" : branchCode}.`);

    const remove = () => run(() => removeSalesman(memberId), `Removed ${member.name} from your business account.`);

    return (
        <li className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs sm:flex-row sm:items-center">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-white">{member.name || member.phone}</span>
                    <Badge tone={isOwner ? "orange" : "sky"} className="capitalize">{isOwner ? "Owner" : "Salesman"}</Badge>
                    {!member.isActive && <Badge tone="red">Inactive</Badge>}
                </div>
                <p className="text-[11px] text-zinc-400">
                    {[member.phone, member.email, `Orders for: ${isOwner ? "All branches" : branchLabel}`].filter(Boolean).join(" · ")}
                </p>
            </div>

            {isOwner ? null : mode === "edit" ? (
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        aria-label={`Branch for ${member.name}`}
                        className="!py-2 !text-xs min-w-[180px]"
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        options={branchOptions}
                    />
                    <Button size="sm" loading={busy} loadingText="Saving…" disabled={branchCode === (member.branchCode || "ALL")} onClick={saveBranch}>
                        Save
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode(null)}>Cancel</Button>
                </div>
            ) : mode === "remove" ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
                    <span className="font-bold text-red-200">Remove {member.name}?</span>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={remove}
                        className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
                    >
                        {busy ? "Removing…" : "Yes, Remove"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => setMode(null)} className="rounded-lg px-2 py-1 text-[11px] text-zinc-400 hover:text-white transition">
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setBranchCode(member.branchCode || "ALL");
                            setMode("edit");
                        }}
                        title={`Change branch for ${member.name}`}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 transition shrink-0"
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("remove")}
                        title={`Remove ${member.name}`}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition shrink-0"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            )}
        </li>
    );
}

// Salesmen who order for the business with their own login (account owner only).
export default function TeamPanel() {
    const isOwner = useAccountStore(selectIsOwner);
    const team = useAccountStore((s) => s.team);
    const teamStatus = useAccountStore((s) => s.teamStatus);
    const loadTeam = useAccountStore((s) => s.loadTeam);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (isOwner) loadTeam();
    }, [isOwner, loadTeam]);

    if (!isOwner) return <Notice>Only the account owner can see and manage the team.</Notice>;

    return (
        <div className="space-y-4">
            <PanelHeader
                title={`Team & Salesmen (${team.length})`}
                description="Each salesman logs in with their own mobile number and orders for your business."
                action={!adding && <Button size="sm" onClick={() => setAdding(true)}><FiPlus /> Add Member</Button>}
            />

            {adding && <AddMemberForm onDone={() => setAdding(false)} />}

            {teamStatus === "error" ? (
                <ErrorState
                    compact
                    title="Failed to Load Team"
                    message="Could not load your team members. Please check your connection."
                    onRetry={() => loadTeam({ force: true })}
                />
            ) : teamStatus === "loading" && !team.length ? (
                <SkeletonRows count={3} />
            ) : !team.length ? (
                <EmptyState
                    compact
                    title="No Team Members Yet"
                    description="Add your salesmen so they can order with their own login."
                    actionText={!adding ? "Add Member" : undefined}
                    onAction={() => setAdding(true)}
                />
            ) : (
                <ul className="custom-scroll max-h-96 space-y-2.5 overflow-y-auto">
                    {team.map((member) => (
                        <MemberRow key={member.id || member.userId} member={member} />
                    ))}
                </ul>
            )}
        </div>
    );
}
