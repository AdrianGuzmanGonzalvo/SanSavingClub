import { cookies } from "next/headers";
import { en, es, type Dictionary } from "./dictionaries";

export type Locale = "en" | "es";

export const LOCALE_COOKIE = "locale";
export const LOCALES: Locale[] = ["en", "es"];

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "es";
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
