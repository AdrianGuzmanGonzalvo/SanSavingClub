import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/format";
import { computeMemberStatusForCycle, getAllCycleDates, isReportForCycle } from "@/lib/club";
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
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isAdmin = club.adminId === currentUserId;
  if (!club.members.some((m) => m.userId === currentUserId)) notFound();

  const startDate = club.startDate;

  let cycles: CycleInfo[] = [];
  if (startDate) {
    const schedule = {
      startDate,
      durationUnit: club.durationUnit,
      durationCount: club.durationCount,
      paymentDueDay: club.paymentDueDay,
      payoutDay: club.payoutDay,
    };
    cycles = getAllCycleDates(schedule).map(({ cycle, dueDate, payoutDate }) => {
      const paidMembers: string[] = [];
      const pendingMembers: string[] = [];
      let hasOverdue = false;

      for (const member of club.members) {
        const reports = club.paymentReports.filter(
          (r) => r.userId === member.userId && isReportForCycle(r, dueDate, club.durationUnit)
        );
        const status = computeMemberStatusForCycle(reports, dueDate, club.gracePeriodDays);
        if (status === "PAID") paidMembers.push(member.user.fullName);
        else pendingMembers.push(member.user.fullName);
        if (status === "OVERDUE") hasOverdue = true;
      }

      const dueColor: CycleInfo["dueColor"] = pendingMembers.length === 0 ? "green" : hasOverdue ? "red" : "amber";

      const payoutMember = club.members.find((m) => m.payoutTurn === cycle);

      return {
        cycle,
        dueDateISO: dueDate.toISOString(),
        payoutDateISO: payoutDate.toISOString(),
        dueColor,
        paidMembers,
        pendingMembers,
        payoutMemberName: payoutMember?.user.fullName ?? null,
      };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.clubs.calendar.title}</h1>
        <p className="text-muted-foreground">{interpolate(t.clubs.calendar.subtitle, { club: club.name })}</p>
      </div>

      <ClubCalendarClient cycles={cycles} notActive={!startDate} />
    </div>
  );
}
