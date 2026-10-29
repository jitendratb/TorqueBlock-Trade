"use client";

import React from "react";
import ErrorState from "./ErrorState";
import Button from "./Button";

/**
 * React Error Boundary component to prevent whole-tree crashes.
 * Wraps complex modules (StockList, OrderHistory, Checkout, Account).
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.NODE_ENV !== "production") {
            console.error("ErrorBoundary caught an error:", error, errorInfo);
        }
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return typeof this.props.fallback === "function"
                    ? this.props.fallback(this.state.error, this.reset)
                    : this.props.fallback;
            }

            return (
                <ErrorState
                    title={this.props.title || "Interface Error"}
                    message={
                        this.state.error?.message ||
                        "A runtime error occurred in this view. Please try reloading."
                    }
                    onRetry={this.reset}
                    retryText="Reload View"
                    action={
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    }
                    className={this.props.className}
                />
            );
        }

        return this.props.children;
    }
}
