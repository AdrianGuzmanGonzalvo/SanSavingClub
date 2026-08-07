"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode, getCurrentCycle } from "@/lib/club";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatScheduleDay, interpolate } from "@/lib/i18n/format";
import { isPaymentOnTime, recordClubCompletion, recordPaymentApproval, recordRating } from "@/lib/reputation";
import type { DurationUnit, PaymentMethod } from "@prisma/client";

export interface ClubFormState {
  error?: string;
}

const ALLOWED_METHODS: PaymentMethod[] = ["ZELLE", "CASH_APP", "BANK_TRANSFER", "CASH", "OTHER"];
const ALLOWED_UNITS: DurationUnit[] = ["WEEK", "MONTH"];
const DURATION_COUNT_BOUNDS: Record<DurationUnit, [number, number]> = {
  WEEK: [1, 52],
  MONTH: [1, 24],
};
const DUE_DAY_BOUNDS: Record<DurationUnit, [number, number]> = {
  WEEK: [0, 6],
  MONTH: [1, 31],
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Posts a system-authored announcement so members are notified of a schedule/turn change. */
async function postAuditAnnouncement(clubId: string, authorId: string, title: string, content: string) {
  await prisma.announcement.create({ data: { clubId, authorId, title, content } });
}

export async function createClubAction(_prevState: ClubFormState, formData: FormData): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const name = String(formData.get("name") ?? "").trim();
  const monthlyAmount = Number(formData.get("monthlyAmount"));
  const durationUnit = String(formData.get("durationUnit") ?? "") as DurationUnit;
  const durationCount = Number(formData.get("durationCount"));
  const paymentDueDay = Number(formData.get("paymentDueDay"));
  const payoutDay = Number(formData.get("payoutDay"));
  const lateFeeAmount = Number(formData.get("lateFeeAmount") || 0);

  if (!name) return { error: t.clubs.new.errors.nameRequired };
  if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) return { error: t.clubs.new.errors.invalidAmount };
  if (!ALLOWED_UNITS.includes(durationUnit)) return { error: t.clubs.new.errors.invalidDuration };
  const [countMin, countMax] = DURATION_COUNT_BOUNDS[durationUnit];
  if (!Number.isInteger(durationCount) || durationCount < countMin || durationCount > countMax) {
    return { error: t.clubs.new.errors.invalidDuration };
  }
  const [dayMin, dayMax] = DUE_DAY_BOUNDS[durationUnit];
  if (!Number.isInteger(paymentDueDay) || paymentDueDay < dayMin || paymentDueDay > dayMax) {
    return { error: t.clubs.new.errors.invalidDueDay };
  }
  if (!Number.isInteger(payoutDay) || payoutDay < dayMin || payoutDay > dayMax) {
    return { error: t.clubs.new.errors.invalidPayoutDay };
  }

  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.savingsClub.findUnique({ where: { inviteCode } });
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const club = await prisma.savingsClub.create({
    data: {
      name,
      monthlyAmount,
      durationUnit,
      durationCount,
      paymentDueDay,
      payoutDay,
      lateFeeAmount: Number.isFinite(lateFeeAmount) && lateFeeAmount >= 0 ? lateFeeAmount : 0,
      inviteCode,
      adminId: session.user.id,
      members: {
        create: { userId: session.user.id, payoutTurn: null },
      },
    },
  });

  // Creating a club promotes a plain member to the "Community Leader" tier.
  await prisma.user.updateMany({
    where: { id: session.user.id, role: "USER" },
    data: { role: "COMMUNITY_LEADER" },
  });

  redirect(`/clubs/${club.id}`);
}

export async function joinClubAction(_prevState: ClubFormState, formData: FormData): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const inviteCode = String(formData.get("inviteCode") ?? "").trim().toUpperCase();
  if (!inviteCode) return { error: t.clubs.join.errors.codeRequired };

  const club = await prisma.savingsClub.findUnique({
    where: { inviteCode },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.join.errors.notFound };
  if (club.status === "COMPLETED" || club.status === "CANCELLED") {
    return { error: t.clubs.join.errors.notAccepting };
  }
  if (club.members.some((m) => m.userId === session.user.id)) {
    redirect(`/clubs/${club.id}`);
  }
  if (club.members.length >= club.durationCount) {
    return { error: t.clubs.join.errors.full };
  }

  await prisma.clubMember.create({
    data: { clubId: club.id, userId: session.user.id, payoutTurn: null },
  });

  redirect(`/clubs/${club.id}`);
}

