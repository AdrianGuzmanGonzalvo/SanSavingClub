import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowUpDown, CalendarClock, Settings, Megaphone, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/format";
import { getCurrentCycleFromRows } from "@/lib/club";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClubSubNav } from "../club-sub-nav";
import { TurnAssignmentSection } from "./turn-assignment";
import { SwapTurnsDialog } from "./swap-turns-dialog";
import { ClubSettingsForm } from "./club-settings-form";
import { CycleDatesPanel, type CycleRow } from "./cycle-dates-panel";
import { PaymentApprovalQueue, type PendingReport } from "./payment-queue";
import { AnnouncementPanel, type AnnouncementItem } from "./announcement-panel";
import { CompleteClubDialog } from "./complete-club-dialog";
import { LifecycleControls } from "./lifecycle-controls";

export default async function ClubAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      paymentReports: { include: { user: true }, orderBy: { createdAt: "desc" } },
      announcements: { include: { author: true }, orderBy: { createdAt: "desc" } },
      cycles: { orderBy: { cycleNumber: "asc" } },
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isMember = club.members.some((m) => m.userId === currentUserId);
  if (!isMember) notFound();

  const isAdmin = club.adminId === currentUserId;

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <ClubSubNav clubId={club.id} isAdmin={false} />
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">{t.clubs.admin.accessDenied}</CardContent>
        </Card>
      </div>
    );
  }

  const memberRows = club.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    fullName: m.user.fullName,
    payoutTurn: m.payoutTurn,
    isAdmin: m.userId === club.adminId,
  }));

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

  const announcementItems: AnnouncementItem[] = club.announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    authorName: a.author.fullName,
    createdAt: formatDate(a.createdAt, locale),
  }));

  const currentCycle = club.cycles.length > 0 ? getCurrentCycleFromRows(club.cycles) : 0;
  const canComplete = club.status === "ACTIVE" && currentCycle >= club.durationCount;
  const canEdit = club.status === "PENDING" || club.status === "ACTIVE";
  const ratableMembers = club.members
    .filter((m) => m.userId !== club.adminId)
    .map((m) => ({ userId: m.userId, fullName: m.user.fullName }));

  const cycleRows: CycleRow[] = club.cycles.map((c) => ({
    cycleNumber: c.cycleNumber,
    paymentDueDateISO: c.paymentDueDate.toISOString(),
    payoutDateISO: c.payoutDate.toISOString(),
    isCompleted: c.isCompleted,
  }));

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} />

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.clubs.admin.title}</h1>
          <p className="text-muted-foreground">
            {interpolate(t.clubs.admin.subtitle, { club: club.name })} &middot;{" "}
            {interpolate(t.clubs.admin.roundLabel, { round: club.roundNumber })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {club.status === "ACTIVE" && (
            <CompleteClubDialog clubId={club.id} members={ratableMembers} canComplete={canComplete} />
          )}
          <LifecycleControls clubId={club.id} status={club.status} roundNumber={club.roundNumber} />
        </div>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="approvals">
            <CheckCircle2 /> {t.clubs.admin.tabs.approvals}
          </TabsTrigger>
          <TabsTrigger value="turns">
            <ArrowUpDown /> {t.clubs.admin.tabs.turns}
          </TabsTrigger>
          <TabsTrigger value="cycles">
            <CalendarClock /> {t.clubs.admin.tabs.cycles}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings /> {t.clubs.admin.tabs.settings}
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Megaphone /> {t.clubs.admin.tabs.announcements}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-4">
          <PaymentApprovalQueue clubId={club.id} reports={pendingReports} />
        </TabsContent>

        <TabsContent value="turns" className="mt-4 flex flex-col gap-4">
          <Button variant="outline" size="sm" className="self-end" asChild>
            <Link href={`/clubs/${club.id}/admin/members`}>
              <Users /> {t.clubs.admin.membersPageTitle}
            </Link>
          </Button>
          <TurnAssignmentSection
            clubId={club.id}
            members={memberRows}
            durationCount={club.durationCount}
            isPending={club.status === "PENDING"}
            canEditTurns={canEdit}
          />
          <SwapTurnsDialog clubId={club.id} members={memberRows} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="cycles" className="mt-4">
          <CycleDatesPanel clubId={club.id} cycles={cycleRows} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ClubSettingsForm
            clubId={club.id}
            canEdit={canEdit}
            initial={{
              durationUnit: club.durationUnit,
              paymentDueDay: club.paymentDueDay,
              payoutDay: club.payoutDay,
              lateFeeAmount: club.lateFeeAmount,
              gracePeriodDays: club.gracePeriodDays,
              adminZelleInfo: club.adminZelleInfo ?? "",
              adminCashAppInfo: club.adminCashAppInfo ?? "",
              adminBankInfo: club.adminBankInfo ?? "",
            }}
          />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <AnnouncementPanel clubId={club.id} announcements={announcementItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
