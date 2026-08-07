"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/i18n-provider";
import type { Locale } from "@/lib/i18n/locale";

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language" disabled={isPending}>
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(LANGUAGE_LABELS) as Locale[]).map((code) => (
          <DropdownMenuItem key={code} onSelect={() => handleSelect(code)} disabled={code === locale}>
            {LANGUAGE_LABELS[code]}
            {code === locale && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
