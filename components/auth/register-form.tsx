"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/app/(auth)/actions";
import SubmitButton from "@/components/ui/submit-button";
import type { Dictionary } from "@/lib/i18n";

export default function RegisterForm({ dict }: { dict: Dictionary }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    registerAction,
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
        <label htmlFor="name" className="text-sm font-medium text-ink">
          {dict.auth.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          {dict.auth.email}
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
        <label htmlFor="password" className="text-sm font-medium text-ink">
          {dict.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm outline-none focus:border-moss"
        />
        <p className="text-xs text-ink-soft">{dict.auth.passwordHint}</p>
      </div>

      <SubmitButton className="w-full" pendingText={dict.auth.creatingAccount}>
        {dict.auth.createAccount}
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        {dict.auth.alreadyHaveAccount}{" "}
        <Link href="/login" className="text-moss underline underline-offset-2">
          {dict.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
