"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode, getAllCycleDates, getCurrentCycleFromRows, getNextPendingCycleForMember, subtractCycles } from "@/lib/club";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatDate } from "@/lib/format";
import { formatScheduleDay, interpolate } from "@/lib/i18n/format";
import { isPaymentOnTime, recordClubCompletion, recordPaymentApproval, recordRating, reversePaymentApproval } from "@/lib/reputation";
import { createNotification } from "@/lib/notifications";
import type { DurationUnit, Frequency, PaymentMethod } from "@prisma/client";

export interface ClubFormState {
  error?: string;
}

const ALLOWED_METHODS: PaymentMethod[] = ["ZELLE", "CASH_APP", "BANK_TRANSFER", "CASH", "OTHER"];
const ALLOWED_UNITS: DurationUnit[] = ["WEEK", "MONTH"];
const WEEK_FREQUENCIES: Frequency[] = ["WEEKLY", "BI_WEEKLY", "EVERY_OTHER_WEEK"];
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

/**
 * Auto-completes a club once its last cycle has been paid out and no payment
 * reports are still awaiting review — called after whichever of those two
 * things happens last. Mirrors completeClubAction's status change and
 * reputation update, just without the manual ratings step.
 */
async function maybeAutoCompleteClub(clubId: string): Promise<void> {
  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true, cycles: true, paymentReports: { select: { status: true } } },
  });
  if (!club || club.status !== "ACTIVE") return;

  const lastCycle = club.cycles.find((c) => c.cycleNumber === club.durationCount);
  if (!lastCycle?.isCompleted) return;
  if (club.paymentReports.some((r) => r.status === "PENDING")) return;

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "COMPLETED" } });
  await recordClubCompletion(club.members.map((m) => m.userId));

  const t = getDictionary(await getLocale());
  await postAuditAnnouncement(
    clubId,
    club.adminId,
    t.clubs.admin.auditAutoCompletedTitle,
    t.clubs.admin.auditAutoCompletedBody
  );
}

