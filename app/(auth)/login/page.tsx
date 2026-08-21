import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl">
        HomeHaus
      </Link>
      <h1 className="mb-1 font-display text-3xl">Welcome back</h1>
      <p className="mb-8 text-ink-soft">Sign in to your account.</p>
      <LoginForm />
    </div>
  );
}
