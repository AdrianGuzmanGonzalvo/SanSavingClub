"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Home, LayoutDashboard, Settings, User, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { useClubNav } from "@/lib/club-nav-context";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: boolean };

export function BottomNav({ isLeader, unreadCount }: { isLeader: boolean; unreadCount: number }) {
  const pathname = usePathname();
  const { dict: t } = useI18n();
  const { club } = useClubNav();

  const overviewHref = club ? `/clubs/${club.clubId}` : "";
  const onOverview = club && pathname === overviewHref;

  const items: NavItem[] = club
    ? [
        onOverview
          ? { href: "/dashboard", label: t.header.dashboard, icon: Home }
          : { href: overviewHref, label: t.clubs.nav.overview, icon: LayoutDashboard },
        { href: `/clubs/${club.clubId}/calendar`, label: t.clubs.nav.calendar, icon: CalendarDays },
        ...(club.isParticipant || club.isAdmin
          ? [{ href: `/clubs/${club.clubId}/pay`, label: t.clubs.nav.pay, icon: Wallet }]
          : []),
        ...(club.isAdmin ? [{ href: `/clubs/${club.clubId}/admin`, label: t.clubs.nav.admin, icon: Settings }] : []),
      ]
    : [
        { href: "/dashboard", label: t.header.dashboard, icon: LayoutDashboard },
        ...(isLeader ? [{ href: "/reports", label: t.reports.navLabel, icon: BarChart3 }] : []),
        { href: "/profile", label: t.header.profile, icon: User, badge: unreadCount > 0 },
      ];

  return (
    <nav
      className="fixed inset-x-0 bottom-[var(--admob-banner-height,0px)] z-10 bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
    >
      <div className="mx-auto flex max-w-5xl">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                isActive ? "text-white" : "text-white/60"
              }`}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-400" />}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
