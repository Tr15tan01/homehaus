import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (user) redirect("/account");
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl">
        HomeHaus
      </Link>
      <h1 className="mb-1 font-display text-3xl">{dict.auth.welcomeBack}</h1>
      <p className="mb-8 text-ink-soft">{dict.auth.signInSubtitle}</p>
      <LoginForm dict={dict} />
    </div>
  );
}
