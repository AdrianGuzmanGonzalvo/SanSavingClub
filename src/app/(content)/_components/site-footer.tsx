import { site } from "@/content/site";
import { localePath } from "@/lib/content-routes";
import { getDictionary, type Locale } from "@/lib/i18n/locale";

// Every link here is a plain <a>, not <Link>: this footer is shared by pages
// that carry the ad script and pages that don't. See (content)/layout.tsx.
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const s = site[locale];
  const links = [
    { path: "/how-it-works", label: s.nav.howItWorks },
    { path: "/guides", label: s.nav.guides },
    { path: "/calculator", label: s.nav.calculator },
    { path: "/about", label: s.footer.about },
    { path: "/contact", label: s.footer.contact },
    { path: "/terms", label: s.footer.terms },
    { path: "/privacy", label: s.footer.privacy },
  ];

  return (
    <footer className="border-t px-6 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {links.map((link) => (
            <a key={link.path} href={localePath(locale, link.path)} className="hover:text-foreground hover:underline">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="max-w-xl text-xs">{s.footer.disclaimer}</p>
        <p className="text-xs">
          © {new Date().getFullYear()} {t.common.appName}
        </p>
      </div>
    </footer>
  );
}
