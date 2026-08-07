import { notFound } from "next/navigation";
import { AlertTriangle, CalendarClock, Gift, Megaphone, Sparkles, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatClubDuration, formatScheduleDay, interpolate } from "@/lib/i18n/format";
import {
  computeCycleDueDate,
  computeCyclePayoutDate,
  computeMemberStatusForCycle,
  getCurrentCycle,
  isReportForCycle,
  sumApprovedAmount,
} from "@/lib/club";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteCode } from "./invite-code";
import { ActivateClubButton } from "./admin-actions";
import { MemberStatusBadge } from "./status-badge";
import { ClubSubNav } from "./club-sub-nav";
import { ExportButtons } from "./export-buttons";
import type { PaymentHistoryRow } from "@/lib/export";
import { UserTrustBadge } from "@/components/user-trust-badge";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const club = await prisma.savingsClub.findUnique({
    where: { id },
    include: {
      admin: true,
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      paymentReports: { include: { user: true } },
      announcements: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!club) notFound();
  const currentUserId = session!.user.id;
  const isMember = club.members.some((m) => m.userId === currentUserId);
  if (!isMember) notFound();

  const isAdmin = club.adminId === currentUserId;

  const startDate = club.startDate;
  const currentCycle = startDate ? getCurrentCycle(startDate, club.durationUnit, club.durationCount) : null;
  const cycleDueDate =
    startDate && currentCycle
      ? computeCycleDueDate({ startDate, durationUnit: club.durationUnit, paymentDueDay: club.paymentDueDay }, currentCycle)
      : null;

  const payoutMember = currentCycle ? club.members.find((m) => m.payoutTurn === currentCycle) : null;
  const payoutDate =
    startDate && currentCycle
      ? computeCyclePayoutDate({ startDate, durationUnit: club.durationUnit, payoutDay: club.payoutDay }, currentCycle)
      : null;
  const poolTotal = club.monthlyAmount * club.members.length;

  const exportRows: PaymentHistoryRow[] = club.paymentReports
    .slice()
    .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime())
    .map((r) => {
      const member = club.members.find((m) => m.userId === r.userId);
      return {
        member: r.user.fullName,
        turn: member?.payoutTurn ? `#${member.payoutTurn}` : t.clubs.detail.unassigned,
        amount: formatUSD(r.amount),
        paymentDate: formatDate(r.paymentDate, locale),
        method: t.common.paymentMethods[r.method],
        status: t.clubs.detail.status[r.status === "APPROVED" ? "PAID" : r.status === "REJECTED" ? "OVERDUE" : "REPORTED"],
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">{club.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {interpolate(t.dashboard.perMonth, { amount: formatUSD(club.monthlyAmount) })} &middot;{" "}
              {formatClubDuration(t, club.durationUnit, club.durationCount)} &middot;{" "}
              {interpolate(t.clubs.detail.adminLabel, { name: club.admin.fullName })}
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {interpolate(t.clubs.detail.dueOnDay, { day: formatScheduleDay(t, club.durationUnit, club.paymentDueDay) })}
              </span>
              <span className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                {interpolate(t.clubs.detail.payoutOnDay, { day: formatScheduleDay(t, club.durationUnit, club.payoutDay) })}
              </span>
              {club.lateFeeAmount > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t.clubs.new.lateFeeAmount}: {formatUSD(club.lateFeeAmount)}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge variant={club.status === "ACTIVE" ? "default" : "secondary"}>{t.common.clubStatus[club.status]}</Badge>
            <InviteCode code={club.inviteCode} />
          </div>
        </CardHeader>
        {isAdmin && club.status === "PENDING" && (
          <CardContent>
            <ActivateClubButton clubId={club.id} />
          </CardContent>
        )}
      </Card>

      {currentCycle && payoutDate && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {t.clubs.detail.thisMonthsPayout}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {payoutMember ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(payoutMember.user.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{payoutMember.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {interpolate(t.clubs.detail.poolAndDate, {
                      pool: formatUSD(poolTotal),
                      date: formatDate(payoutDate, locale),
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.clubs.detail.payoutRecipientUnassigned}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-primary" />
            {t.clubs.detail.announcementsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {club.announcements.length > 0 ? (
            club.announcements.map((a) => (
              <div key={a.id} className="rounded-md border p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{a.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(a.createdAt, locale)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center text-muted-foreground">
              <Megaphone className="h-6 w-6" />
              <p className="text-sm">{t.clubs.detail.noAnnouncements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            {t.clubs.detail.members}
          </CardTitle>
          {exportRows.length > 0 && <ExportButtons clubName={club.name} rows={exportRows} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.clubs.detail.turn}</TableHead>
                <TableHead>{t.clubs.detail.member}</TableHead>
                <TableHead>{t.clubs.detail.thisMonth}</TableHead>
                <TableHead>{t.clubs.detail.totalSaved}</TableHead>
                <TableHead>{t.reputation.reputationLabel}</TableHead>
                <TableHead className="text-right">{t.clubs.detail.payoutDate}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {club.members.map((member) => {
                const memberReportsForCycle = cycleDueDate
                  ? club.paymentReports.filter(
                      (r) => r.userId === member.userId && isReportForCycle(r, cycleDueDate, club.durationUnit)
                    )
                  : [];
                const status = cycleDueDate
                  ? computeMemberStatusForCycle(memberReportsForCycle, cycleDueDate, club.gracePeriodDays)
                  : "UPCOMING";
                const totalSaved = sumApprovedAmount(
                  club.paymentReports.filter((r) => r.userId === member.userId)
                );
                const memberPayoutDate =
                  startDate && member.payoutTurn
                    ? computeCyclePayoutDate(
                        { startDate, durationUnit: club.durationUnit, payoutDay: club.payoutDay },
                        member.payoutTurn
                      )
                    : null;
                const isSelf = member.userId === currentUserId;
                const isClubMemberAdmin = member.userId === club.adminId;

                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.payoutTurn ? `#${member.payoutTurn}` : t.clubs.detail.unassigned}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{initials(member.user.fullName)}</AvatarFallback>
                        </Avatar>
                        <span>
                          {member.user.fullName}
                          {isSelf && <span className="ml-1 text-xs text-muted-foreground">{t.clubs.detail.you}</span>}
                          {isClubMemberAdmin && (
                            <span className="ml-1 text-xs text-muted-foreground">{t.clubs.detail.adminTag}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge status={status} t={t} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatUSD(totalSaved)}</TableCell>
                    <TableCell>
                      <UserTrustBadge
                        stats={{
                          averageRating: member.user.averageRating,
                          trustTier: member.user.trustTier,
                          punctualityScore: member.user.punctualityScore,
                          completedClubsCount: member.user.completedClubsCount,
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {memberPayoutDate ? formatDate(memberPayoutDate, locale) : t.clubs.detail.tbd}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
