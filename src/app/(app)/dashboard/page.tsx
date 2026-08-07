import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, Link2, Plus, Users, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatClubDuration, interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getCurrentCycleFromRows, isReportForCycle, sumApprovedAmount } from "@/lib/club";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClubStatusBadge } from "@/components/club-status-badge";
import { UserTrustBadge } from "@/components/user-trust-badge";
import type { ClubCycle, ClubMember, SavingsClub } from "@prisma/client";

type MembershipWithClub = ClubMember & { club: SavingsClub & { cycles: ClubCycle[] } };

export default async function DashboardPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const session = await auth();
  const userId = session!.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { averageRating: true, trustTier: true, punctualityScore: true, completedClubsCount: true },
  });
  // The session JWT can outlive the underlying user row (e.g. a dev DB reset,
  // or the account was deleted) — bounce back to login instead of crashing.
  if (!currentUser) redirect("/login");

  const memberships = await prisma.clubMember.findMany({
    where: { userId },
    include: { club: { include: { cycles: { orderBy: { cycleNumber: "asc" } } } } },
    orderBy: { joinedAt: "desc" },
  });

  const clubIds = memberships.map((m) => m.clubId);

  const reports = await prisma.paymentReport.findMany({
    where: { userId, clubId: { in: clubIds } },
  });

  const accumulated = sumApprovedAmount(reports);

  const targetTotal = memberships.reduce(
    (sum, m) => sum + m.club.quotaAmount * m.club.durationCount,
    0
  );

  const progressPct = targetTotal > 0 ? Math.min(100, Math.round((accumulated / targetTotal) * 100)) : 0;

  const upcomingDues = memberships
    .filter((m) => m.club.status === "ACTIVE" && m.club.cycles.length > 0)
    .map((m) => {
      const cycleNumber = getCurrentCycleFromRows(m.club.cycles);
      const dueDate = m.club.cycles.find((c) => c.cycleNumber === cycleNumber)!.paymentDueDate;
      const alreadyHandled = reports.some(
        (r) => r.clubId === m.clubId && r.status !== "REJECTED" && isReportForCycle(r, dueDate, m.club.durationUnit)
      );
      return { club: m.club, dueDate, alreadyHandled };
    })
    .filter((d) => !d.alreadyHandled)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const nextDue = upcomingDues[0];

  const managedClubs = memberships.filter((m) => m.club.adminId === userId);
  const joinedClubs = memberships.filter((m) => m.club.adminId !== userId);

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <CardContent className="relative flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">{t.dashboard.title}</h1>
          <p className="text-white/80">{interpolate(t.dashboard.welcome, { name: session!.user.name ?? "" })}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t.dashboard.totalProgress}
            </CardTitle>
            <CardDescription>{t.dashboard.acrossClubs}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{formatUSD(accumulated)}</span>
              <span className="text-sm text-muted-foreground">
                {interpolate(t.dashboard.of, { target: formatUSD(targetTotal) })}
              </span>
            </div>
            <Progress value={progressPct} />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">{t.dashboard.nextAction}</CardTitle>
            <CardDescription>{t.dashboard.upcomingDue}</CardDescription>
          </CardHeader>
          <CardContent>
            {nextDue ? (
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold">{formatUSD(nextDue.club.quotaAmount)}</span>
                <span className="text-sm text-muted-foreground">
                  {nextDue.club.name} &middot; {formatDate(nextDue.dueDate, locale)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                {t.dashboard.noUpcoming}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t.reputation.yourReputation}</span>
          <UserTrustBadge variant="full" stats={currentUser} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/clubs/new">
            <Plus /> {t.dashboard.createClub}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/clubs/join">
            <Link2 /> {t.dashboard.joinCode}
          </Link>
        </Button>
      </div>

      <ClubSection
        title={t.dashboard.clubsYouManage}
        emptyMessage={t.dashboard.noManagedClubs}
        memberships={managedClubs}
        t={t}
      />
      <ClubSection
        title={t.dashboard.clubsYouveJoined}
        emptyMessage={t.dashboard.noJoinedClubs}
        memberships={joinedClubs}
        t={t}
      />
    </div>
  );
}

function ClubSection({
  title,
  emptyMessage,
  memberships,
  t,
}: {
  title: string;
  emptyMessage: string;
  memberships: MembershipWithClub[];
  t: Dictionary;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {memberships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Users className="h-6 w-6" />
            <span>{emptyMessage}</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memberships.map((m) => (
            <Link key={m.id} href={`/clubs/${m.clubId}`}>
              <Card className="border-l-4 border-l-emerald-500/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-l-emerald-500 hover:shadow-lg">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{m.club.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {interpolate(t.dashboard.perMonth, { amount: formatUSD(m.club.quotaAmount) })} &middot;{" "}
                      {formatClubDuration(t, m.club.durationUnit, m.club.durationCount)} &middot;{" "}
                      {m.payoutTurn ? interpolate(t.dashboard.yourTurn, { turn: m.payoutTurn }) : t.dashboard.turnUnassigned}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClubStatusBadge status={m.club.status} t={t} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
