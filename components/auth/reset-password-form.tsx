"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/(auth)/actions";
import SubmitButton from "@/components/ui/submit-button";

export default function ResetPasswordForm({ token }: { token: string }) {
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    boundAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
      </div>

      <SubmitButton className="w-full" pendingText="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
