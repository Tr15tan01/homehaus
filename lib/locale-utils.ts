export const LOCALES = ["en", "ka"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// Picks the localized field if present and non-empty, otherwise falls back
// to English — used for every product/category field pair (name/nameKa etc).
// No machine translation anywhere: this only ever selects between two
// hand-written values, it never generates one.
//
// `en` is typed as a required string (every English field in the schema is
// required) and `ka` as nullable (every Georgian field is optional) — that
// asymmetry is exactly what guarantees this always returns a real string.
export function pick(locale: Locale, en: string, ka: string | null | undefined): string {
  if (locale === "ka" && ka) return ka;
  return en;
}

export function pickList(locale: Locale, en: string[], ka: string[]): string[] {
  if (locale === "ka" && ka.length > 0) return ka;
  return en;
}
