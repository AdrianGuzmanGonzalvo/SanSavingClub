import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/format";
import { buildAnonymousNumbering, computeMemberStatusForCycle, resolveMemberDisplayName } from "@/lib/club";
import { ClubSubNav } from "../club-sub-nav";
import { ClubCalendarClient, type CycleInfo } from "./calendar-client";

export default async function ClubCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const t = getDictionary(await getLocale());

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      paymentReports: true,
      cycles: { orderBy: { cycleNumber: "asc" } },
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isAdmin = club.adminId === currentUserId;
  const isParticipant = club.members.some((m) => m.userId === currentUserId);
  if (!isParticipant && !isAdmin) notFound();

  const anonymousNumbering = buildAnonymousNumbering(
    club.members.map((m) => ({ userId: m.userId, joinedAt: m.joinedAt, isAdmin: m.userId === club.adminId }))
  );
  const displayNameFor = (member: { userId: string; user: { fullName: string } }): string =>
    resolveMemberDisplayName({
      targetUserId: member.userId,
      targetFullName: member.user.fullName,
      targetIsAdmin: member.userId === club.adminId,
      viewerUserId: currentUserId,
      viewerIsAdmin: isAdmin,
      allowViewOtherNames: club.allowMembersToViewOtherNames,
      anonymousNumbering,
      anonymousLabel: (n: number) => interpolate(t.clubs.detail.anonymousMember, { n }),
    });

  const cycles: CycleInfo[] = club.cycles.map(({ cycleNumber, paymentDueDate, payoutDate }) => {
    const paidMembers: string[] = [];
    const pendingMembers: string[] = [];
    let hasOverdue = false;

    for (const member of club.members) {
      const reports = club.paymentReports.filter(
        (r) => r.userId === member.userId && r.cycleNumber === cycleNumber
      );
      const status = computeMemberStatusForCycle(reports, paymentDueDate, club.gracePeriodDays);
      if (status === "PAID") paidMembers.push(displayNameFor(member));
      else pendingMembers.push(displayNameFor(member));
      if (status === "OVERDUE") hasOverdue = true;
    }

    const dueColor: CycleInfo["dueColor"] = pendingMembers.length === 0 ? "green" : hasOverdue ? "red" : "amber";

    const payoutMember = club.members.find((m) => m.payoutTurn === cycleNumber);
    const canSeeThisTurn =
      !payoutMember ||
      payoutMember.userId === currentUserId ||
      isAdmin ||
      payoutMember.userId === club.adminId ||
      club.allowMembersToViewOtherTurns;

    return {
      cycle: cycleNumber,
      dueDateISO: paymentDueDate.toISOString(),
      payoutDateISO: payoutDate.toISOString(),
      dueColor,
      paidMembers,
      pendingMembers,
      payoutMemberName: payoutMember && canSeeThisTurn ? displayNameFor(payoutMember) : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} isParticipant={isParticipant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.clubs.calendar.title}</h1>
        <p className="text-muted-foreground">{interpolate(t.clubs.calendar.subtitle, { club: club.name })}</p>
      </div>

      <ClubCalendarClient cycles={cycles} notActive={club.cycles.length === 0} />
    </div>
  );
}
