import { cookies, headers } from "next/headers";
import { en, es, type Dictionary } from "./dictionaries";
import { LOCALE_COOKIE, LOCALE_HEADER } from "./locale-keys";

export type Locale = "en" | "es";

export { LOCALE_COOKIE };
export const LOCALES: Locale[] = ["en", "es"];

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "es";
}

export async function getLocale(): Promise<Locale> {
  const fromUrl = (await headers()).get(LOCALE_HEADER);
  if (isLocale(fromUrl)) return fromUrl;

  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
