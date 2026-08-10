"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bell, HelpCircle, LayoutDashboard, LifeBuoy, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SanClubEmblemLogo } from "@/components/SanClubEmblemLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction, markNotificationsReadAction } from "@/app/(app)/actions";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { formatDate } from "@/lib/format";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader({
  userName,
  userEmail,
  notifications,
  unreadCount,
  isLeader = false,
}: {
  userName: string;
  userEmail: string;
  notifications: NotificationItem[];
  unreadCount: number;
  isLeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dict: t, locale } = useI18n();
  const [, startTransition] = useTransition();

  const navLinks = [
    { href: "/dashboard", label: t.header.dashboard, icon: LayoutDashboard },
    ...(isLeader ? [{ href: "/reports", label: t.reports.navLabel, icon: BarChart3 }] : []),
  ];

  function handleOpenChange(open: boolean) {
    if (open && unreadCount > 0) {
      startTransition(async () => {
        await markNotificationsReadAction();
        router.refresh();
      });
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <SanClubEmblemLogo className="h-7 w-7" />
          {t.common.appName}
        </Link>

        <nav className="hidden gap-1 sm:flex">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={link.href}>
                <link.icon /> {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />

          <Popover onOpenChange={handleOpenChange}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t.header.notifications} className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.header.notifications}</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-80 p-0 text-sm">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                  <p className="font-medium">{t.header.noNotifications}</p>
                  <p className="text-xs text-muted-foreground">{t.header.notificationsHint}</p>
                </div>
              ) : (
                <div className="flex max-h-96 flex-col divide-y overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link ?? "/dashboard"}
                      className={`flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-accent ${!n.isRead ? "bg-emerald-50/60 dark:bg-emerald-950/20" : ""}`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(n.createdAt, locale)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar>
                  <AvatarFallback>{initials(userName)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="sm:hidden">
                <Link href="/dashboard">
                  <LayoutDashboard /> {t.header.dashboard}
                </Link>
              </DropdownMenuItem>
              {isLeader && (
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/reports">
                    <BarChart3 /> {t.reports.navLabel}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User /> {t.header.profile}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle /> {t.help.navLabel}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support">
                  <LifeBuoy /> {t.support.navLabel}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOutAction()}>{t.header.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
