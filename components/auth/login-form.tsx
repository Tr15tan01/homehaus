"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/app/(auth)/actions";
import SubmitButton from "@/components/ui/submit-button";

export default function LoginForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {state.error}
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-moss underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
      </div>

      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        New to HomeHaus?{" "}
        <Link href="/register" className="text-moss underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </form>
  );
}
