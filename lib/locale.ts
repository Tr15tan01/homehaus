import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale-utils";

export const LOCALE_COOKIE_NAME = "homehaus_locale";

// Re-exported so existing server-side call sites can keep importing
// `Locale`/pick helpers from "@/lib/locale" without change — only client
// components need to reach into locale-utils directly (see product-card.tsx).
export { LOCALES, DEFAULT_LOCALE, pick, pickList, type Locale } from "@/lib/locale-utils";

// Deliberately cookie-based rather than browser Accept-Language detection —
// the person chooses their language explicitly and it stays that way. No
// machine translation anywhere: content in each language is either filled
// in by hand (products, categories) or hand-written in the dictionary
// (site chrome). If a Georgian field is empty, we fall back to English
// rather than guessing at a translation.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return value === "ka" ? "ka" : DEFAULT_LOCALE;
}
