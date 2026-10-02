import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locale";

export const SITE_URL = "https://www.sansavingclub.com";

// Public content pages live at the same path in both languages: English at the
// root (/guides) and Spanish under /es (/es/guides).

export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? "/es" : `/es${path}`;
}

/** The same page in the other language, given the current pathname. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const base = pathname === "/es" ? "/" : pathname.startsWith("/es/") ? pathname.slice(3) : pathname;
  return localePath(to, base);
}

/** Canonical + hreflang links for a content page. `path` is the English path. */
export function contentAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      es: localePath("es", path),
      "x-default": localePath("en", path),
    },
  };
}
