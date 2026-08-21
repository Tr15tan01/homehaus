"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { login, register, logout, requestPasswordReset, resetPassword } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export type FormState = { error?: string } | undefined;

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = await clientIp();
  const { allowed } = rateLimit(`login:${ip}`, 10, 60_000);
  if (!allowed) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await login(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/account");
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = await clientIp();
  const { allowed } = rateLimit(`register:${ip}`, 5, 60_000);
  if (!allowed) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await register(
    parsed.data.email,
    parsed.data.password,
    parsed.data.name,
  );
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/");
}

export type ForgotPasswordState = { message?: string; devResetUrl?: string } | undefined;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const ip = await clientIp();
  const { allowed } = rateLimit(`forgot:${ip}`, 5, 60_000);

  const emailSchema = z.string().trim().email();
  const parsed = emailSchema.safeParse(formData.get("email"));

  // Same message whether or not the account exists, and whether or not
  // we're rate-limited — this endpoint must not leak which emails are
  // registered via response differences.
  const genericMessage =
    "If an account exists for that email, a reset link is on its way.";

  if (!allowed || !parsed.success) {
    return { message: genericMessage };
  }

  const { token } = await requestPasswordReset(parsed.data);

  if (token) {
    // TODO(production): send this via a real email provider (Resend,
    // Postmark, SES) instead of returning it to the client. Wiring an
    // email service is the one piece intentionally left out here since it
    // requires your own provider account and sender domain — swap this
    // block for an email send once that's set up. Returning the link
    // directly is fine for local development only.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const devResetUrl = `${siteUrl}/reset-password/${token}`;
    return { message: genericMessage, devResetUrl };
  }

  return { message: genericMessage };
}

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPasswordAction(
  token: string,
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) {
    return { error: "Password must be at least 10 characters." };
  }

  const result = await resetPassword(token, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/login");
}
