import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { agreement } from "@/content/pages";
import { site } from "@/content/site";
import { contentAlternates, localePath } from "@/lib/content-routes";
import type { Locale } from "@/lib/i18n/locale";
import { AgreementBuilder } from "../_components/agreement-builder";
import { ArticleBody, ArticlePage, TEXT_LINK_CLASS } from "../_components/article";

export function agreementMetadata(locale: Locale): Metadata {
  return {
    title: agreement[locale].title,
    description: agreement[locale].description,
    alternates: contentAlternates(locale, "/agreement"),
  };
}

export function AgreementView({ locale }: { locale: Locale }) {
  const c = agreement[locale];
  return (
    <ArticlePage title={c.title} description={c.description}>
      <div className="print:hidden">
        <ArticleBody blocks={c.intro} />
      </div>
      <AgreementBuilder labels={c} dateLocale={site[locale].dateLocale} />
      <div className="flex flex-col gap-4 print:hidden">
        <ArticleBody blocks={[{ note: c.note }]} />
        <Link href={localePath(locale, "/guides/club-rules")} className={TEXT_LINK_CLASS}>
          {c.guideLink} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </ArticlePage>
  );
}
