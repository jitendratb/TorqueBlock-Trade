"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error("Global application error:", error);
        if (error?.digest) {
            console.error("Global Error Digest:", error.digest);
        }
    }, [error]);

    return (
        <html lang="en">
            <body style={{ backgroundColor: "#0B0F19", color: "#ffffff", fontFamily: "sans-serif", margin: 0, padding: 0 }}>
                <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#f97316", marginBottom: "16px" }}>
                        Application Unavailable
                    </h1>
                    <p style={{ maxWidth: "500px", color: "#a1a1aa", marginBottom: "24px", lineHeight: "1.5" }}>
                        {error?.message || "An unexpected error occurred while loading the application. Please try reloading."}
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        style={{
                            backgroundColor: "#f97316",
                            color: "#ffffff",
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "none",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                </main>
            </body>
        </html>
    );
}

