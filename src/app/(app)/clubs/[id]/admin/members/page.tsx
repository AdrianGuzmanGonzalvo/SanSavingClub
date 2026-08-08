import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/format";
import { computeMemberStatusForCycle, getCurrentCycleFromRows, isReportForCycle } from "@/lib/club";
import { Card, CardContent } from "@/components/ui/card";
import { ClubSubNav } from "../../club-sub-nav";
import { TurnAssignmentSection } from "../turn-assignment";
import { SwapTurnsDialog } from "../swap-turns-dialog";
import { InviteLinkCard } from "./invite-link-card";
import { QuotaStatusTable, type MemberQuotaRow } from "./quota-status-table";

export default async function ClubMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const t = getDictionary(await getLocale());

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      paymentReports: true,
      cycles: { orderBy: { cycleNumber: "asc" } },
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isAdmin = club.adminId === currentUserId;
  const isParticipant = club.members.some((m) => m.userId === currentUserId);
  if (!isParticipant && !isAdmin) notFound();

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

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const inviteUrl = `${protocol}://${host}/clubs/join?code=${club.inviteCode}`;

  const memberRows = club.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    fullName: m.user.fullName,
    payoutTurn: m.payoutTurn,
    isAdmin: m.userId === club.adminId,
  }));

  const currentCycle = club.cycles.length > 0 ? getCurrentCycleFromRows(club.cycles) : null;
  const currentCycleRow = currentCycle ? club.cycles.find((c) => c.cycleNumber === currentCycle) : null;
  const cycleDueDate = currentCycleRow?.paymentDueDate ?? null;

  const quotaRows: MemberQuotaRow[] = club.members.map((member) => {
    const reportsForCycle = cycleDueDate
      ? club.paymentReports.filter(
          (r) => r.userId === member.userId && isReportForCycle(r, cycleDueDate, club.durationUnit, club.frequency)
        )
      : [];
    const status = cycleDueDate
      ? computeMemberStatusForCycle(reportsForCycle, cycleDueDate, club.gracePeriodDays)
      : "UPCOMING";
    return {
      userId: member.userId,
      fullName: member.user.fullName,
      status,
      suggestedAmount: club.quotaAmount,
    };
  });

  const canEdit = club.status === "PENDING" || club.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} isParticipant={isParticipant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.clubs.admin.membersPageTitle}</h1>
        <p className="text-muted-foreground">{interpolate(t.clubs.admin.membersPageSubtitle, { club: club.name })}</p>
      </div>

      <InviteLinkCard inviteUrl={inviteUrl} />

      <TurnAssignmentSection
        clubId={club.id}
        members={memberRows}
        durationCount={club.durationCount}
        isPending={club.status === "PENDING"}
        canEditTurns={canEdit}
      />
      <SwapTurnsDialog clubId={club.id} members={memberRows} canEdit={canEdit} />

      <QuotaStatusTable clubId={club.id} rows={quotaRows} t={t} />
    </div>
  );
}
