import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { TERMS_UPDATED, about, contact, terms } from "@/content/pages";
import { CONTACT_EMAIL, site } from "@/content/site";
import { contentAlternates } from "@/lib/content-routes";
import type { Locale } from "@/lib/i18n/locale";
import { ArticleBody, ArticlePage } from "../_components/article";

export function aboutMetadata(locale: Locale): Metadata {
  return {
    title: { absolute: about[locale].title },
    description: about[locale].description,
    alternates: contentAlternates(locale, "/about"),
  };
}

export function AboutView({ locale }: { locale: Locale }) {
  const c = about[locale];
  return (
    <ArticlePage title={c.title} description={c.description}>
      <ArticleBody blocks={c.blocks} />
    </ArticlePage>
  );
}

export function termsMetadata(locale: Locale): Metadata {
  return {
    title: terms[locale].title,
    description: terms[locale].description,
    alternates: contentAlternates(locale, "/terms"),
  };
}

export function TermsView({ locale }: { locale: Locale }) {
  const c = terms[locale];
  const s = site[locale];
  const updated = new Intl.DateTimeFormat(s.dateLocale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(TERMS_UPDATED)
  );
  return (
    <ArticlePage title={c.title} description={c.description} meta={`${s.updated}: ${updated}`}>
      <ArticleBody blocks={c.blocks} />
    </ArticlePage>
  );
}

export function contactMetadata(locale: Locale): Metadata {
  return {
    title: contact[locale].title,
    description: contact[locale].description,
    alternates: contentAlternates(locale, "/contact"),
  };
}

export function ContactView({ locale }: { locale: Locale }) {
  const c = contact[locale];
  return (
    <ArticlePage title={c.title} description={c.description}>
      <div className="flex flex-col gap-1 rounded-lg border p-5">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" /> {c.emailLabel}
        </span>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4">
          {CONTACT_EMAIL}
        </a>
      </div>
      <ArticleBody blocks={[{ h: c.topicsTitle }, { ul: c.topics }, { note: c.note }]} />
    </ArticlePage>
  );
}
