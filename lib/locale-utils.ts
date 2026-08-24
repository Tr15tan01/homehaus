export const LOCALES = ["en", "ka"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// Picks the localized field if present and non-empty, otherwise falls back
// to English — used for every product/category field pair (name/nameKa etc).
// No machine translation anywhere: this only ever selects between two
// hand-written values, it never generates one.
export function pick<T extends string | null | undefined>(
  locale: Locale,
  en: T,
  ka: T,
): NonNullable<T> | T {
  if (locale === "ka" && ka) return ka;
  return en;
}

export function pickList(locale: Locale, en: string[], ka: string[]): string[] {
  if (locale === "ka" && ka.length > 0) return ka;
  return en;
}
