"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge, Button, Card, ConfirmInline, EmptyState, ErrorState, FormActions, FormError, FormFields, PanelHeader, SkeletonRows, } from "@/components/ui";
import { ADDRESS_FIELDS, ADDRESS_KEYS } from "@/constants/forms";
import useAsyncAction from "@/hooks/useAsyncAction";
import useForm from "@/hooks/useForm";
import { formatDate, formatINR } from "@/lib/format";
import { formatAddress, trimValues } from "@/lib/formHelpers";
import { addBranch, removeBranch, updateBranch } from "@/services/AccountService";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import { useUiStore } from "@/store/uiStore";

const BRANCH_CODE = /^[A-Z0-9_-]{1,20}$/;

const CODE_FIELD = {
    name: "branchCode",
    label: "Branch code",
    placeholder: "e.g. KOR",
    maxLength: 20,
    upper: true,
    required: true,
};

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

const DETAIL_KEYS = ["branchName", "contactPerson", "phone", "email", "gstin"];

const addressChanged = (values, branch) =>
    ADDRESS_KEYS.some((key) => String(values[key] ?? "").trim() !== (branch?.address?.[key] || ""));

// Extra rules for a new branch code on top of the field rules.
const branchCodeError = (code) => {
    if (code === "ALL") return '"ALL" is reserved. Choose another code.';
    if (code && !BRANCH_CODE.test(code)) return 'Use letters, numbers, "-" or "_" (up to 20 characters).';
    return null;
};

function BranchForm({ branch, onDone }) {
    const refresh = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const isEdit = Boolean(branch);
    const fields = isEdit ? DETAIL_FIELDS : [CODE_FIELD, ...DETAIL_FIELDS];
    const { values, errors, onChange, validate } = useForm(() => toForm(branch));
    const { run, busy, error } = useAsyncAction();

    const submit = (e) => {
        e.preventDefault();
        const address = trimValues(values, ADDRESS_KEYS);
        // Editing a branch that never had an address: the address fields stay optional.
        const skipAddress = isEdit && !branch.address && Object.values(address).every((v) => !v);
        const code = values.branchCode.trim();
        const codeError = isEdit ? null : branchCodeError(code);
        const valid = validate(
            skipAddress ? fields.filter((f) => !ADDRESS_KEYS.includes(f.name)) : fields,
            codeError ? { branchCode: codeError } : {}
        );
        if (!valid) return;

        const payload = {
            ...trimValues(values, DETAIL_KEYS),
            ...(!isEdit || addressChanged(values, branch) ? { address } : {}),
        };

        run(() => (isEdit ? updateBranch(branch.branchCode, payload) : addBranch({ branchCode: code, ...payload })), {
            fallback: "Could not save the branch.",
            onSuccess: async (res) => {
                notify("success", res?.message || `Branch ${payload.branchName} saved.`);
                await refresh();
                onDone();
            },
        });
    };

    return (
        <Card variant="glass" className="shadow-sm">
            <form onSubmit={submit} className="space-y-4">
                {isEdit && (
                    <p className="text-xs font-bold text-zinc-300">
                        Editing{" "}
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                            {branch.branchCode}
                        </span>
                    </p>
                )}
                <FormFields
                    fields={fields}
                    values={values}
                    errors={errors}
                    onChange={onChange}
                    idPrefix={isEdit ? `branch-${branch.branchCode}-` : "branch-"}
                />
                <FormError>{error}</FormError>
                <FormActions onCancel={onDone} busy={busy} submitLabel={isEdit ? "Save Branch" : "Add Branch"} />
            </form>
        </Card>
    );
}

function BranchCard({ branch, canManage, onEdit }) {
    const refresh = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const [confirming, setConfirming] = useState(false);
    const { run, busy: removing } = useAsyncAction();

    const remove = () =>
        run(() => removeBranch(branch.branchCode), {
            fallback: "Could not remove the branch.",
            onSuccess: async (res) => {
                notify("success", res?.message || `Branch ${branch.branchCode} removed.`);
                await refresh();
            },
            onError: (message) => {
                notify("error", message);
                setConfirming(false);
            },
        });

    const stats = branch.stats || {};

    return (
        <li className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.07] transition-colors p-3.5 text-xs shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-black text-white">
                    <FiMapPin className="shrink-0 text-orange-400" /> <span className="break-words">{branch.branchName}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                        {branch.branchCode}
                    </span>
                    {branch.isHeadOffice && <Badge tone="orange">Head office</Badge>}
                </p>
                {canManage && !confirming && (
                    <div className="flex shrink-0 gap-1.5">
                        <Button
                            variant="muted"
                            size="xs"
                            iconOnly
                            onClick={onEdit}
                            title={`Edit ${branch.branchName}`}
                            aria-label={`Edit ${branch.branchName}`}
                            icon={<FiEdit2 size={13} />}
                        />
                        {!branch.isHeadOffice && (
                            <Button
                                variant="muted-danger"
                                size="xs"
                                iconOnly
                                onClick={() => setConfirming(true)}
                                title={`Remove ${branch.branchName}`}
                                aria-label={`Remove ${branch.branchName}`}
                                icon={<FiTrash2 size={13} />}
                            />
                        )}
                    </div>
                )}
            </div>

            <p className="text-zinc-400">{formatAddress(branch.address) || "Address not added"}</p>
            {(branch.contactPerson || branch.phone || branch.email) && (
                <p className="break-words text-zinc-500">
                    {[branch.contactPerson, branch.phone, branch.email].filter(Boolean).join(" · ")}
                </p>
            )}
            {(branch.gstin || branch.manager) && (
                <p className="break-words text-zinc-500">
                    {[
                        branch.gstin && `GSTIN ${branch.gstin}`,
                        branch.manager && `Manager: ${branch.manager.name || branch.manager.phone}`,
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
            )}
            <p className="border-t border-white/5 pt-2 text-[11px] text-zinc-400">
                {stats.totalOrders || 0} orders · {formatINR(stats.totalSpent || 0)}
                {stats.lastOrderedAt && ` · Last ${formatDate(stats.lastOrderedAt)}`}
            </p>

            {confirming && (
                <ConfirmInline
                    prompt={`Remove ${branch.branchCode}?`}
                    busy={removing}
                    onConfirm={remove}
                    onCancel={() => setConfirming(false)}
                />
            )}
        </li>
    );
}

export default function BranchesPanel() {
    const branches = useAccountStore((s) => s.branches);
    const branchesStatus = useAccountStore((s) => s.branchesStatus);
    const loadBranches = useAccountStore((s) => s.loadBranches);
    const isOwner = useAccountStore(selectIsOwner);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    return (
        <div className="space-y-4">
            <PanelHeader
                title={`Branches (${branches.length})`}
                description="Pick a branch at checkout to bill and dispatch to that location."
                action={
                    isOwner &&
                    !editing && (
                        <Button variant="soft" size="sm" icon={<FiPlus size={14} />} onClick={() => setEditing("new")}>
                            Add Branch
                        </Button>
                    )
                }
            />

            {editing === "new" && <BranchForm onDone={() => setEditing(null)} />}

            {branchesStatus === "error" ? (
                <ErrorState
                    compact
                    title="Failed to Load Branches"
                    message="Could not load your branches. Please check your connection."
                    onRetry={() => loadBranches({ force: true })}
                />
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
                            <BranchCard
                                key={branch.id || branch.branchCode}
                                branch={branch}
                                canManage={isOwner && !editing}
                                onEdit={() => setEditing(branch.branchCode)}
                            />
                        )
                    )}
                </ul>
            )}
        </div>
    );
}
