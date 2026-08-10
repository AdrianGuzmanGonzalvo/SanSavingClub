import { redirect } from "next/navigation";
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
import { auth } from "@/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default async function HelpPage() {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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
    </div>
  );
}
