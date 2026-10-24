"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";

// Route-level error boundary for every page under the root layout.
export default function RouteError({ error, reset }) {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            console.error("Unhandled portal error:", error);
        }
    }, [error]);

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#0B0F19]">
            <div className="mx-auto max-w-2xl w-full">
                <ErrorState
                    title="Unexpected Application Error"
                    message={error?.message || "We encountered an issue loading this section. Please try again or return to the main portal."}
                    onRetry={reset}
                    retryText="Try Again"
                    action={
                        <Button href="/" variant="outline" size="md">
                            Back to Home
                        </Button>
                    }
                />
            </div>
        </main>
    );
}
