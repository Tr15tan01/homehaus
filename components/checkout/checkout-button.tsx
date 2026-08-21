"use client";

import { useState } from "react";

export default function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-error">
          {error}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        aria-busy={loading}
        className="inline-flex items-center justify-center rounded-full bg-moss px-8 py-3.5 text-sm font-medium text-white transition hover:bg-moss-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Continue to payment"}
      </button>
    </div>
  );
}
