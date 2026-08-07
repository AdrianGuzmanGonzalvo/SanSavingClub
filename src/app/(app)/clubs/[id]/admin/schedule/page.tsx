import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { Card, CardContent } from "@/components/ui/card";
import { ClubSubNav } from "../../club-sub-nav";
import { CycleScheduleEditor, type CycleFrequencyOption, type ScheduleRow } from "./cycle-schedule-editor";
import type { Frequency } from "@prisma/client";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDropdownFrequency(frequency: Frequency): CycleFrequencyOption {
  return frequency === "EVERY_OTHER_WEEK" ? "BI_WEEKLY" : frequency;
}

export default async function ClubSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const t = getDictionary(await getLocale());

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
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

  const rows: ScheduleRow[] = club.cycles.map((cycle) => {
    const member = club.members.find((m) => m.payoutTurn === cycle.cycleNumber);
    return {
      cycleNumber: cycle.cycleNumber,
      memberName: member?.user.fullName ?? null,
      paymentDueDate: toDateInputValue(cycle.paymentDueDate),
      payoutDate: toDateInputValue(cycle.payoutDate),
      cycleFrequency: toDropdownFrequency(cycle.cycleFrequency ?? club.frequency),
    };
  });

  const potTotal = club.quotaAmount * club.members.length;
  const canEdit = club.status === "PENDING" || club.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} />
      <CycleScheduleEditor clubId={club.id} clubName={club.name} rows={rows} potTotal={potTotal} canEdit={canEdit} />
    </div>
  );
}
