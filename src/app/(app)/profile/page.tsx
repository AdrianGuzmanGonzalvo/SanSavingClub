import { redirect } from "next/navigation";
import { KeyRound, User } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTrustBadge } from "@/components/user-trust-badge";
import { ProfileDetailsForm } from "./profile-details-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const t = getDictionary(await getLocale());
  const session = await auth();

  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
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

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
