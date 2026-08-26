import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, HelpCircle, KeyRound, Languages, LifeBuoy, LogOut, Moon, User } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTrustBadge } from "@/components/user-trust-badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileDetailsForm } from "./profile-details-form";
import { ChangePasswordForm } from "./change-password-form";
import { TwoFactorSection } from "./two-factor-section";
import { signOutAction } from "../actions";

export default async function ProfilePage() {
  const t = getDictionary(await getLocale());
  const session = await auth();

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session!.user.id } }),
    prisma.notification.count({ where: { userId: session!.user.id, isRead: false } }),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.profile.title}</h1>
        <p className="text-muted-foreground">{t.profile.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.reputation.yourReputation}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTrustBadge variant="full" stats={user} />
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="personal">
            <User /> {t.profile.tabs.personal}
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound /> {t.profile.tabs.security}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ProfileDetailsForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardContent className="pt-4">
              <ChangePasswordForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.profile.twoFactorTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <TwoFactorSection enabled={user.twoFactorEnabled} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.profile.moreTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y p-0">
          <Link href="/notifications" className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" /> {t.header.notifications}
            </span>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </Link>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4 text-primary" /> {t.profile.languageLabel}
            </span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Moon className="h-4 w-4 text-primary" /> {t.profile.appearanceLabel}
            </span>
            <ThemeToggle />
          </div>
          <Link href="/help" className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-accent">
            <HelpCircle className="h-4 w-4 text-primary" /> {t.help.navLabel}
          </Link>
          <Link href="/support" className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-accent">
            <LifeBuoy className="h-4 w-4 text-primary" /> {t.support.navLabel}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> {t.header.signOut}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
