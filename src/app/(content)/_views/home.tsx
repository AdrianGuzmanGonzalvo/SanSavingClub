import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, PiggyBank, ShieldCheck, Users } from "lucide-react";
import { TEXT_LINK_CLASS } from "../_components/article";
import { JsonLd } from "../_components/json-ld";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { guides } from "@/content/guides";
import { home } from "@/content/pages";
import { SITE_URL, contentAlternates, localePath } from "@/lib/content-routes";
import { LOCALE_COOKIE, getDictionary, type Locale } from "@/lib/i18n/locale";

const TITLES: Record<Locale, string> = {
  en: "SanSavingClub — Private group savings clubs (tanda / ROSCA)",
  es: "SanSavingClub — Clubes privados de ahorro grupal (san / tanda)",
};

export function homeMetadata(locale: Locale): Metadata {
  return {
    title: { absolute: TITLES[locale] },
    description: home[locale].description,
    alternates: contentAlternates(locale, "/"),
  };
}

// /login and /register use plain <a> tags on purpose — see (content)/layout.tsx.
export async function HomeView({ locale }: { locale: Locale }) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  // A visitor who chose Spanish before lands on the Spanish home. Crawlers send
  // no cookie, so they always get the page for the URL they asked for.
  if (locale === "en" && (await cookies()).get(LOCALE_COOKIE)?.value === "es") redirect("/es");

  const t = getDictionary(locale);
  const c = home[locale];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: t.common.appName,
          url: `${SITE_URL}${localePath(locale, "/")}`,
          description: c.description,
          inLanguage: locale,
          publisher: { "@type": "Organization", name: t.common.appName, url: SITE_URL },
        }}
      />
      <section className="flex flex-col items-center gap-8 px-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">{t.landing.title}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t.landing.subtitle}</p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <a href="/register">{t.landing.createClub}</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/login">{t.landing.signIn}</a>
          </Button>
        </div>

        <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          <Feature
            icon={<Users className="h-6 w-6 text-primary" />}
            title={t.landing.features.closedClubs.title}
            description={t.landing.features.closedClubs.description}
          />
          <Feature
            icon={<ShieldCheck className="h-6 w-6 text-primary" />}
            title={t.landing.features.contributions.title}
            description={t.landing.features.contributions.description}
          />
          <Feature
            icon={<PiggyBank className="h-6 w-6 text-primary" />}
            title={t.landing.features.transparency.title}
            description={t.landing.features.transparency.description}
          />
        </div>
      </section>

      <Section title={c.explainer.title}>
        <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
          {c.explainer.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <MoreLink href={localePath(locale, "/guides/what-is-a-san")}>{c.explainer.link}</MoreLink>
      </Section>

      <Section title={c.steps.title}>
        <ol className="grid gap-4 sm:grid-cols-3">
          {c.steps.items.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2 rounded-lg border p-5">
              <span className="text-sm font-semibold text-primary">{i + 1}</span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <MoreLink href={localePath(locale, "/how-it-works")}>{c.steps.link}</MoreLink>
      </Section>

      <Section title={c.guides.title} subtitle={c.guides.subtitle}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={localePath(locale, `/guides/${guide.slug}`)}
                className="flex h-full flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-accent/50"
              >
                <h3 className="font-semibold">{guide[locale].title}</h3>
                <p className="text-sm text-muted-foreground">{guide[locale].description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <MoreLink href={localePath(locale, "/guides")}>{c.guides.all}</MoreLink>
      </Section>

      <Section title={c.calculator.title}>
        <p className="leading-relaxed text-muted-foreground">{c.calculator.description}</p>
        <MoreLink href={localePath(locale, "/calculator")}>{c.calculator.link}</MoreLink>
      </Section>

      <Section title={c.agreement.title}>
        <p className="leading-relaxed text-muted-foreground">{c.agreement.description}</p>
        <MoreLink href={localePath(locale, "/agreement")}>{c.agreement.link}</MoreLink>
      </Section>

      <Section title={c.faq.title}>
        <div className="flex flex-col gap-3">
          {c.faq.items.map((item) => (
            <details key={item.question} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="flex justify-center px-6 pb-20">
        <Button size="lg" asChild>
          <a href="/register">{t.landing.createClub}</a>
        </Button>
      </section>
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// A plain <a>: some of these lead to pages without the ad script (the guides index).
function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={TEXT_LINK_CLASS}>
      {children} <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
      {icon}
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
