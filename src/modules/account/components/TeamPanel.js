"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiUserCheck, FiTrash2 } from "react-icons/fi";
import Button from "@/ui/Button";
import Badge from "@/ui/Badge";
import FormFields from "@/ui/FormFields";
import { FormError } from "@/ui/Field";
import { formatINR, formatDate } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { addSalesman } from "../account.api";
import { validateFields } from "../account.forms";
import { useAccountStore, selectIsManager } from "../account.store";
import { Notice, PanelHeader, Skeleton } from "./AccountUi";

const BLANK = { name: "", phone: "", email: "", role: "salesman", branchCode: "ALL", perOrderLimit: "" };

function AddMemberForm({ onDone }) {
    const account = useAccountStore((s) => s.account);
    const refresh = useAccountStore((s) => s.refresh);
    const loadTeam = useAccountStore((s) => s.loadTeam);
    const notify = useUiStore((s) => s.notify);
    const [form, setForm] = useState(BLANK);
    const [canOrderOnCredit, setCanOrderOnCredit] = useState(true);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Only the owner can add managers; branch list comes from the business account.
    const roles = [
        { value: "salesman", label: "Salesman" },
        { value: "purchaser", label: "Purchaser" },
        ...(account?.myRole === "owner" ? [{ value: "manager", label: "Branch Manager" }] : []),
    ];
    const branches = [
        { value: "ALL", label: "All branches" },
        ...(account?.branches || []).map((b) => ({ value: b.branchCode, label: `${b.branchName} (${b.branchCode})` })),
    ];
    const fields = [
        { name: "name", label: "Full name", placeholder: "Salesman Name", required: true },
        { name: "phone", label: "Mobile (login OTP)", placeholder: "10-digit mobile number", type: "tel", inputMode: "numeric", maxLength: 10, digits: true, required: true },
        { name: "role", label: "Role", options: roles, required: true },
        { name: "branchCode", label: "Branch", options: branches, required: true },
        { name: "email", label: "Email", placeholder: "Optional", type: "email" },
        { name: "perOrderLimit", label: "Max per order (₹)", placeholder: "0 = no limit", inputMode: "numeric", digits: true },
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
            await addSalesman({ ...form, name: form.name.trim(), perOrderLimit: Number(form.perOrderLimit) || 0, canOrderOnCredit });
            notify("success", `${form.name.trim()} can now log in with ${form.phone} and order for your business.`);
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
            <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/10 bg-black/20 p-3">
                <input type="checkbox" checked={canOrderOnCredit} onChange={(e) => setCanOrderOnCredit(e.target.checked)} className="accent-orange-500" />
                <span className="text-xs">
                    <span className="block font-bold text-white">Allow ordering on business credit</span>
                    <span className="text-[11px] text-zinc-400">Orders are charged to your company credit line.</span>
                </span>
            </label>
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>Cancel</Button>
                <Button type="submit" size="md" disabled={saving}>{saving ? "Adding…" : "Add Team Member"}</Button>
            </div>
        </form>
    );
}

// Salesmen / managers under the business with their ordering stats (owner & managers only).
export default function TeamPanel({ onFilterOrders }) {
    const account = useAccountStore((s) => s.account);
    const isManager = useAccountStore(selectIsManager);
    const team = useAccountStore((s) => s.team);
    const teamStatus = useAccountStore((s) => s.teamStatus);
    const loadTeam = useAccountStore((s) => s.loadTeam);
    const removeSalesman = useAccountStore((s) => s.removeSalesman);
    const notify = useUiStore((s) => s.notify);

    const [adding, setAdding] = useState(false);
    const [confirmingId, setConfirmingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (isManager) loadTeam();
    }, [isManager, loadTeam]);

    const handleRemove = async (member) => {
        const id = member.id || member.userId;
        setDeletingId(id);
        try {
            await removeSalesman(id);
            notify("success", `Removed ${member.name} from your business account.`);
            setConfirmingId(null);
        } catch (err) {
            notify("error", err?.message || "Failed to remove team member.");
        } finally {
            setDeletingId(null);
        }
    };

    if (!isManager) return <Notice>Only the account owner or a manager can see and manage the team.</Notice>;

    return (
        <div className="space-y-4">
            <PanelHeader
                title={`Team & Salesmen (${team.length})`}
                action={!adding && <Button size="sm" onClick={() => setAdding(true)}><FiPlus /> Add Member</Button>}
            />

            {adding && <AddMemberForm onDone={() => setAdding(false)} />}

            {teamStatus === "loading" && !team.length ? (
                <Skeleton />
            ) : !team.length ? (
                <Notice>No team members yet. Add your salesmen so they can order with their own login.</Notice>
            ) : (
                <ul className="custom-scroll max-h-96 space-y-2.5 overflow-y-auto">
                    {team.map((member) => {
                        const memberId = member.id || member.userId;
                        const isOwner = member.role === "owner";
                        const isSelf = String(member.userId) === String(account?.id);
                        const canRemove = !isOwner && !isSelf && (account?.myRole === "owner" || member.role !== "manager");

                        return (
                            <li key={memberId} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs sm:flex-row sm:items-center">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-black text-white">{member.name}</span>
                                        <Badge tone="orange" className="capitalize">{member.role}</Badge>
                                        <Badge tone={member.canOrderOnCredit ? "green" : "sky"}>{member.canOrderOnCredit ? "Credit ordering" : "Prepaid only"}</Badge>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">
                                        {member.phone} · Branch: {member.branchCode || "ALL"}
                                        {member.perOrderLimit > 0 && ` · Max ${formatINR(member.perOrderLimit)} per order`}
                                    </p>
                                </div>

                                {confirmingId === memberId ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
                                        <span className="font-bold text-red-200">Remove {member.name}?</span>
                                        <button
                                            type="button"
                                            disabled={deletingId === memberId}
                                            onClick={() => handleRemove(member)}
                                            className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
                                        >
                                            {deletingId === memberId ? "Removing…" : "Yes, Remove"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deletingId === memberId}
                                            onClick={() => setConfirmingId(null)}
                                            className="rounded-lg px-2 py-1 text-[11px] text-zinc-400 hover:text-white transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Orders placed</span>
                                            <span className="text-sm font-black text-white">{member.totalOrders || 0}</span>
                                            <span className="block text-[11px] font-semibold text-orange-400">{formatINR(member.totalSpent || 0)}</span>
                                            {member.lastOrderedAt && <span className="block text-[10px] text-zinc-500">Last: {formatDate(member.lastOrderedAt)}</span>}
                                        </div>
                                        {onFilterOrders && (
                                            <Button size="sm" variant="outline" className="shrink-0" onClick={() => onFilterOrders({ id: String(member.userId), name: member.name })}>
                                                <FiUserCheck /> Orders
                                            </Button>
                                        )}
                                        {canRemove && (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmingId(memberId)}
                                                title={`Remove ${member.name}`}
                                                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition shrink-0"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
