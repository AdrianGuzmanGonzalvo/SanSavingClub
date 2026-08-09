import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Building2, Contact, Gift, HandCoins, Users, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatUSD } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClubStatusBadge } from "@/components/club-status-badge";
import { ContactsExportButton } from "./contacts-export-button";

export default async function ReportsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const clubs = await prisma.savingsClub.findMany({
    where: { adminId: userId, status: { not: "CANCELLED" } },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      paymentReports: { where: { status: "APPROVED" } },
      cycles: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const openClubsCount = clubs.filter((c) => c.status === "ACTIVE" || c.status === "PENDING").length;

  const clubSummaries = clubs.map((club) => {
    const totalTarget = club.quotaAmount * club.durationCount;
    const received = club.paymentReports.reduce((sum, r) => sum + r.amount, 0);
    const paidOut = club.cycles
      .filter((c) => c.isCompleted)
      .reduce((sum, c) => sum + (c.payoutAmount ?? club.quotaAmount * club.members.length), 0);
    const endDate = club.cycles.find((c) => c.cycleNumber === club.durationCount)?.payoutDate ?? null;
    return {
      clubId: club.id,
      name: club.name,
      status: club.status,
      memberCount: club.members.length,
      totalTarget,
      received,
      paidOut,
      startDate: club.startDate,
      endDate,
    };
  });

  const montoTotal = clubSummaries.reduce((sum, c) => sum + c.totalTarget, 0);
  const montoRecibido = clubSummaries.reduce((sum, c) => sum + c.received, 0);
  const montoEntregado = clubSummaries.reduce((sum, c) => sum + c.paidOut, 0);

  const contactsMap = new Map<
    string,
    { userId: string; fullName: string; email: string; phone: string | null; clubNames: string[] }
  >();
  for (const club of clubs) {
    for (const m of club.members) {
      const existing = contactsMap.get(m.userId);
      if (existing) {
        existing.clubNames.push(club.name);
      } else {
        contactsMap.set(m.userId, {
          userId: m.userId,
          fullName: m.user.fullName,
          email: m.user.email,
          phone: m.user.phone,
          clubNames: [club.name],
        });
      }
    }
  }
  const contacts = Array.from(contactsMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.reports.title}</h1>
          <p className="text-muted-foreground">{t.reports.subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Building2 className="h-6 w-6" />
            <p className="font-medium">{t.reports.noClubs}</p>
            <p className="text-sm">{t.reports.noClubsHint}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.reports.title}</h1>
        <p className="text-muted-foreground">{t.reports.subtitle}</p>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="summary">
            <BarChart3 /> {t.reports.tabs.summary}
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users /> {t.reports.tabs.members}
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Contact /> {t.reports.tabs.contacts}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-6">
                <p className="flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" /> {t.reports.openClubs}
                </p>
                <p className="mt-1 text-[1.65rem] font-bold tabular-nums">{openClubsCount}</p>
                <p className="text-xs text-muted-foreground">{t.reports.openClubsHint}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-6">
                <p className="flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" /> {t.reports.totalAmount}
                </p>
                <p className="mt-1 text-[1.65rem] font-bold tabular-nums">{formatUSD(montoTotal)}</p>
                <p className="text-xs text-muted-foreground">{t.reports.totalAmountHint}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <p className="flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground">
                  <HandCoins className="h-3.5 w-3.5" /> {t.reports.receivedAmount}
                </p>
                <p className="mt-1 text-[1.65rem] font-bold tabular-nums text-primary">{formatUSD(montoRecibido)}</p>
                <p className="text-xs text-muted-foreground">{t.reports.receivedAmountHint}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <p className="flex items-center gap-1.5 text-[0.85rem] font-medium text-muted-foreground">
                  <Gift className="h-3.5 w-3.5" /> {t.reports.paidOutAmount}
                </p>
                <p className="mt-1 text-[1.65rem] font-bold tabular-nums">{formatUSD(montoEntregado)}</p>
                <p className="text-xs text-muted-foreground">{t.reports.paidOutAmountHint}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.reports.perClubTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.reports.tableClub}</TableHead>
                    <TableHead>{t.reports.tableStatus}</TableHead>
                    <TableHead>{t.reports.tableStartDate}</TableHead>
                    <TableHead>{t.reports.tableEndDate}</TableHead>
                    <TableHead className="text-right">{t.reports.tableMembers}</TableHead>
                    <TableHead className="text-right">{t.reports.tableTotal}</TableHead>
                    <TableHead className="text-right">{t.reports.tableReceived}</TableHead>
                    <TableHead className="text-right">{t.reports.tablePaidOut}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubSummaries.map((c) => (
                    <TableRow key={c.clubId}>
                      <TableCell className="font-medium">
                        <Link href={`/clubs/${c.clubId}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <ClubStatusBadge status={c.status} t={t} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.startDate ? formatDate(c.startDate, locale) : t.reports.notStartedYet}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.endDate ? formatDate(c.endDate, locale) : t.reports.noEndDateYet}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{c.memberCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(c.totalTarget)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(c.received)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(c.paidOut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4 flex flex-col gap-4">
          {clubs.map((club) => (
            <Card key={club.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/clubs/${club.id}`} className="hover:underline">
                      {club.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{interpolate(t.reports.membersCount, { n: club.members.length })}</CardDescription>
                </div>
                <ClubStatusBadge status={club.status} t={t} />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {club.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{m.user.email}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {m.payoutTurn ? interpolate(t.reports.turnLabel, { turn: m.payoutTurn }) : t.reports.turnUnassigned}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{t.reports.contactsTitle}</CardTitle>
                <CardDescription>{t.reports.contactsHint}</CardDescription>
              </div>
              <ContactsExportButton
                rows={contacts.map((c) => ({
                  name: c.fullName,
                  email: c.email,
                  phone: c.phone ?? "",
                  clubs: c.clubNames.join("; "),
                }))}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.reports.tableName}</TableHead>
                    <TableHead>{t.reports.tableEmail}</TableHead>
                    <TableHead>{t.reports.tablePhone}</TableHead>
                    <TableHead>{t.reports.tableClubs}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.userId}>
                      <TableCell className="font-medium">{c.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone ?? t.reports.noPhone}</TableCell>
                      <TableCell className="text-muted-foreground">{c.clubNames.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
