"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge, Button, FormFields, FormError, EmptyState, ErrorState, SkeletonRows } from "@/ui";
import { formatDate, formatINR } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { addBranch, updateBranch, removeBranch } from "@/services/AccountService";
import { ADDRESS_FIELDS, ADDRESS_KEYS, formatAddress, validateFields } from "@/forms/AccountForms";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import { PanelHeader } from "./AccountUi";

const BRANCH_CODE = /^[A-Z0-9_-]{1,20}$/;

const CODE_FIELD = { name: "branchCode", label: "Branch code", placeholder: "e.g. KOR", maxLength: 20, upper: true, required: true };
const DETAIL_FIELDS = [
    { name: "branchName", label: "Branch name", placeholder: "e.g. Koramangala Store", required: true },
    { name: "contactPerson", label: "Contact person", placeholder: "Optional" },
    { name: "phone", label: "Phone", placeholder: "10-digit mobile", type: "tel", inputMode: "numeric", maxLength: 10, digits: true },
    { name: "email", label: "Email", placeholder: "Optional", type: "email" },
    { name: "gstin", label: "GSTIN", placeholder: "If different from head office", maxLength: 15, upper: true, span: true },
    ...ADDRESS_FIELDS,
];

const toForm = (branch) => ({
    branchCode: branch?.branchCode || "",
    branchName: branch?.branchName || "",
    contactPerson: branch?.contactPerson || "",
    phone: branch?.phone || "",
    email: branch?.email || "",
    gstin: branch?.gstin || "",
    ...Object.fromEntries(ADDRESS_KEYS.map((key) => [key, branch?.address?.[key] || ""])),
});

// The backend stores a new address every time one is sent, so an edit only sends it when it changed.
const addressChanged = (form, branch) => ADDRESS_KEYS.some((key) => form[key].trim() !== (branch?.address?.[key] || ""));

function BranchForm({ branch, onDone }) {
    const refresh = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const isEdit = Boolean(branch);
    const fields = isEdit ? DETAIL_FIELDS : [CODE_FIELD, ...DETAIL_FIELDS];
    const [form, setForm] = useState(() => toForm(branch));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const submit = async (e) => {
        e.preventDefault();
        // A branch saved without an address (e.g. the head office) can be edited without adding one.
        const skipAddress = isEdit && !branch.address && ADDRESS_KEYS.every((key) => !form[key].trim());
        const found = validateFields(skipAddress ? fields.filter((f) => !ADDRESS_KEYS.includes(f.name)) : fields, form);
        const code = form.branchCode.trim();
        if (!isEdit && code && !BRANCH_CODE.test(code)) found.branchCode = 'Use letters, numbers, "-" or "_" (up to 20 characters).';
        if (!isEdit && code === "ALL") found.branchCode = '"ALL" is reserved. Choose another code.';
        setErrors(found);
        if (Object.keys(found).length) return;

        const payload = {
            branchName: form.branchName.trim(),
            contactPerson: form.contactPerson.trim(),
            phone: form.phone,
            email: form.email.trim(),
            gstin: form.gstin.trim(),
            ...(!isEdit || addressChanged(form, branch)
                ? { address: Object.fromEntries(ADDRESS_KEYS.map((key) => [key, form[key].trim()])) }
                : {}),
        };

        setError("");
        setSaving(true);
        try {
            const res = isEdit ? await updateBranch(branch.branchCode, payload) : await addBranch({ branchCode: code, ...payload });
            notify("success", res.message || `Branch ${payload.branchName} saved.`);
            await refresh();
            onDone();
        } catch (err) {
            setError(err.message || "Could not save the branch.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            {isEdit && (
                <p className="text-xs font-bold text-zinc-300">
                    Editing <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">{branch.branchCode}</span>
                </p>
            )}
            <FormFields fields={fields} values={form} errors={errors} onChange={onChange} idPrefix={isEdit ? `branch-${branch.branchCode}-` : "branch-"} />
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>Cancel</Button>
                <Button type="submit" size="md" loading={saving} loadingText="Saving…">{isEdit ? "Save Branch" : "Add Branch"}</Button>
            </div>
        </form>
    );
}

