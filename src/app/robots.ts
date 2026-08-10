import type { MetadataRoute } from "next";

const BASE_URL = "https://www.sansavingclub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/forgot-password"],
      disallow: ["/dashboard", "/clubs", "/profile", "/reports", "/support", "/reset-password", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
