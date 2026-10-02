import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { localePath } from "@/lib/content-routes";
import { LOCALES } from "@/lib/i18n/locale";

const BASE_URL = "https://www.sansavingclub.com";

// English paths of the public content pages; each one also exists under /es.
// The sign-in and sign-up forms are left out on purpose — they are noindex
// (see (auth)/layout.tsx).
const PAGES: { path: string; priority: number; lastModified?: string }[] = [
  { path: "/", priority: 1 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/guides", priority: 0.8 },
  ...guides.map((guide) => ({ path: `/guides/${guide.slug}`, priority: 0.7, lastModified: guide.updated })),
  { path: "/calculator", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
];

function absolute(path: string): string {
  return path === "/" ? BASE_URL : `${BASE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, priority, lastModified }) =>
    LOCALES.map((locale) => ({
      url: absolute(localePath(locale, path)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: {
          en: absolute(localePath("en", path)),
          es: absolute(localePath("es", path)),
        },
      },
    }))
  );
}
