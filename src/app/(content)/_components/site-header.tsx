import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import { site } from "@/content/site";
import { localePath } from "@/lib/content-routes";
import { getDictionary, type Locale } from "@/lib/i18n/locale";
import { ContentLanguageSwitcher } from "./content-language-switcher";

// Every link here is a plain <a>, not <Link>: this header is shared by pages
// that carry the ad script and pages that don't. See (content)/layout.tsx.
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const s = site[locale];
  const nav = [
    { href: localePath(locale, "/how-it-works"), label: s.nav.howItWorks },
    { href: localePath(locale, "/guides"), label: s.nav.guides },
    { href: localePath(locale, "/calculator"), label: s.nav.calculator },
  ];

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-2 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <a href={localePath(locale, "/")} className="flex min-w-0 items-center gap-2 font-semibold">
          <SanClubEmblemLogo className="h-8 w-8 shrink-0" />
          <span className="hidden truncate sm:inline">{t.common.appName}</span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ContentLanguageSwitcher locale={locale} label={s.switchLanguage} />
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <a href="/login">{t.landing.signIn}</a>
          </Button>
          <Button size="sm" asChild>
            <a href="/register">{t.landing.getStarted}</a>
          </Button>
        </div>
      </div>
      <nav className="flex justify-center gap-1 overflow-x-auto border-t px-2 py-1 lg:hidden">
        {nav.map((item) => (
          <Button key={item.href} variant="ghost" size="sm" asChild>
            <a href={item.href}>{item.label}</a>
          </Button>
        ))}
      </nav>
    </header>
  );
}