export async function removeMemberAction(clubId: string, memberId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING") return { error: t.clubs.detail.errors.onlyBeforeStart };

  const target = club.members.find((m) => m.id === memberId);
  if (!target) return { error: t.clubs.detail.errors.clubNotFound };
  if (target.userId === club.adminId) return { error: t.clubs.detail.errors.cannotRemoveAdmin };

  await prisma.clubMember.delete({ where: { id: memberId } });

  return {};
}

export async function assignTurnAction(
  clubId: string,
  memberId: string,
  turn: number | null
): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING" && club.status !== "ACTIVE") {
    return { error: t.clubs.admin.errors.notEditable };
  }

  const target = club.members.find((m) => m.id === memberId);
  if (!target) return { error: t.clubs.detail.errors.clubNotFound };

  if (turn !== null) {
    if (!Number.isInteger(turn) || turn < 1 || turn > club.durationCount) {
      return { error: t.clubs.admin.errors.invalidTurn };
    }
    const conflict = club.members.find((m) => m.id !== memberId && m.payoutTurn === turn);
    if (conflict) {
      return { error: t.clubs.admin.errors.turnConflict };
    }
  }

  await prisma.clubMember.update({ where: { id: memberId }, data: { payoutTurn: turn } });

  return {};
}

export async function swapMemberTurnsAction(
  clubId: string,
  memberIdA: string,
  memberIdB: string
): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: { include: { user: true } } },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING" && club.status !== "ACTIVE") {
    return { error: t.clubs.admin.errors.notEditable };
  }
  if (memberIdA === memberIdB) return { error: t.clubs.admin.errors.invalidTurn };

  const memberA = club.members.find((m) => m.id === memberIdA);
  const memberB = club.members.find((m) => m.id === memberIdB);
  if (!memberA || !memberB) return { error: t.clubs.detail.errors.clubNotFound };

  await prisma.$transaction([
    prisma.clubMember.update({ where: { id: memberA.id }, data: { payoutTurn: memberB.payoutTurn } }),
    prisma.clubMember.update({ where: { id: memberB.id }, data: { payoutTurn: memberA.payoutTurn } }),
  ]);

  await postAuditAnnouncement(
    clubId,
    session.user.id,
    t.clubs.admin.auditTurnsSwappedTitle,
    interpolate(t.clubs.admin.auditTurnsSwappedBody, {
      nameA: memberA.user.fullName,
      turnA: memberA.payoutTurn ?? "—",
      nameB: memberB.user.fullName,
      turnB: memberB.payoutTurn ?? "—",
    })
  );

  return {};
}

export async function updateClubSettingsAction(
  clubId: string,
  _prevState: ClubFormState,
  formData: FormData
): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING" && club.status !== "ACTIVE") {
    return { error: t.clubs.admin.errors.notEditable };
  }

  const paymentDueDay = Number(formData.get("paymentDueDay"));
  const payoutDay = Number(formData.get("payoutDay"));
  const lateFeeAmount = Number(formData.get("lateFeeAmount") || 0);
  const gracePeriodDays = Number(formData.get("gracePeriodDays") || 0);
  const adminZelleInfo = String(formData.get("adminZelleInfo") ?? "").trim() || null;
  const adminCashAppInfo = String(formData.get("adminCashAppInfo") ?? "").trim() || null;
  const adminBankInfo = String(formData.get("adminBankInfo") ?? "").trim() || null;

  const [dayMin, dayMax] = DUE_DAY_BOUNDS[club.durationUnit];
  if (!Number.isInteger(paymentDueDay) || paymentDueDay < dayMin || paymentDueDay > dayMax) {
    return { error: t.clubs.new.errors.invalidDueDay };
  }
  if (!Number.isInteger(payoutDay) || payoutDay < dayMin || payoutDay > dayMax) {
    return { error: t.clubs.new.errors.invalidPayoutDay };
  }
  if (!Number.isFinite(lateFeeAmount) || lateFeeAmount < 0) return { error: t.clubs.new.errors.invalidAmount };
  if (!Number.isInteger(gracePeriodDays) || gracePeriodDays < 0 || gracePeriodDays > 30) {
    return { error: t.clubs.admin.errors.invalidGracePeriod };
  }

  const scheduleChanged = paymentDueDay !== club.paymentDueDay || payoutDay !== club.payoutDay;

  await prisma.savingsClub.update({
    where: { id: clubId },
    data: { paymentDueDay, payoutDay, lateFeeAmount, gracePeriodDays, adminZelleInfo, adminCashAppInfo, adminBankInfo },
  });

  if (scheduleChanged) {
    await postAuditAnnouncement(
      clubId,
      session.user.id,
      t.clubs.admin.auditScheduleChangedTitle,
      interpolate(t.clubs.admin.auditScheduleChangedBody, {
        dueDay: formatScheduleDay(t, club.durationUnit, paymentDueDay),
        payoutDay: formatScheduleDay(t, club.durationUnit, payoutDay),
      })
    );
  }

  return {};
}

