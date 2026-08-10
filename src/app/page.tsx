import Link from "next/link";
import { redirect } from "next/navigation";
import { PiggyBank, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { auth } from "@/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2 font-semibold">
          <SanClubEmblemLogo className="h-8 w-8" />
          {t.common.appName}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">{t.landing.signIn}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{t.landing.getStarted}</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">{t.landing.title}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t.landing.subtitle}</p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link href="/register">{t.landing.createClub}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">{t.landing.signIn}</Link>
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

        <section className="mt-16 flex w-full max-w-2xl flex-col gap-6 text-left">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-2xl font-bold tracking-tight">{t.help.title}</h2>
            <p className="text-muted-foreground">{t.help.subtitle}</p>
          </div>
          <div className="flex flex-col gap-4">
            {t.help.sections.map((section) => (
              <div key={section.title} className="rounded-lg border p-5">
                <h3 className="mb-2 font-semibold">{section.title}</h3>
                <ol className="flex flex-col gap-1.5">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0 font-semibold text-primary">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/register">{t.landing.createClub}</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground hover:underline">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
      {icon}
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
