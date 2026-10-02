import type { Metadata } from "next";
import {
  CalendarClock,
  HandCoins,
  Link2,
  LifeBuoy,
  ShieldCheck,
  Shuffle,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/content/site";
import { contentAlternates } from "@/lib/content-routes";
import { getDictionary, type Locale } from "@/lib/i18n/locale";

const SECTION_ICONS: LucideIcon[] = [
  UserPlus,
  Sparkles,
  Link2,
  Shuffle,
  HandCoins,
  CalendarClock,
  ShieldCheck,
  User,
  LifeBuoy,
];

const DESCRIPTIONS: Record<Locale, string> = {
  en: "Step-by-step guide to SanSavingClub: create an account, start or join a savings club, assign payout turns, report payments, and keep track of every due date.",
  es: "Guía paso a paso de SanSavingClub: crea tu cuenta, inicia un club de ahorro o únete a uno, asigna los turnos, reporta los pagos y da seguimiento a cada fecha.",
};

export function howItWorksMetadata(locale: Locale): Metadata {
  return {
    title: site[locale].nav.howItWorks,
    description: DESCRIPTIONS[locale],
    alternates: contentAlternates(locale, "/how-it-works"),
  };
}

// /register uses a plain <a> tag on purpose — see (content)/layout.tsx.
export function HowItWorksView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t.help.title}</h1>
        <p className="text-lg text-muted-foreground">{t.help.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4">
        {t.help.sections.map((section, i) => {
          const Icon = SECTION_ICONS[i] ?? Sparkles;
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-primary" />
                  <h2>{section.title}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-2">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0 font-semibold text-primary">{stepIndex + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button size="lg" asChild className="mt-2 self-center">
        <a href="/register">{t.landing.createClub}</a>
      </Button>
    </div>
  );
}
