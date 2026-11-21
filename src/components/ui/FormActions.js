import Button from "./Button";

// Cancel + submit row at the bottom of every inline form.
export default function FormActions({ onCancel, busy = false, submitLabel = "Save", busyLabel = "Saving…", icon }) {
    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancel && (
                <Button variant="ghost" size="md" onClick={onCancel} disabled={busy}>
                    Cancel
                </Button>
            )}
            <Button type="submit" size="md" icon={icon} loading={busy} loadingText={busyLabel}>
                {submitLabel}
            </Button>
        </div>
    );
}
