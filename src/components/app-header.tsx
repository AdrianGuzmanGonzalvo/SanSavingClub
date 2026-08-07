"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, PiggyBank } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { signOutAction } from "@/app/(app)/actions";
import { useI18n } from "@/lib/i18n/i18n-provider";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname();
  const { dict: t } = useI18n();

  const navLinks = [{ href: "/dashboard", label: t.header.dashboard, icon: LayoutDashboard }];

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <PiggyBank className="h-5 w-5 text-primary" />
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

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t.header.notifications}>
                    <Bell className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.header.notifications}</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-64 text-sm">
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <p className="font-medium">{t.header.noNotifications}</p>
                <p className="text-xs text-muted-foreground">{t.header.notificationsHint}</p>
              </div>
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
              <DropdownMenuItem onSelect={() => signOutAction()}>{t.header.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
