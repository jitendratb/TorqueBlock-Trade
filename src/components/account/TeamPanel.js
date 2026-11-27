"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import {
    Badge,
    Button,
    Card,
    ConfirmInline,
    EmptyState,
    ErrorState,
    FormActions,
    FormError,
    FormFields,
    Notice,
    PanelHeader,
    Select,
    SkeletonRows,
} from "@/components/ui";
import useAsyncAction from "@/hooks/useAsyncAction";
import useForm from "@/hooks/useForm";
import { trimValues } from "@/lib/formHelpers";
import { addSalesman, updateSalesman } from "@/services/AccountService";
import { useAccountStore, selectIsOwner } from "@/store/accountStore";
import { useUiStore } from "@/store/uiStore";

const BLANK = { name: "", phone: "", email: "", branchCode: "ALL" };
const MEMBER_KEYS = Object.keys(BLANK);

const STATUS = {
    active: { tone: "green", label: "Active" },
    pending: { tone: "amber", label: "Pending Approval" },
    inactive: { tone: "red", label: "Inactive" },
};

// Approved (or status "active") → Active; "pending" or no status yet → Pending; any other status → Inactive.
const memberStatus = (member) => {
    if (member.isApproved || member.status === "active") return STATUS.active;
    if (!member.status || member.status === "pending") return STATUS.pending;
    return STATUS.inactive;
};

const useBranchOptions = () => {
    const branches = useAccountStore((s) => s.account?.branches);
    return [
        { value: "ALL", label: "All branches" },
        ...(branches || []).map((b) => ({
            value: b.branchCode,
            label: `${b.branchName} (${b.branchCode})`,
        })),
    ];
};

function AddMemberForm({ onDone }) {
    const refresh = useAccountStore((s) => s.refresh);
    const loadTeam = useAccountStore((s) => s.loadTeam);
    const notify = useUiStore((s) => s.notify);
    const branchOptions = useBranchOptions();
    const { values, errors, onChange, validate } = useForm(BLANK);
    const { run, busy, error } = useAsyncAction();

    const fields = [
        { name: "name", label: "Full name", placeholder: "Salesman Name", required: true },
        {
            name: "phone",
            label: "Mobile (login OTP)",
            placeholder: "10-digit mobile number",
            type: "tel",
            inputMode: "numeric",
            maxLength: 10,
            digits: true,
            required: true,
        },
        { name: "branchCode", label: "Orders for", options: branchOptions, required: true },
        { name: "email", label: "Email", placeholder: "Optional", type: "email" },
    ];

    const submit = (e) => {
        e.preventDefault();
        if (!validate(fields)) return;

        const payload = trimValues(values, MEMBER_KEYS);
        run(() => addSalesman(payload), {
            fallback: "Could not add this team member.",
            onSuccess: async (res) => {
                notify("success", res?.message || `${payload.name} added. Once approved by admin, they can log in and order.`);
                await Promise.all([loadTeam({ force: true }), refresh()]);
                onDone();
            },
        });
    };

    return (
        <Card variant="glass" className="shadow-sm">
            <form onSubmit={submit} className="space-y-4">
                <FormFields fields={fields} values={values} errors={errors} onChange={onChange} idPrefix="member-" />
                <Notice>
                    Once approved by admin, they can log in with this mobile number and order for your business at your trade prices.
                </Notice>
                <FormError>{error}</FormError>
                <FormActions onCancel={onDone} busy={busy} submitLabel="Add Team Member" busyLabel="Adding…" />
            </form>
        </Card>
    );
}

function MemberRow({ member }) {
    const refresh = useAccountStore((s) => s.refresh);
    const removeSalesman = useAccountStore((s) => s.removeSalesman);
    const notify = useUiStore((s) => s.notify);
    const branchOptions = useBranchOptions();
    const [mode, setMode] = useState(null);
    const [branchCode, setBranchCode] = useState(member.branchCode || "ALL");
    const { run, busy } = useAsyncAction();

    const memberId = member.id || member.userId;
    const isOwner = member.role === "owner";
    const status = memberStatus(member);
    const branchLabel =
        member.branchCode === "ALL" || !member.branchCode
            ? "All branches"
            : `${member.branchName || member.branchCode} (${member.branchCode})`;

    const act = (task, success) =>
        run(task, {
            onSuccess: () => {
                notify("success", success);
                setMode(null);
            },
            onError: (message) => notify("error", message),
        });

    const saveBranch = () =>
        act(async () => {
            await updateSalesman(memberId, { branchCode });
            await refresh();
        }, `${member.name} now orders for ${branchCode === "ALL" ? "all branches" : branchCode}.`);

    const remove = () => act(() => removeSalesman(memberId), `Removed ${member.name} from your business account.`);

    return (
        <li className="space-y-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.07] transition-colors p-3 sm:p-3.5 text-xs shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="break-words text-sm font-black text-white">{member.name || member.phone}</span>
                        <Badge tone={isOwner ? "orange" : "sky"} className="capitalize">
                            {isOwner ? "Owner" : "Salesman"}
                        </Badge>
                        {!isOwner && <Badge tone={status.tone}>{status.label}</Badge>}
                    </div>
                    <div className="flex flex-col gap-0.5 text-[11px] text-zinc-400 sm:flex-row sm:flex-wrap sm:gap-x-3">
                        {member.phone && <span className="font-mono">{member.phone}</span>}
                        {member.email && <span className="break-all">{member.email}</span>}
                        <span>Orders for: {isOwner ? "All branches" : branchLabel}</span>
                    </div>
                </div>

                {!isOwner && !mode && (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                            variant="muted"
                            size="sm"
                            iconOnly
                            onClick={() => {
                                setBranchCode(member.branchCode || "ALL");
                                setMode("edit");
                            }}
                            title={`Change branch for ${member.name}`}
                            aria-label={`Change branch for ${member.name}`}
                            icon={<FiEdit2 size={14} />}
                        />
                        <Button
                            variant="muted-danger"
                            size="sm"
                            iconOnly
                            onClick={() => setMode("remove")}
                            title={`Remove ${member.name}`}
                            aria-label={`Remove ${member.name}`}
                            icon={<FiTrash2 size={14} />}
                        />
                    </div>
                )}
            </div>

            {isOwner ? null : mode === "edit" ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                        aria-label={`Branch for ${member.name}`}
                        className="!py-2 !text-xs w-full sm:w-auto sm:min-w-[200px]"
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        options={branchOptions}
                    />
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode(null)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            loading={busy}
                            loadingText="Saving…"
                            disabled={branchCode === (member.branchCode || "ALL")}
                            onClick={saveBranch}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            ) : mode === "remove" ? (
                <ConfirmInline
                    prompt={`Remove ${member.name}?`}
                    busy={busy}
                    onConfirm={remove}
                    onCancel={() => setMode(null)}
                />
            ) : null}
        </li>
    );
}

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
                action={
                    !adding && (
                        <Button variant="soft" size="sm" icon={<FiPlus size={14} />} onClick={() => setAdding(true)}>
                            Add Member
                        </Button>
                    )
                }
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
