"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/(auth)/actions";
import SubmitButton from "@/components/ui/submit-button";

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && (
        <p className="rounded-lg border border-stone bg-surface px-4 py-3 text-sm text-ink-soft">
          {state.message}
        </p>
      )}

      {state?.devResetUrl && (
        <p className="rounded-lg border border-brass/40 bg-brass/10 px-4 py-3 text-xs text-ink-soft">
          Dev mode (no email provider configured):{" "}
          <a href={state.devResetUrl} className="text-moss underline break-all">
            {state.devResetUrl}
          </a>
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
      </div>

      <SubmitButton className="w-full" pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
