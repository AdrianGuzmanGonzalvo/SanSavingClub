import type { Metadata } from "next";
import { calculator } from "@/content/pages";
import { site } from "@/content/site";
import { contentAlternates } from "@/lib/content-routes";
import type { Locale } from "@/lib/i18n/locale";
import { ArticleBody, ArticlePage } from "../_components/article";
import { Calculator } from "../_components/calculator";

export function calculatorMetadata(locale: Locale): Metadata {
  return {
    title: calculator[locale].title,
    description: calculator[locale].description,
    alternates: contentAlternates(locale, "/calculator"),
  };
}

export function CalculatorView({ locale }: { locale: Locale }) {
  const c = calculator[locale];
  return (
    <ArticlePage title={c.title} description={c.description}>
      <Calculator labels={c} dateLocale={site[locale].dateLocale} />
      <ArticleBody blocks={[{ h: c.explainerTitle }, ...c.explainer]} />
    </ArticlePage>
  );
}
