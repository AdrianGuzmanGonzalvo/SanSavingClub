import type { MetadataRoute } from "next";

const BASE_URL = "https://www.sansavingclub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/clubs",
        "/profile",
        "/reports",
        "/support",
        "/notifications",
        "/help",
        "/reset-password",
        "/api",
        // Cloudflare's own endpoints (email obfuscation, challenges): nothing to index.
        "/cdn-cgi/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
