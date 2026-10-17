"use client";

import { useState } from "react";
import { FiMapPin, FiPlus } from "react-icons/fi";
import Button from "@/ui/Button";
import FormFields from "@/ui/FormFields";
import { FormError } from "@/ui/Field";
import { useUiStore } from "@/store/ui.store";
import { addBranch } from "../account.api";
import { ADDRESS_FIELDS, validateFields } from "../account.forms";
import { useAccountStore, selectIsManager } from "../account.store";
import { Notice, PanelHeader } from "./AccountUi";

const BRANCH_FIELDS = [
    { name: "branchCode", label: "Branch code", placeholder: "e.g. KOR", maxLength: 10, upper: true, required: true },
    { name: "branchName", label: "Branch name", placeholder: "e.g. Koramangala Store", required: true },
    { name: "contactPerson", label: "Contact person", placeholder: "Optional" },
    { name: "phone", label: "Phone", placeholder: "10-digit mobile", type: "tel", inputMode: "numeric", maxLength: 10, digits: true },
    { name: "gstin", label: "GSTIN", placeholder: "If different from head office", maxLength: 15, upper: true, span: true },
    ...ADDRESS_FIELDS,
];
const BLANK = Object.fromEntries(BRANCH_FIELDS.map((f) => [f.name, ""]));
const ADDRESS_KEYS = ADDRESS_FIELDS.map((f) => f.name);

function AddBranchForm({ onDone }) {
    const refresh = useAccountStore((s) => s.refresh);
    const notify = useUiStore((s) => s.notify);
    const [form, setForm] = useState(BLANK);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const onChange = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const found = validateFields(BRANCH_FIELDS, form);
        if (form.branchCode.trim() === "ALL") found.branchCode = '"ALL" is reserved. Choose another code.';
        setErrors(found);
        if (Object.keys(found).length) return;

        setError("");
        setSaving(true);
        try {
            const { branchCode, branchName, contactPerson, phone, gstin } = form;
            await addBranch({
                branchCode: branchCode.trim(),
                branchName: branchName.trim(),
                contactPerson: contactPerson.trim(),
                phone,
                gstin: gstin.trim(),
                address: Object.fromEntries(ADDRESS_KEYS.map((key) => [key, form[key].trim()])),
            });
            notify("success", `Branch ${branchName.trim()} added.`);
            await refresh();
            onDone();
        } catch (err) {
            setError(err.message || "Could not add the branch.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <FormFields fields={BRANCH_FIELDS} values={form} errors={errors} onChange={onChange} idPrefix="branch-" />
            <FormError>{error}</FormError>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" size="md" onClick={onDone} disabled={saving}>Cancel</Button>
                <Button type="submit" size="md" disabled={saving}>{saving ? "Adding…" : "Add Branch"}</Button>
            </div>
        </form>
    );
}

// Delivery / billing branches of the business. Orders on credit are tagged with a branch.
export default function BranchesPanel() {
    const branches = useAccountStore((s) => s.account?.branches || []);
    const isManager = useAccountStore(selectIsManager);
    const [adding, setAdding] = useState(false);

    return (
        <div className="space-y-4">
            <PanelHeader
                title={`Branches (${branches.length})`}
                description="Pick a branch at checkout to bill and dispatch to that location."
                action={isManager && !adding && <Button size="sm" onClick={() => setAdding(true)}><FiPlus /> Add Branch</Button>}
            />

            {adding && <AddBranchForm onDone={() => setAdding(false)} />}

            {!branches.length ? (
                <Notice>No branches yet.</Notice>
            ) : (
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {branches.map((branch) => (
                        <li key={branch._id || branch.branchCode} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
                            <p className="flex items-center gap-2 text-sm font-black text-white">
                                <FiMapPin className="text-orange-400" /> {branch.branchName}
                                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">{branch.branchCode}</span>
                            </p>
                            <p className="mt-1 text-zinc-400">
                                {[branch.address?.addressLine1, branch.address?.city, branch.address?.state, branch.address?.pincode].filter(Boolean).join(", ") || "Address not added"}
                            </p>
                            {(branch.contactPerson || branch.phone) && (
                                <p className="mt-1 text-zinc-500">{[branch.contactPerson, branch.phone].filter(Boolean).join(" · ")}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
