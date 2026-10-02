import type { Locale } from "@/lib/i18n/locale";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function ContentShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
