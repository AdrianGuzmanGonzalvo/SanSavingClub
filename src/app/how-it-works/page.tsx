import Link from "next/link";
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
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

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

export default async function HowItWorksPage() {
  const t = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SanClubEmblemLogo className="h-8 w-8" />
          {t.common.appName}
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">{t.landing.signIn}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{t.landing.getStarted}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {t.help.backToHome}
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.help.title}</h1>
          <p className="text-muted-foreground">{t.help.subtitle}</p>
        </div>

        <div className="flex flex-col gap-4">
          {t.help.sections.map((section, i) => {
            const Icon = SECTION_ICONS[i] ?? Sparkles;
            return (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {section.title}
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
          <Link href="/register">{t.landing.createClub}</Link>
        </Button>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground hover:underline">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
