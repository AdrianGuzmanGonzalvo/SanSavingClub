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
      <header className="flex items-center justify-between gap-2 border-b px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          <SanClubEmblemLogo className="h-8 w-8 shrink-0" />
          <span className="hidden truncate sm:inline">{t.common.appName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href="/how-it-works">{t.landing.howItWorks}</Link>
          </Button>
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t.landing.signIn}</Link>
          </Button>
          <Button size="sm" asChild>
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

        <Button variant="link" asChild className="mt-2">
          <Link href="/how-it-works">{t.landing.howItWorksLink}</Link>
        </Button>
      </main>
      <footer className="border-t px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center text-sm text-muted-foreground">
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
