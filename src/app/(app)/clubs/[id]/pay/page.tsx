import { notFound } from "next/navigation";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubSubNav } from "../club-sub-nav";
import { PayForm } from "./pay-form";
import { AdminRecordPaymentCard } from "./admin-record-payment-card";
import { PaymentApprovalQueue, type PendingReport } from "../admin/payment-queue";

export default async function ClubPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      paymentReports: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isAdmin = club.adminId === currentUserId;
  const isParticipant = club.members.some((m) => m.userId === currentUserId);
  if (!isParticipant && !isAdmin) notFound();

  const hasInstructions = club.adminZelleInfo || club.adminCashAppInfo || club.adminBankInfo;
  const payableMembers = club.members.map((m) => ({ userId: m.userId, fullName: m.user.fullName }));

  const pendingReports: PendingReport[] = club.paymentReports
    .filter((r) => r.status === "PENDING")
    .map((r) => ({
      id: r.id,
      memberName: r.user.fullName,
      amount: formatUSD(r.amount),
      paymentDate: formatDate(r.paymentDate, locale),
      method: r.method,
      referenceNote: r.referenceNote,
      receiptUrl: r.receiptUrl,
      submittedOn: formatDate(r.createdAt, locale),
    }));

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} isParticipant={isParticipant} />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {isAdmin && <PaymentApprovalQueue clubId={club.id} reports={pendingReports} />}

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <CardHeader className="relative">
            <CardTitle className="text-base text-white">{t.clubs.pay.instructionsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-3">
            {hasInstructions ? (
              <>
                {club.adminZelleInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                    <div>
                      <p className="font-medium text-white">{t.clubs.admin.zelleLabel}</p>
                      <p className="text-white/80">{club.adminZelleInfo}</p>
                    </div>
                  </div>
                )}
                {club.adminCashAppInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                    <div>
                      <p className="font-medium text-white">{t.clubs.admin.cashAppLabel}</p>
                      <p className="text-white/80">{club.adminCashAppInfo}</p>
                    </div>
                  </div>
                )}
                {club.adminBankInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                    <div>
                      <p className="font-medium text-white">{t.clubs.admin.bankLabel}</p>
                      <p className="text-white/80">{club.adminBankInfo}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-white/80">{t.clubs.pay.noInstructions}</p>
            )}
          </CardContent>
        </Card>

        {isParticipant && (
          <PayForm
            clubId={club.id}
            quotaAmount={club.quotaAmount}
            lateFeeAmount={club.lateFeeAmount}
            paymentDueDay={club.paymentDueDay}
          />
        )}

        {isAdmin && club.status === "ACTIVE" && (
          <AdminRecordPaymentCard clubId={club.id} quotaAmount={club.quotaAmount} members={payableMembers} />
        )}
      </div>
    </div>
  );
}
