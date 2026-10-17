"use client";

import clsx from "clsx";
import { digitsOnly } from "@/lib/validation";
import { Field, FormError, Input, Select } from "./Field";

/**
 * Renders a grid of inputs from field definitions:
 * { name, label, placeholder, type, inputMode, maxLength, required, span, digits, upper, options }
 * `options` turns the field into a Select. Errors are shown under each field.
 */
export default function FormFields({ fields, values, errors = {}, onChange, idPrefix = "", className }) {
    const handle = (field) => (e) => {
        let value = e.target.value;
        if (field.digits) value = digitsOnly(value);
        if (field.upper) value = value.toUpperCase();
        onChange(field.name, value);
    };

    return (
        <div className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
            {fields.map((field) => {
                const { name, label, span, digits, upper, options, required, placeholder, ...input } = field;
                const id = `${idPrefix}${name}`;
                return (
                    <Field key={name} label={required ? `${label} *` : label} htmlFor={id} className={span ? "sm:col-span-2" : ""}>
                        {options ? (
                            <Select id={id} required={required} placeholder={placeholder} options={options} value={values[name] || ""} onChange={handle(field)} />
                        ) : (
                            <Input id={id} placeholder={placeholder} value={values[name] || ""} onChange={handle(field)} aria-invalid={Boolean(errors[name])} {...input} />
                        )}
                        <FormError>{errors[name]}</FormError>
                    </Field>
                );
            })}
        </div>
    );
}
