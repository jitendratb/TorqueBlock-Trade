"use client";

import { useCallback, useState } from "react";
import { validateFields } from "@/lib/formHelpers";

/**
 * Form values + per-field errors for forms rendered with ui/FormFields.
 *
 *   const form = useForm(() => toForm(branch));
 *   <FormFields fields={FIELDS} values={form.values} errors={form.errors} onChange={form.onChange} />
 *   if (!form.validate(FIELDS)) return;
 *
 * Typing in a field clears that field's error.
 */
export default function useForm(initialValues = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const onChange = useCallback((name, value) => {
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => (current[name] ? { ...current, [name]: "" } : current));
    }, []);

    // Runs the field rules (plus any extra errors the caller found). Returns true when valid.
    const validate = useCallback(
        (fields, extraErrors = {}) => {
            const found = { ...validateFields(fields, values), ...extraErrors };
            setErrors(found);
            return Object.keys(found).length === 0;
        },
        [values]
    );

    return { values, setValues, errors, setErrors, onChange, validate };
}
