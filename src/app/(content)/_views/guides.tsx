import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGuide, guides } from "@/content/guides";
import { guidesIndex } from "@/content/pages";
import { site } from "@/content/site";
import { contentAlternates, localePath } from "@/lib/content-routes";
import { getDictionary, type Locale } from "@/lib/i18n/locale";
import { ArticleBody, ArticlePage } from "../_components/article";

export function guidesIndexMetadata(locale: Locale): Metadata {
  return {
    title: guidesIndex[locale].title,
    description: guidesIndex[locale].description,
    alternates: contentAlternates(locale, "/guides"),
  };
}

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
            <Link
              href={localePath(locale, `/guides/${guide.slug}`)}
              className="flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-accent/50"
            >
              <h2 className="text-lg font-semibold">{guide[locale].title}</h2>
              <p className="text-sm text-muted-foreground">{guide[locale].description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {c.readGuide} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
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

  return (
    <ArticlePage
      title={guide[locale].title}
      description={guide[locale].description}
      meta={`${s.updated}: ${updated}`}
    >
      <ArticleBody blocks={guide[locale].blocks} />

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
                <Link
                  href={localePath(locale, `/guides/${other.slug}`)}
                  className="text-sm text-primary hover:underline"
                >
                  {other[locale].title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </ArticlePage>
  );
}