export async function createClubAction(_prevState: ClubFormState, formData: FormData): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const name = String(formData.get("name") ?? "").trim();
  const quotaAmount = Number(formData.get("quotaAmount"));
  const durationUnit = String(formData.get("durationUnit") ?? "") as DurationUnit;
  const durationCount = Number(formData.get("durationCount"));
  const lateFeeAmount = Number(formData.get("lateFeeAmount") || 0);
  const mode = String(formData.get("mode") ?? "new");
  const isPreExisting = mode === "existing";
  const adminParticipates = String(formData.get("adminParticipates") ?? "true") !== "false";

  if (!name) return { error: t.clubs.new.errors.nameRequired };
  if (!Number.isFinite(quotaAmount) || quotaAmount <= 0) return { error: t.clubs.new.errors.invalidAmount };
  if (!ALLOWED_UNITS.includes(durationUnit)) return { error: t.clubs.new.errors.invalidDuration };
  const [countMin, countMax] = DURATION_COUNT_BOUNDS[durationUnit];
  if (!Number.isInteger(durationCount) || durationCount < countMin || durationCount > countMax) {
    return { error: t.clubs.new.errors.invalidDuration };
  }
  if (!Number.isFinite(lateFeeAmount) || lateFeeAmount < 0) return { error: t.clubs.new.errors.invalidAmount };

  const frequency: Frequency =
    durationUnit === "WEEK"
      ? (() => {
          const raw = String(formData.get("frequency") ?? "WEEKLY") as Frequency;
          return WEEK_FREQUENCIES.includes(raw) ? raw : "WEEKLY";
        })()
      : "MONTHLY";

  let paymentDueDay: number;
  let payoutDay: number;
  let startDate: Date | null = null;
  let startCycleNumber = 1;
  let currentCycleDueDate: Date | null = null;
  let currentCyclePayoutDate: Date | null = null;

  if (isPreExisting) {
    startCycleNumber = Number(formData.get("startCycleNumber"));
    if (!Number.isInteger(startCycleNumber) || startCycleNumber < 1 || startCycleNumber > durationCount) {
      return { error: t.clubs.new.errors.invalidStartCycle };
    }
    const dueDateRaw = String(formData.get("currentCycleDueDate") ?? "");
    const payoutDateRaw = String(formData.get("currentCyclePayoutDate") ?? "");
    currentCycleDueDate = dueDateRaw ? new Date(dueDateRaw) : null;
    currentCyclePayoutDate = payoutDateRaw ? new Date(payoutDateRaw) : null;
    if (
      !currentCycleDueDate ||
      Number.isNaN(currentCycleDueDate.getTime()) ||
      !currentCyclePayoutDate ||
      Number.isNaN(currentCyclePayoutDate.getTime())
    ) {
      return { error: t.clubs.new.errors.datesRequired };
    }
    paymentDueDay = durationUnit === "WEEK" ? currentCycleDueDate.getDay() : currentCycleDueDate.getDate();
    payoutDay = durationUnit === "WEEK" ? currentCyclePayoutDate.getDay() : currentCyclePayoutDate.getDate();
    startDate = subtractCycles(currentCycleDueDate, startCycleNumber - 1, durationUnit, frequency);
  } else {
    paymentDueDay = Number(formData.get("paymentDueDay"));
    payoutDay = Number(formData.get("payoutDay"));
    const [dayMin, dayMax] = DUE_DAY_BOUNDS[durationUnit];
    if (!Number.isInteger(paymentDueDay) || paymentDueDay < dayMin || paymentDueDay > dayMax) {
      return { error: t.clubs.new.errors.invalidDueDay };
    }
    if (!Number.isInteger(payoutDay) || payoutDay < dayMin || payoutDay > dayMax) {
      return { error: t.clubs.new.errors.invalidPayoutDay };
    }
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
      quotaAmount,
      durationUnit,
      durationCount,
      frequency,
      paymentDueDay,
      payoutDay,
      lateFeeAmount,
      isPreExisting,
      startCycleNumber,
      startDate: startDate ?? undefined,
      inviteCode,
      adminId: session.user.id,
      ...(adminParticipates
        ? { members: { create: { userId: session.user.id, payoutTurn: null } } }
        : {}),
    },
  });

  // Pre-existing clubs already know their schedule, so generate cycle rows
  // immediately instead of waiting for activation (which still requires
  // turns to be assigned first).
  if (isPreExisting && startDate && currentCycleDueDate && currentCyclePayoutDate) {
    const rows = getAllCycleDates({ startDate, durationUnit, durationCount, paymentDueDay, payoutDay, frequency });
    await prisma.clubCycle.createMany({
      data: rows.map(({ cycle, dueDate, payoutDate }) => ({
        clubId: club.id,
        cycleNumber: cycle,
        // The formula anchor can drift slightly (e.g. clamped month-end days) — the
        // leader-entered date for their current cycle always wins over the formula.
        paymentDueDate: cycle === startCycleNumber ? currentCycleDueDate : dueDate,
        payoutDate: cycle === startCycleNumber ? currentCyclePayoutDate : payoutDate,
        isCompleted: cycle < startCycleNumber,
      })),
    });
  }

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

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true, cycles: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING" && club.status !== "ACTIVE") {
    return { error: t.clubs.admin.errors.notEditable };
  }

  const name = String(formData.get("name") ?? "").trim();
  const quotaAmount = Number(formData.get("quotaAmount"));
  const durationCount = Number(formData.get("durationCount"));
  const paymentDueDay = Number(formData.get("paymentDueDay"));
  const payoutDay = Number(formData.get("payoutDay"));
  const lateFeeAmount = Number(formData.get("lateFeeAmount") || 0);
  const gracePeriodDays = Number(formData.get("gracePeriodDays") || 0);
  const adminZelleInfo = String(formData.get("adminZelleInfo") ?? "").trim() || null;
  const adminCashAppInfo = String(formData.get("adminCashAppInfo") ?? "").trim() || null;
  const adminBankInfo = String(formData.get("adminBankInfo") ?? "").trim() || null;
  const allowMembersToViewOtherPayments = String(formData.get("allowMembersToViewOtherPayments")) === "true";

  if (!name) return { error: t.clubs.new.errors.nameRequired };
  if (!Number.isFinite(quotaAmount) || quotaAmount <= 0) return { error: t.clubs.new.errors.invalidAmount };
  const [countMin, countMax] = DURATION_COUNT_BOUNDS[club.durationUnit];
  if (!Number.isInteger(durationCount) || durationCount < countMin || durationCount > countMax) {
    return { error: t.clubs.new.errors.invalidDuration };
  }
  const highestAssignedTurn = Math.max(0, ...club.members.map((m) => m.payoutTurn ?? 0));
  const highestCycleNumber = Math.max(0, ...club.cycles.map((c) => c.cycleNumber));
  if (durationCount < highestAssignedTurn || durationCount < highestCycleNumber) {
    return { error: t.clubs.admin.errors.durationCountTooLow };
  }
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
    data: {
      name,
      quotaAmount,
      durationCount,
      paymentDueDay,
      payoutDay,
      lateFeeAmount,
      gracePeriodDays,
      adminZelleInfo,
      adminCashAppInfo,
      adminBankInfo,
      allowMembersToViewOtherPayments,
    },
  });

  // Cycles are only pre-generated once the club has a start date (activation, or
  // a pre-existing club created directly as ACTIVE) — extend the schedule with
  // the newly added cycles instead of touching any cycle that already exists.
  if (durationCount > club.durationCount && club.startDate && club.cycles.length > 0) {
    const allDates = getAllCycleDates({
      startDate: club.startDate,
      durationUnit: club.durationUnit,
      durationCount,
      paymentDueDay,
      payoutDay,
      frequency: club.frequency,
    });
    const newRows = allDates.filter((d) => d.cycle > club.durationCount);
    if (newRows.length > 0) {
      await prisma.clubCycle.createMany({
        data: newRows.map((d) => ({
          clubId,
          cycleNumber: d.cycle,
          paymentDueDate: d.dueDate,
          payoutDate: d.payoutDate,
        })),
      });
    }
  }

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

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/clubs/${clubId}/admin`);

  return {};
}

export async function updateCycleDatesAction(
  clubId: string,
  cycleNumber: number,
  newDueDateISO: string,
  newPayoutDateISO: string
): Promise<ClubFormState> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING" && club.status !== "ACTIVE") {
    return { error: t.clubs.admin.errors.notEditable };
  }

  const cycle = await prisma.clubCycle.findUnique({ where: { clubId_cycleNumber: { clubId, cycleNumber } } });
  if (!cycle) return { error: t.clubs.detail.errors.clubNotFound };

  const newDueDate = new Date(newDueDateISO);
  const newPayoutDate = new Date(newPayoutDateISO);
  if (Number.isNaN(newDueDate.getTime()) || Number.isNaN(newPayoutDate.getTime())) {
    return { error: t.clubs.new.errors.datesRequired };
  }

  await prisma.clubCycle.update({
    where: { clubId_cycleNumber: { clubId, cycleNumber } },
    data: { paymentDueDate: newDueDate, payoutDate: newPayoutDate },
  });

  await postAuditAnnouncement(
    clubId,
    session.user.id,
    t.clubs.admin.auditCycleDateChangedTitle,
    interpolate(t.clubs.admin.auditCycleDateChangedBody, {
      cycle: cycleNumber,
      dueDate: formatDate(newDueDate, locale),
      payoutDate: formatDate(newPayoutDate, locale),
    })
  );

  return {};
}

export interface CycleScheduleUpdate {
  cycleNumber: number;
  paymentDueDateISO: string;
  payoutDateISO: string;
  cycleFrequency: Frequency | null;
  payoutAmount: number;
}

/** Bulk save for the full cycle schedule editor — updates every cycle's dates in one transaction. */
export async function updateCycleScheduleAction(
  clubId: string,
  updates: CycleScheduleUpdate[]
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

  const parsed = updates.map((u) => ({
    cycleNumber: u.cycleNumber,
    paymentDueDate: new Date(u.paymentDueDateISO),
    payoutDate: new Date(u.payoutDateISO),
    cycleFrequency: u.cycleFrequency,
    payoutAmount: u.payoutAmount,
  }));
  if (parsed.some((u) => Number.isNaN(u.paymentDueDate.getTime()) || Number.isNaN(u.payoutDate.getTime()))) {
    return { error: t.clubs.new.errors.datesRequired };
  }
  if (parsed.some((u) => !Number.isFinite(u.payoutAmount) || u.payoutAmount < 0)) {
    return { error: t.clubs.new.errors.invalidAmount };
  }

  await prisma.$transaction(
    parsed.map((u) =>
      prisma.clubCycle.update({
        where: { clubId_cycleNumber: { clubId, cycleNumber: u.cycleNumber } },
        data: {
          paymentDueDate: u.paymentDueDate,
          payoutDate: u.payoutDate,
          cycleFrequency: u.cycleFrequency,
          payoutAmount: u.payoutAmount,
        },
      })
    )
  );

  await postAuditAnnouncement(
    clubId,
    session.user.id,
    t.clubs.admin.auditScheduleBulkChangedTitle,
    t.clubs.admin.auditScheduleBulkChangedBody
  );

  return {};
}

/**
 * Marks the current cycle's payout as delivered: closes that cycle and flags
 * its recipient as paid. Closing the cycle is what advances "current" to the
 * next one (getCurrentCycleFromRows skips completed cycles), which is also
 * what makes the collected-this-cycle total read $0 again — it's recomputed
 * from payment reports matching the new current cycle's due date, and none
 * exist yet.
 */
export async function markPayoutCompletedAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: { include: { user: true } }, cycles: { orderBy: { cycleNumber: "asc" } } },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notEditable };

  const currentCycle = club.cycles.length > 0 ? getCurrentCycleFromRows(club.cycles) : null;
  const currentCycleRow = currentCycle ? club.cycles.find((c) => c.cycleNumber === currentCycle) : null;
  if (!currentCycleRow) return { error: t.clubs.admin.errors.noCycleToPayOut };
  if (currentCycleRow.isCompleted) return { error: t.clubs.admin.errors.payoutAlreadyDone };

  const payoutMember = club.members.find((m) => m.payoutTurn === currentCycle);
  if (!payoutMember) return { error: t.clubs.admin.errors.payoutNoRecipient };

  await prisma.$transaction([
    prisma.clubCycle.update({ where: { id: currentCycleRow.id }, data: { isCompleted: true } }),
    prisma.clubMember.update({ where: { id: payoutMember.id }, data: { payoutPaid: true } }),
  ]);

  await postAuditAnnouncement(
    clubId,
    session.user.id,
    t.clubs.admin.auditPayoutMarkedTitle,
    interpolate(t.clubs.admin.auditPayoutMarkedBody, { turn: currentCycle!, name: payoutMember.user.fullName })
  );

  await maybeAutoCompleteClub(clubId);

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/clubs/${clubId}/admin`);

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
    include: { members: true, cycles: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PENDING") return { error: t.clubs.detail.errors.notPending };
  if (club.members.some((m) => m.payoutTurn === null)) {
    return { error: t.clubs.detail.errors.turnsNotAssigned };
  }

  // Pre-existing clubs already generated their cycle rows at creation time
  // (dates chosen by the leader); brand-new clubs anchor cycle 1 to today.
  if (club.cycles.length === 0) {
    const startDate = new Date();
    const rows = getAllCycleDates({
      startDate,
      durationUnit: club.durationUnit,
      durationCount: club.durationCount,
      paymentDueDay: club.paymentDueDay,
      payoutDay: club.payoutDay,
      frequency: club.frequency,
    });
    await prisma.$transaction([
      prisma.savingsClub.update({ where: { id: club.id }, data: { status: "ACTIVE", startDate } }),
      prisma.clubCycle.createMany({
        data: rows.map(({ cycle, dueDate, payoutDate }) => ({
          clubId: club.id,
          cycleNumber: cycle,
          paymentDueDate: dueDate,
          payoutDate,
        })),
      }),
    ]);
  } else {
    await prisma.savingsClub.update({ where: { id: club.id }, data: { status: "ACTIVE" } });

    // Pre-existing/imported clubs already have cycles marked completed for the
    // rounds that happened before the group joined the app — backfill approved
    // payment records for every current member so their history shows as paid
    // instead of blank.
    if (club.isPreExisting) {
      const completedCycles = club.cycles.filter((c) => c.isCompleted);
      if (completedCycles.length > 0) {
        await prisma.paymentReport.createMany({
          data: completedCycles.flatMap((cycle) =>
            club.members.map((member) => ({
              clubId: club.id,
              userId: member.userId,
              amount: club.quotaAmount,
              paymentDate: cycle.paymentDueDate,
              method: "OTHER" as PaymentMethod,
              cycleNumber: cycle.cycleNumber,
              referenceNote: t.clubs.detail.backfilledNote,
              status: "APPROVED" as const,
              approvedAt: new Date(),
              approvedById: session.user.id,
              notes: t.clubs.detail.backfilledNote,
            }))
          ),
        });
      }
    }
  }

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
    include: { members: true, cycles: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (!club.members.some((m) => m.userId === session.user.id)) {
    return { error: t.clubs.pay.errors.notMember };
  }
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notActive };

  const amount = Number(formData.get("amount"));
  const paymentDateRaw = String(formData.get("paymentDate") ?? "");
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const referenceNote = String(formData.get("referenceNote") ?? "").trim() || null;
  const receiptUrl = String(formData.get("receiptDataUrl") ?? "").trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) return { error: t.clubs.pay.errors.invalidAmount };
  const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : null;
  if (!paymentDate || Number.isNaN(paymentDate.getTime())) return { error: t.clubs.pay.errors.dateRequired };
  if (!ALLOWED_METHODS.includes(method)) return { error: t.clubs.pay.errors.methodRequired };

  const memberReports = await prisma.paymentReport.findMany({
    where: { clubId, userId: session.user.id },
    select: { cycleNumber: true, status: true },
  });
  const cycleNumber = getNextPendingCycleForMember(club.cycles, memberReports);

  await prisma.paymentReport.create({
    data: {
      clubId,
      userId: session.user.id,
      amount,
      paymentDate,
      method,
      cycleNumber,
      referenceNote,
      receiptUrl,
    },
  });

  await createNotification({
    userId: club.adminId,
    clubId,
    type: "PAYMENT_REPORTED",
    title: t.notifications.paymentReportedTitle,
    body: interpolate(t.notifications.paymentReportedBody, { name: session.user.name ?? "", club: club.name }),
    link: `/clubs/${clubId}/admin`,
  });

  return {};
}

