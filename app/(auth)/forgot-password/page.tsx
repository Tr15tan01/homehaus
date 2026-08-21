import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl">
        HomeHaus
      </Link>
      <h1 className="mb-1 font-display text-3xl">Reset your password</h1>
      <p className="mb-8 text-ink-soft">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
