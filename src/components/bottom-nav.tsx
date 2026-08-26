"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function BottomNav({ isLeader, unreadCount }: { isLeader: boolean; unreadCount: number }) {
  const pathname = usePathname();
  const { dict: t } = useI18n();

  const items: { href: string; label: string; icon: LucideIcon; badge?: boolean }[] = [
    { href: "/dashboard", label: t.header.dashboard, icon: LayoutDashboard },
    ...(isLeader ? [{ href: "/reports", label: t.reports.navLabel, icon: BarChart3 }] : []),
    { href: "/profile", label: t.header.profile, icon: User, badge: unreadCount > 0 },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200/80 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-5xl">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500" />}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