export async function reviewPaymentReportAction(
  clubId: string,
  reportId: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId }, include: { cycles: true } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };

  const report = await prisma.paymentReport.findUnique({ where: { id: reportId } });
  if (!report || report.clubId !== clubId) return { error: t.clubs.detail.errors.clubNotFound };

  await prisma.paymentReport.update({
    where: { id: reportId },
    data: {
      status: decision,
      notes: notes?.trim() || null,
      approvedAt: decision === "APPROVED" ? new Date() : null,
      approvedById: decision === "APPROVED" ? session.user.id : null,
    },
  });

  // Only count toward punctuality the first time a report is approved.
  if (decision === "APPROVED" && report.status === "PENDING") {
    await recordPaymentApproval(report.userId, isPaymentOnTime(club.cycles, report.cycleNumber, report.paymentDate));
  }

  await maybeAutoCompleteClub(clubId);

  return {};
}

/**
 * Deletes a payment report entirely — e.g. to correct a duplicate or
 * fraudulent entry. If it had been approved, reverses the punctuality stats
 * that approval counted toward the payer's reputation. Every other view
 * (collected-this-cycle, member status, dashboard totals) reads live from
 * PaymentReport rows, so removing this one is enough to update them all.
 */
export async function deletePaymentReportAction(clubId: string, reportId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId }, include: { cycles: true } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };

  const report = await prisma.paymentReport.findUnique({ where: { id: reportId } });
  if (!report || report.clubId !== clubId) return { error: t.clubs.detail.errors.clubNotFound };

  if (report.status === "APPROVED") {
    const onTime = isPaymentOnTime(club.cycles, report.cycleNumber, report.paymentDate);
    await reversePaymentApproval(report.userId, onTime);
  }

  await prisma.paymentReport.delete({ where: { id: reportId } });

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/clubs/${clubId}/admin`);

  return {};
}

/** Admin-recorded payment (e.g. cash handed over in person) — created already approved. */
export async function recordManualPaymentAction(
  clubId: string,
  memberUserId: string,
  _prevState: PaymentReportFormState,
  formData: FormData
): Promise<PaymentReportFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId }, include: { members: true, cycles: true } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notActive };
  if (!club.members.some((m) => m.userId === memberUserId)) return { error: t.clubs.detail.errors.clubNotFound };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "CASH") as PaymentMethod;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) return { error: t.clubs.pay.errors.invalidAmount };
  if (!ALLOWED_METHODS.includes(method)) return { error: t.clubs.pay.errors.methodRequired };

  const memberReports = await prisma.paymentReport.findMany({
    where: { clubId, userId: memberUserId },
    select: { cycleNumber: true, status: true },
  });
  const cycleNumber = getNextPendingCycleForMember(club.cycles, memberReports);

  const paymentDate = new Date();
  await prisma.paymentReport.create({
    data: {
      clubId,
      userId: memberUserId,
      amount,
      paymentDate,
      method,
      cycleNumber,
      status: "APPROVED",
      approvedAt: paymentDate,
      approvedById: session.user.id,
      notes,
    },
  });

  await recordPaymentApproval(memberUserId, isPaymentOnTime(club.cycles, cycleNumber, paymentDate));

  return {};
}

export async function completeClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({
    where: { id: clubId },
    include: { members: true, cycles: true },
  });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notActive };

  const currentCycle = club.cycles.length > 0 ? getCurrentCycleFromRows(club.cycles) : 0;
  if (currentCycle < club.durationCount) {
    return { error: t.clubs.admin.errors.notReadyToComplete };
  }

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "COMPLETED" } });
  await recordClubCompletion(club.members.map((m) => m.userId));

  return {};
}

/**
 * Soft-deletes a club: marks it CANCELLED so it disappears from every
 * member's dashboard, without touching payment history, ratings, or any
 * other record — a real delete would destroy real financial history.
 */
export async function cancelClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status === "CANCELLED") return { error: t.clubs.admin.errors.notActive };

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "CANCELLED" } });
  await postAuditAnnouncement(clubId, session.user.id, t.clubs.admin.auditDeactivatedTitle, t.clubs.admin.auditDeactivatedBody);

  return {};
}

export async function pauseClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "ACTIVE") return { error: t.clubs.admin.errors.notActive };

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "PAUSED" } });
  await postAuditAnnouncement(clubId, session.user.id, t.clubs.admin.auditPausedTitle, t.clubs.admin.auditPausedBody);

  return {};
}

export async function resumeClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "PAUSED") return { error: t.clubs.admin.errors.notPaused };

  await prisma.savingsClub.update({ where: { id: clubId }, data: { status: "ACTIVE" } });
  await postAuditAnnouncement(clubId, session.user.id, t.clubs.admin.auditResumedTitle, t.clubs.admin.auditResumedBody);

  return {};
}

/**
 * "Start New Round": bumps roundNumber, wipes the old cycle schedule and turn
 * assignments, and drops the club back to PENDING so the admin re-assigns
 * turns and re-activates through the normal flow. Members stay joined, and
 * every past PaymentReport is left untouched as permanent round history.
 */
export async function reactivateClubAction(clubId: string): Promise<ClubFormState> {
  const t = getDictionary(await getLocale());
  const session = await auth();
  if (!session?.user) return { error: t.auth.mustBeSignedIn };

  const club = await prisma.savingsClub.findUnique({ where: { id: clubId } });
  if (!club) return { error: t.clubs.detail.errors.clubNotFound };
  if (club.adminId !== session.user.id) return { error: t.clubs.detail.errors.adminOnly };
  if (club.status !== "COMPLETED" && club.status !== "PAUSED") {
    return { error: t.clubs.admin.errors.notReadyToReactivate };
  }

  await prisma.$transaction([
    prisma.clubCycle.deleteMany({ where: { clubId } }),
    prisma.clubMember.updateMany({ where: { clubId }, data: { payoutTurn: null, payoutPaid: false } }),
    prisma.savingsClub.update({
      where: { id: clubId },
      data: { status: "PENDING", roundNumber: { increment: 1 }, startDate: null },
    }),
  ]);

  await postAuditAnnouncement(
    clubId,
    session.user.id,
    t.clubs.admin.auditNewRoundTitle,
    interpolate(t.clubs.admin.auditNewRoundBody, { round: club.roundNumber + 1 })
  );

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
