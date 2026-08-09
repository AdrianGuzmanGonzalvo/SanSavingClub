import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Link2, Plus, Shield, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatClubDuration, interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getCurrentCycleFromRows, sumApprovedAmount } from "@/lib/club";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClubStatusBadge } from "@/components/club-status-badge";
import { UserTrustBadge } from "@/components/user-trust-badge";
import type { ClubCycle, SavingsClub } from "@prisma/client";

type ClubWithCycles = SavingsClub & { cycles: ClubCycle[] };
type ClubCard = { clubId: string; club: ClubWithCycles; payoutTurn: number | null; isParticipant: boolean };

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
    where: { userId, club: { status: { not: "CANCELLED" } } },
    include: { club: { include: { cycles: { orderBy: { cycleNumber: "asc" } } } } },
    orderBy: { joinedAt: "desc" },
  });

  // A club's admin isn't necessarily a participant (e.g. someone who only
  // organizes the club) — those clubs have no ClubMember row for them, so
  // they need a separate query to still show up under "clubs you manage".
  const adminOnlyClubs = await prisma.savingsClub.findMany({
    where: { adminId: userId, status: { not: "CANCELLED" }, members: { none: { userId } } },
    include: { cycles: { orderBy: { cycleNumber: "asc" } } },
    orderBy: { createdAt: "desc" },
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
        (r) => r.clubId === m.clubId && r.status !== "REJECTED" && r.cycleNumber === cycleNumber
      );
      return { club: m.club, dueDate, alreadyHandled };
    })
    .filter((d) => !d.alreadyHandled)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const nextDue = upcomingDues[0];
  const showProgress = accumulated > 0;
  const showNextAction = Boolean(nextDue);

  const managedClubs: ClubCard[] = [
    ...memberships
      .filter((m) => m.club.adminId === userId)
      .map((m) => ({ clubId: m.clubId, club: m.club, payoutTurn: m.payoutTurn, isParticipant: true })),
    ...adminOnlyClubs.map((club) => ({ clubId: club.id, club, payoutTurn: null, isParticipant: false })),
  ];
  const joinedClubs: ClubCard[] = memberships
    .filter((m) => m.club.adminId !== userId)
    .map((m) => ({ clubId: m.clubId, club: m.club, payoutTurn: m.payoutTurn, isParticipant: true }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <CardContent className="relative flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{t.dashboard.title}</h1>
            <UserTrustBadge variant="compact" tone="onDark" stats={currentUser} />
          </div>
          <p className="text-white/80">{interpolate(t.dashboard.welcome, { name: session!.user.name ?? "" })}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
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

        {managedClubs.length > 0 && (
          <ClubSection
            title={t.dashboard.clubsYouManage}
            emptyMessage={t.dashboard.noManagedClubs}
            clubs={managedClubs}
            t={t}
            icon={Shield}
          />
        )}
        {joinedClubs.length > 0 && (
          <ClubSection
            title={t.dashboard.clubsYouveJoined}
            emptyMessage={t.dashboard.noJoinedClubs}
            clubs={joinedClubs}
            t={t}
            icon={Users}
          />
        )}
      </div>

      {(showProgress || showNextAction) && (
        <div className={`grid gap-4 ${showProgress && showNextAction ? "sm:grid-cols-2" : ""}`}>
          {showProgress && (
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
          )}

          {showNextAction && (
            <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{t.dashboard.nextAction}</CardTitle>
                <CardDescription>{t.dashboard.upcomingDue}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold">{formatUSD(nextDue!.club.quotaAmount)}</span>
                  <span className="text-sm text-muted-foreground">
                    {nextDue!.club.name} &middot; {formatDate(nextDue!.dueDate, locale)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ClubSection({
  title,
  emptyMessage,
  clubs,
  t,
  icon: Icon,
}: {
  title: string;
  emptyMessage: string;
  clubs: ClubCard[];
  t: Dictionary;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-lg font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      {clubs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Users className="h-6 w-6" />
            <span>{emptyMessage}</span>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-3 ${clubs.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {clubs.map((c) => (
            <Link key={c.clubId} href={`/clubs/${c.clubId}`}>
              <Card className="border-l-4 border-l-emerald-500/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-l-emerald-500 hover:shadow-lg">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{c.club.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {interpolate(t.dashboard.perMonth, { amount: formatUSD(c.club.quotaAmount) })} &middot;{" "}
                      {formatClubDuration(t, c.club.durationUnit, c.club.durationCount)} &middot;{" "}
                      {!c.isParticipant
                        ? t.dashboard.managingOnly
                        : c.payoutTurn
                          ? interpolate(t.dashboard.yourTurn, { turn: c.payoutTurn })
                          : t.dashboard.turnUnassigned}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClubStatusBadge status={c.club.status} t={t} />
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
