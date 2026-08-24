import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import AssistantWidget from "@/components/assistant/assistant-widget";
import ThemeProvider from "@/components/theme-provider";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HomeHaus — Aesthetics-first home decor & smart home",
    template: "%s · HomeHaus",
  },
  description:
    "Curated home decor and smart home devices chosen for how they look in a room, not just what they do. Shop by room, get a personalized set from the HomeHaus assistant.",
  keywords: [
    "home decor",
    "smart home",
    "home organization",
    "aesthetic smart devices",
    "room styling",
  ],
  openGraph: {
    title: "HomeHaus — Aesthetics-first home decor & smart home",
    description:
      "Curated home decor and smart home devices chosen for how they look in a room, not just what they do.",
    url: siteUrl,
    siteName: "HomeHaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeHaus",
    description:
      "Curated home decor and smart home devices chosen for how they look in a room.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrument.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-plaster text-ink transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-moss focus:text-white focus:px-4 focus:py-2 focus:rounded"
          >
            Skip to content
          </a>
          <SiteHeader user={user} locale={locale} dict={dict} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter dict={dict} />
          <AssistantWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
