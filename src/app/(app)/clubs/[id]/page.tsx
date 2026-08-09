import { notFound } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, Crown, Gift, Megaphone, RefreshCw, Sparkles, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatClubDuration, formatScheduleDay, interpolate } from "@/lib/i18n/format";
import {
  buildAnonymousNumbering,
  computeMemberStatusForCycle,
  getCurrentCycleFromRows,
  resolveMemberDisplayName,
} from "@/lib/club";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClubStatusBadge } from "@/components/club-status-badge";
import { InviteCode } from "./invite-code";
import { ActivateClubButton } from "./admin-actions";
import { MarkPayoutButton } from "./mark-payout-button";
import { MemberStatusBadge } from "./status-badge";
import { ClubSubNav } from "./club-sub-nav";
import { ExportButtons } from "./export-buttons";
import type { PaymentHistoryRow } from "@/lib/export";
import { PaymentHistoryCard, type PaymentHistoryEntry } from "./payment-history";

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

  const currentCycle = club.cycles.length > 0 ? getCurrentCycleFromRows(club.cycles) : null;
  const currentCycleRow = currentCycle ? club.cycles.find((c) => c.cycleNumber === currentCycle) : null;
  const cycleDueDate = currentCycleRow?.paymentDueDate ?? null;

  const payoutMember = currentCycle ? club.members.find((m) => m.payoutTurn === currentCycle) : null;
  const payoutDate = currentCycleRow?.payoutDate ?? null;
  const poolTotal = club.quotaAmount * club.members.length;
  const payoutAmount = currentCycleRow?.payoutAmount ?? poolTotal;

  const canViewAllPayments = isAdmin;

  const paymentHistoryEntries: PaymentHistoryEntry[] = club.paymentReports
    .filter((r) => r.status === "APPROVED" && (canViewAllPayments || r.userId === currentUserId))
    .slice()
    .sort((a, b) => (b.approvedAt?.getTime() ?? 0) - (a.approvedAt?.getTime() ?? 0))
    .map((r) => {
      const member = club.members.find((m) => m.userId === r.userId);
      return {
        id: r.id,
        memberName: member?.user.fullName ?? t.clubs.detail.unassigned,
        cycleNumber: r.cycleNumber,
        amount: formatUSD(r.amount),
        submittedOn: formatDate(r.createdAt, locale),
        approvedOn: r.approvedAt ? formatDate(r.approvedAt, locale) : null,
        receiptUrl: r.receiptUrl,
      };
    });

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
      <ClubSubNav clubId={club.id} isAdmin={isAdmin} isParticipant={isParticipant} />

      <Card className="shadow-[0_4px_20px_-2px_rgba(5,150,105,0.08)]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]">
              {initials(club.name)}
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{club.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {interpolate(t.dashboard.perMonth, { amount: formatUSD(club.quotaAmount) })} &middot;{" "}
                {interpolate(t.clubs.detail.totalClubAmount, {
                  amount: formatUSD(club.quotaAmount * club.durationCount),
                })}{" "}
                &middot; {formatClubDuration(t, club.durationUnit, club.durationCount)} &middot;{" "}
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
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {club.isPreExisting && currentCycle && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  {interpolate(t.clubs.detail.ongoingBadge, { current: currentCycle, total: club.durationCount })}
                </Badge>
              )}
              <ClubStatusBadge status={club.status} t={t} />
            </div>
            <InviteCode code={club.inviteCode} />
          </div>
        </CardHeader>
        {isAdmin && club.status === "PENDING" && (
          <CardContent>
            <ActivateClubButton clubId={club.id} />
          </CardContent>
        )}
      </Card>

      {currentCycle && payoutDate && cycleDueDate && (
        <Card
          className="border-none text-white shadow-[0_8px_30px_-6px_rgba(4,61,46,0.5)]"
          style={{ background: "linear-gradient(180deg, #064e3b 0%, #043d2e 100%)" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-[0.85rem] font-semibold tracking-wide text-emerald-200">
                {t.clubs.detail.thisMonthsPayout}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-emerald-100">
                {interpolate(t.clubs.detail.dueBanner, { date: formatDate(cycleDueDate, locale) })}
              </span>
              <span className="text-sm font-medium text-emerald-100">
                {interpolate(t.clubs.detail.payoutBannerTurn, { turn: currentCycle, date: formatDate(payoutDate, locale) })}
              </span>
            </div>
            <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
              {payoutMember ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-white/20">
                    <AvatarFallback className="bg-white/15 text-base font-semibold text-white">
                      {initials(displayNameFor(payoutMember))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-semibold text-white">{displayNameFor(payoutMember)}</p>
                    <p className="text-sm text-emerald-100/80">
                      {interpolate(t.clubs.detail.poolAndDate, {
                        pool: formatUSD(payoutAmount),
                        date: formatDate(payoutDate, locale),
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-100/80">{t.clubs.detail.payoutRecipientUnassigned}</p>
              )}
              {isAdmin && payoutMember && currentCycleRow && !currentCycleRow.isCompleted && (
                <MarkPayoutButton clubId={club.id} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentCycle && cycleDueDate && (
        <Card>
          <CardContent className="pt-6">
            <p className="flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> {t.clubs.detail.nextCloseLabel}
            </p>
            <p className="mt-1 text-xl font-bold">{formatDate(cycleDueDate, locale)}</p>
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
        <CardContent className="flex flex-col gap-2">
          {club.members.map((member) => {
            const memberReportsForCycle = currentCycle
              ? club.paymentReports.filter((r) => r.userId === member.userId && r.cycleNumber === currentCycle)
              : [];
            const status = cycleDueDate
              ? computeMemberStatusForCycle(memberReportsForCycle, cycleDueDate, club.gracePeriodDays)
              : "UPCOMING";
            const isSelf = member.userId === currentUserId;
            const isClubMemberAdmin = member.userId === club.adminId;
            const memberDisplayName = displayNameFor(member);

            const canSeeTurn = isSelf || isAdmin || isClubMemberAdmin || club.allowMembersToViewOtherTurns;
            const canSeePayoutDate = isSelf || isAdmin || isClubMemberAdmin || club.allowMembersToViewOtherPayoutDates;
            const memberPayoutDate = member.payoutTurn
              ? (club.cycles.find((c) => c.cycleNumber === member.payoutTurn)?.payoutDate ?? null)
              : null;
            const detailFragments: string[] = [];
            if (canSeeTurn && member.payoutTurn) {
              detailFragments.push(interpolate(t.clubs.detail.turnBadgeLabel, { turn: member.payoutTurn }));
            }
            if (canSeePayoutDate && memberPayoutDate) {
              detailFragments.push(interpolate(t.clubs.detail.payoutDateLabel, { date: formatDate(memberPayoutDate, locale) }));
            }

            let subMessage: string;
            if (status === "PAID") {
              const approved = memberReportsForCycle.find((r) => r.status === "APPROVED");
              subMessage = interpolate(t.clubs.detail.contributedOn, {
                date: formatDate(approved?.approvedAt ?? approved?.paymentDate ?? new Date(), locale),
              });
            } else if (status === "REPORTED") {
              subMessage = t.clubs.detail.reportedPendingReview;
            } else if (status === "OVERDUE" && cycleDueDate) {
              subMessage = interpolate(t.clubs.detail.overdueSince, { date: formatDate(cycleDueDate, locale) });
            } else {
              subMessage = t.clubs.detail.notYetDue;
            }

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-900/[0.08] bg-muted p-3 dark:border-white/[0.06]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {initials(memberDisplayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{memberDisplayName}</span>
                      {isSelf && <span className="text-xs text-muted-foreground">{t.clubs.detail.you}</span>}
                      {isClubMemberAdmin && (
                        <span className="flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          <Crown className="h-2.5 w-2.5" /> {t.clubs.detail.adminTag}
                        </span>
                      )}
                      {member.payoutPaid && (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" /> {t.clubs.detail.payoutReceivedTag}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{subMessage}</p>
                    {detailFragments.length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">{detailFragments.join(" · ")}</p>
                    )}
                  </div>
                </div>
                <MemberStatusBadge status={status} t={t} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <PaymentHistoryCard clubId={club.id} entries={paymentHistoryEntries} restricted={!canViewAllPayments} isAdmin={isAdmin} />
    </div>
  );
}
