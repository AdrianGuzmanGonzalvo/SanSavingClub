import { notFound } from "next/navigation";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubSubNav } from "../club-sub-nav";
import { PayForm } from "./pay-form";

export default async function ClubPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const t = getDictionary(await getLocale());

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isAdmin = club.adminId === currentUserId;
  if (!club.members.some((m) => m.userId === currentUserId)) notFound();

  const hasInstructions = club.adminZelleInfo || club.adminCashAppInfo || club.adminBankInfo;

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} />
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.clubs.pay.instructionsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {hasInstructions ? (
              <>
                {club.adminZelleInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{t.clubs.admin.zelleLabel}</p>
                      <p className="text-muted-foreground">{club.adminZelleInfo}</p>
                    </div>
                  </div>
                )}
                {club.adminCashAppInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{t.clubs.admin.cashAppLabel}</p>
                      <p className="text-muted-foreground">{club.adminCashAppInfo}</p>
                    </div>
                  </div>
                )}
                {club.adminBankInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{t.clubs.admin.bankLabel}</p>
                      <p className="text-muted-foreground">{club.adminBankInfo}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.clubs.pay.noInstructions}</p>
            )}
          </CardContent>
        </Card>

        <PayForm
          clubId={club.id}
          monthlyAmount={club.monthlyAmount}
          lateFeeAmount={club.lateFeeAmount}
          paymentDueDay={club.paymentDueDay}
        />
      </div>
    </div>
  );
}