export async function randomizeTurnsAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING") return { error: t.clubs.detail.errors.notPending };

  const shuffled = shuffle(club.members);

  await prisma.$transaction(
    shuffled.map((member, index) =>
      prisma.clubMember.update({ where: { id: member.id }, data: { payoutTurn: index + 1 } })
    )
  );

  return {};
}

export async function activateClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING") return { error: t.clubs.detail.errors.notPending };
  if (club.members.some((m) => m.payoutTurn === null)) {
    return { error: t.clubs.detail.errors.turnsNotAssigned };
  }

  await prisma.savingsClub.update({
    where: { id: club.id },
    data: { status: "ACTIVE", startDate: new Date() },
  });

  return {};
}

export interface PaymentReportFormState {
  error?: string;
}

export async function submitPaymentReportAction(
  clubId: string,
  _prevState: PaymentReportFormState,
  formData: FormData
): Promise<PaymentReportFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (!club.members.some((m) => m.userId === session.user.id)) {
    return { error: t.clubs.pay.errors.notMember };
  }

  const amount = Number(formData.get("amount"));
  const paymentDateRaw = String(formData.get("paymentDate") ?? "");
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const referenceNote = String(formData.get("referenceNote") ?? "").trim() || null;
  const receiptUrl = String(formData.get("receiptDataUrl") ?? "").trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) return { error: t.clubs.pay.errors.invalidAmount };
  const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : null;
  if (!paymentDate || Number.isNaN(paymentDate.getTime())) return { error: t.clubs.pay.errors.dateRequired };
  if (!ALLOWED_METHODS.includes(method)) return { error: t.clubs.pay.errors.methodRequired };

  await prisma.paymentReport.create({
    data: {
      clubId,
      userId: session.user.id,
      amount,
      paymentDate,
      method,
      referenceNote,
      receiptUrl,
    },
  });

  return {};
}

export async function reviewPaymentReportAction(
  clubId: string,
  reportId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };

  const report = await prisma.paymentReport.findUnique({ where: { id: reportId } });
  if (!report || report.clubId !== clubId) return { error: t.clubs.detail.errors.clubNotFound };

  await prisma.paymentReport.update({ where: { id: reportId }, data: { status: decision } });

  // Only count toward punctuality the first time a report is approved.
  if (decision === "APPROVED" && report.status === "PENDING") {
    await recordPaymentApproval(report.userId, isPaymentOnTime(club, report));
  }

  return {};
}

export async function completeClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notActive };

  const currentCycle = club.startDate ? getCurrentCycle(club.startDate, club.durationUnit, club.durationCount) : 0;
  if (currentCycle < club.durationCount) {
    return { error: t.clubs.admin.errors.notReadyToComplete };
  }

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "COMPLETED" } });
  await recordClubCompletion(club.members.map((m) => m.userId));

  return {};
}

export interface RatingsFormState {
  error?: string;
}

export async function submitRatingsAction(
  clubId: string,
  _prevState: RatingsFormState,
  formData: FormData
): Promise<RatingsFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId }, include: { members: true } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };

  const memberUserIds = new Set(club.members.map((m) => m.userId));

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^stars_(.+)$/);
    if (!match) continue;
    const targetId = match[1];
    if (!memberUserIds.has(targetId) || targetId === club.adminId) continue;

    const stars = Number(value);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) continue;

    const comment = String(formData.get(`comment_${targetId}`) ?? "").trim() || null;

    await recordRating({ clubId, authorId: session.user.id, targetId, stars, comment });
  }

  return {};
}

export interface AnnouncementFormState {
  error?: string;
}

export async function postAnnouncementAction(
  clubId: string,
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return { error: t.clubs.admin.errors.announcementFieldsRequired };

  await prisma.announcement.create({
    data: { clubId, authorId: session.user.id, title, content },
  });

  return {};
}
