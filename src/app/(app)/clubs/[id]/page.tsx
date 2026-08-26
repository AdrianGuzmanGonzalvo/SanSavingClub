import { notFound } from "next/navigation";
import { CheckCircle2, Crown, Megaphone, RefreshCw, Sparkles, Users } from "lucide-react";
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
import { goldTeal } from "@/lib/theme";
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
import { TurnRoute } from "./turn-route";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-amber-300/15 px-3 py-2">
      <p className="text-xs font-medium text-amber-100/80">{label}</p>
      <p className="truncate text-sm font-bold text-amber-200">{value}</p>
    </div>
  );
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

      {currentCycle && payoutDate && cycleDueDate && (
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Sparkles className="h-5 w-5 text-emerald-200" />
              <span className="text-base font-bold tracking-wide text-emerald-100">
                {t.clubs.detail.greetingsTitle}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-4">
            <p className="text-base font-medium text-white/90">
              {interpolate(t.clubs.detail.clubWelcome, { user: session!.user.name ?? "", name: club.name })}
            </p>
            <div className="border-t border-white/10 pt-3">
              <TurnRoute
                members={club.members
                  .filter((member) => member.payoutTurn !== null)
                  .sort((a, b) => a.payoutTurn! - b.payoutTurn!)
                  .map((member) => ({
                    id: member.id,
                    initials: initials(displayNameFor(member)),
                    turn: member.payoutTurn!,
                    isCurrent: member.payoutTurn === currentCycle,
                    isDone: member.payoutTurn! < currentCycle,
                  }))}
                currentTurn={currentCycle}
                clubName={club.name}
                headline={
                  payoutMember
                    ? interpolate(t.clubs.detail.turnRouteHeadline, {
                        turn: currentCycle,
                        total: club.members.filter((m) => m.payoutTurn !== null).length,
                        name: displayNameFor(payoutMember),
                      })
                    : t.clubs.detail.payoutRecipientUnassigned
                }
                poolLabel={interpolate(t.clubs.detail.poolAmountLabel, { pool: formatUSD(payoutAmount) })}
                payoutDateLabel={interpolate(t.clubs.detail.payoutDateLabel, { date: formatDate(payoutDate, locale) })}
                action={
                  isAdmin && payoutMember && currentCycleRow && !currentCycleRow.isCompleted ? (
                    <MarkPayoutButton clubId={club.id} />
                  ) : undefined
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`relative overflow-hidden border-none ${goldTeal} text-white shadow-lg`}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <CardHeader className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-sm font-bold text-white">
              {initials(club.name)}
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-bold text-white">{club.name}</CardTitle>
              <p className="text-sm font-medium text-white/70">
                {formatClubDuration(t, club.durationUnit, club.durationCount)} &middot;{" "}
                {interpolate(t.clubs.detail.adminLabel, { name: club.admin.fullName })}
                {club.lateFeeAmount > 0 &&
                  ` · ${t.clubs.new.lateFeeAmount}: ${formatUSD(club.lateFeeAmount)}`}
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
            <InviteCode code={club.inviteCode} className="border-white/20 bg-white/10 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatChip label={t.clubs.detail.quotaChipLabel} value={formatUSD(club.quotaAmount)} />
            <StatChip
              label={t.clubs.detail.totalChipLabel}
              value={formatUSD(club.quotaAmount * club.durationCount)}
            />
            <StatChip
              label={t.clubs.detail.dueDayChipLabel}
              value={formatScheduleDay(t, club.durationUnit, club.paymentDueDay)}
            />
            <StatChip
              label={t.clubs.detail.payoutDayChipLabel}
              value={formatScheduleDay(t, club.durationUnit, club.payoutDay)}
            />
            {currentCycle && cycleDueDate && (
              <StatChip label={t.clubs.detail.nextCloseLabel} value={formatDate(cycleDueDate, locale)} />
            )}
          </div>
          {isAdmin && club.status === "PENDING" && <ActivateClubButton clubId={club.id} />}
        </CardContent>
      </Card>

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

      {isAdmin && (
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
      )}

      <PaymentHistoryCard clubId={club.id} entries={paymentHistoryEntries} restricted={!canViewAllPayments} isAdmin={isAdmin} />
    </div>
  );
}