function BranchCard({ branch, canManage, onEdit }) {
    const refresh = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const [confirming, setConfirming] = useState(false);
    const [removing, setRemoving] = useState(false);

    const remove = async () => {
        setRemoving(true);
        try {
            const res = await removeBranch(branch.branchCode);
            notify("success", res.message || `Branch ${branch.branchCode} removed.`);
            await refresh();
        } catch (err) {
            // e.g. BRANCH_HAS_SALESMEN — move them to another branch first.
            notify("error", err.message || "Could not remove the branch.");
            setConfirming(false);
        } finally {
            setRemoving(false);
        }
    };

    const stats = branch.stats || {};

    return (
        <li className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
            <div className="flex items-start justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 text-sm font-black text-white">
                    <FiMapPin className="text-orange-400" /> {branch.branchName}
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">{branch.branchCode}</span>
                    {branch.isHeadOffice && <Badge tone="orange">Head office</Badge>}
                </p>
                {canManage && !confirming && (
                    <div className="flex shrink-0 gap-1.5">
                        <button type="button" onClick={onEdit} title={`Edit ${branch.branchName}`} className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-orange-500/30 hover:text-orange-400">
                            <FiEdit2 size={13} />
                        </button>
                        {!branch.isHeadOffice && (
                            <button type="button" onClick={() => setConfirming(true)} title={`Remove ${branch.branchName}`} className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:border-red-500/30 hover:text-red-400">
                                <FiTrash2 size={13} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <p className="text-zinc-400">{formatAddress(branch.address) || "Address not added"}</p>
            {(branch.contactPerson || branch.phone || branch.email) && (
                <p className="text-zinc-500">{[branch.contactPerson, branch.phone, branch.email].filter(Boolean).join(" · ")}</p>
            )}
            {(branch.gstin || branch.manager) && (
                <p className="text-zinc-500">{[branch.gstin && `GSTIN ${branch.gstin}`, branch.manager && `Manager: ${branch.manager.name || branch.manager.phone}`].filter(Boolean).join(" · ")}</p>
            )}
            <p className="border-t border-white/5 pt-2 text-[11px] text-zinc-400">
                {stats.totalOrders || 0} orders · {formatINR(stats.totalSpent || 0)}
                {stats.lastOrderedAt && ` · Last ${formatDate(stats.lastOrderedAt)}`}
            </p>

            {confirming && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-300">
                    <span className="font-bold text-red-200">Remove {branch.branchCode}?</span>
                    <button type="button" disabled={removing} onClick={remove} className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-red-500 disabled:opacity-50">
                        {removing ? "Removing…" : "Yes, Remove"}
                    </button>
                    <button type="button" disabled={removing} onClick={() => setConfirming(false)} className="rounded-lg px-2 py-1 text-[11px] text-zinc-400 transition hover:text-white">
                        Cancel
                    </button>
                </div>
            )}
        </li>
    );
}

// Branches of the business. Every trade order is tagged with one; the owner adds, edits and removes them.
export default function BranchesPanel() {
    const branches = useAccountStore((s) => s.branches);
    const branchesStatus = useAccountStore((s) => s.branchesStatus);
    const loadBranches = useAccountStore((s) => s.loadBranches);
    const isOwner = useAccountStore(selectIsOwner);
    const [editing, setEditing] = useState(null); // null | "new" | branchCode

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    return (
        <div className="space-y-4">
            <PanelHeader
                title={`Branches (${branches.length})`}
                description="Pick a branch at checkout to bill and dispatch to that location."
                action={isOwner && !editing && <Button size="sm" onClick={() => setEditing("new")}><FiPlus /> Add Branch</Button>}
            />

            {editing === "new" && <BranchForm onDone={() => setEditing(null)} />}

            {branchesStatus === "error" ? (
                <ErrorState compact title="Failed to Load Branches" message="Could not load your branches. Please check your connection." onRetry={() => loadBranches({ force: true })} />
            ) : branchesStatus === "loading" && !branches.length ? (
                <SkeletonRows count={2} />
            ) : !branches.length ? (
                <EmptyState
                    compact
                    icon={<FiMapPin />}
                    title="No Branches Added"
                    description="Add branches to allow ordering and billing directly to specific store locations."
                    actionText={isOwner && !editing ? "Add Branch" : undefined}
                    onAction={() => setEditing("new")}
                />
            ) : (
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {branches.map((branch) =>
                        editing === branch.branchCode ? (
                            <li key={branch.id || branch.branchCode} className="sm:col-span-2">
                                <BranchForm branch={branch} onDone={() => setEditing(null)} />
                            </li>
                        ) : (
                            <BranchCard key={branch.id || branch.branchCode} branch={branch} canManage={isOwner && !editing} onEdit={() => setEditing(branch.branchCode)} />
                        )
                    )}
                </ul>
            )}
        </div>
    );
}
