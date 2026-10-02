"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { switchLocalePath } from "@/lib/content-routes";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";

// On content pages the language is part of the URL, so switching it is a link
// to the same page in the other language. It's a real <a> so it works without
// JavaScript and crawlers can follow it; the click handler only adds saving the
// choice first, so the sign-in screens and the app open in that language too.
export function ContentLanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next: Locale = locale === "en" ? "es" : "en";
  const href = switchLocalePath(pathname, next);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    startTransition(async () => {
      await setLocaleAction(next);
      router.push(href);
    });
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <a href={href} hrefLang={next} aria-label={label} aria-disabled={isPending} onClick={handleClick}>
        <Languages className="h-4 w-4" />
        {next.toUpperCase()}
      </a>
    </Button>
  );
}
