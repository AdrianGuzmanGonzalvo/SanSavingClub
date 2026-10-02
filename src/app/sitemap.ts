import type { MetadataRoute } from "next";

const BASE_URL = "https://www.sansavingclub.com";

// Content pages only — the sign-in and sign-up forms are noindex (see (auth)/layout.tsx).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
