"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function ClubSubNav({
  clubId,
  isAdmin,
  isParticipant = true,
}: {
  clubId: string;
  isAdmin: boolean;
  isParticipant?: boolean;
}) {
  const pathname = usePathname();
  const { dict: t } = useI18n();

  const base = `/clubs/${clubId}`;
  const tabs = [
    { href: base, label: t.clubs.nav.overview, icon: LayoutDashboard },
    { href: `${base}/calendar`, label: t.clubs.nav.calendar, icon: CalendarDays },
    ...(isParticipant || isAdmin ? [{ href: `${base}/pay`, label: t.clubs.nav.pay, icon: Wallet }] : []),
    ...(isAdmin ? [{ href: `${base}/admin`, label: t.clubs.nav.admin, icon: Settings }] : []),
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b pb-px">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
