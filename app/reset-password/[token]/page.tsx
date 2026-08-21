import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl">
        HomeHaus
      </Link>
      <h1 className="mb-1 font-display text-3xl">Set a new password</h1>
      <p className="mb-8 text-ink-soft">
        This will sign you out on all other devices.
      </p>
      <ResetPasswordForm token={token} />
    </div>
  );
}
