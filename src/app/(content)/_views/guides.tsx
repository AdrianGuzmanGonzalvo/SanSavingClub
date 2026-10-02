import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGuide, guides } from "@/content/guides";
import { agreement, calculator, guidesIndex } from "@/content/pages";
import { site } from "@/content/site";
import { SITE_URL, contentAlternates, localePath } from "@/lib/content-routes";
import { getDictionary, type Locale } from "@/lib/i18n/locale";
import { ArticleBody, ArticlePage, TEXT_LINK_CLASS } from "../_components/article";
import { JsonLd } from "../_components/json-ld";

// The tool that goes with a guide, linked at the end of it.
const GUIDE_TOOL: Record<string, "agreement" | "calculator"> = {
  "how-to-organize-a-san": "calculator",
  "turn-order": "calculator",
  "club-rules": "agreement",
};

export function guidesIndexMetadata(locale: Locale): Metadata {
  return {
    title: guidesIndex[locale].title,
    description: guidesIndex[locale].description,
    alternates: contentAlternates(locale, "/guides"),
  };
}

// The index lives in (no-ads) and the guides in (content), so the links between
// them are plain <a> tags — see (content)/layout.tsx.
export function GuidesIndexView({ locale }: { locale: Locale }) {
  const c = guidesIndex[locale];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="text-lg text-muted-foreground">{c.description}</p>
      </div>
      <ul className="flex flex-col gap-4">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <a
              href={localePath(locale, `/guides/${guide.slug}`)}
              className="flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-accent/50"
            >
              <h2 className="text-lg font-semibold">{guide[locale].title}</h2>
              <p className="text-sm text-muted-foreground">{guide[locale].description}</p>
              <span className={TEXT_LINK_CLASS}>
                {c.readGuide} <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function guideMetadata(locale: Locale, slug: string): Metadata {
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide[locale].title,
    description: guide[locale].description,
    alternates: contentAlternates(locale, `/guides/${slug}`),
  };
}

// /register uses a plain <a> tag on purpose — see (content)/layout.tsx.
export function GuideView({ locale, slug }: { locale: Locale; slug: string }) {
  const guide = getGuide(slug);
  if (!guide) notFound();

  const t = getDictionary(locale);
  const s = site[locale];
  const c = guidesIndex[locale];
  const updated = new Intl.DateTimeFormat(s.dateLocale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(guide.updated)
  );
  const tool = GUIDE_TOOL[guide.slug];
  const publisher = { "@type": "Organization", name: t.common.appName, url: SITE_URL };

  return (
    <ArticlePage
      title={guide[locale].title}
      description={guide[locale].description}
      meta={`${s.updated}: ${updated}`}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide[locale].title,
          description: guide[locale].description,
          inLanguage: locale,
          dateModified: guide.updated,
          mainEntityOfPage: `${SITE_URL}${localePath(locale, `/guides/${guide.slug}`)}`,
          author: publisher,
          publisher,
        }}
      />
      <ArticleBody blocks={guide[locale].blocks} />

      {tool && (
        <Link href={localePath(locale, `/${tool}`)} className={TEXT_LINK_CLASS}>
          {(tool === "agreement" ? agreement : calculator)[locale].title} <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <Button size="lg" asChild className="mt-4 self-start">
        <a href="/register">{t.landing.createClub}</a>
      </Button>

      <nav className="mt-6 flex flex-col gap-3 border-t pt-6">
        <h2 className="text-lg font-semibold">{c.moreGuides}</h2>
        <ul className="flex flex-col gap-2">
          {guides
            .filter((other) => other.slug !== guide.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link href={localePath(locale, `/guides/${other.slug}`)} className={TEXT_LINK_CLASS}>
                  {other[locale].title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </ArticlePage>
  );
}
