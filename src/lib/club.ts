import { addDays, addWeeks, setDay, subMonths, subWeeks } from "date-fns";
import type { DurationUnit, Frequency, PaymentReport, ReportStatus } from "@prisma/client";

/** Number of weeks between cycles for a WEEK-based schedule at the given payment frequency. */
export function weeksPerCycle(frequency: Frequency): number {
  return frequency === "WEEKLY" ? 1 : 2;
}

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** Resolves day-of-month `day` within the month that is `monthOffset` months after `anchor`, clamped to that month's length. */
function dateInOffsetMonth(anchor: Date, monthOffset: number, day: number): Date {
  const base = new Date(anchor.getFullYear(), anchor.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  return new Date(base.getFullYear(), base.getMonth(), Math.min(day, daysInMonth));
}

/** Resolves day-of-week `dayOfWeek` (0=Sun..6=Sat) within the week that is `weekOffset` weeks after `anchor`. */
function dateInOffsetWeek(anchor: Date, weekOffset: number, dayOfWeek: number): Date {
  return setDay(addWeeks(anchor, weekOffset), dayOfWeek, { weekStartsOn: 0 });
}

export interface ClubSchedule {
  startDate: Date;
  durationUnit: DurationUnit;
  durationCount: number;
  paymentDueDay: number;
  payoutDay: number;
  frequency: Frequency;
}

function dateForCycle(startDate: Date, unit: DurationUnit, frequency: Frequency, cycle: number, day: number): Date {
  const offset = cycle - 1;
  return unit === "WEEK"
    ? dateInOffsetWeek(startDate, offset * weeksPerCycle(frequency), day)
    : dateInOffsetMonth(startDate, offset, day);
}

export function computeCycleDueDate(
  club: Pick<ClubSchedule, "startDate" | "durationUnit" | "paymentDueDay" | "frequency">,
  cycle: number
): Date {
  return dateForCycle(club.startDate, club.durationUnit, club.frequency, cycle, club.paymentDueDay);
}

export function computeCyclePayoutDate(
  club: Pick<ClubSchedule, "startDate" | "durationUnit" | "payoutDay" | "frequency">,
  cycle: number
): Date {
  return dateForCycle(club.startDate, club.durationUnit, club.frequency, cycle, club.payoutDay);
}

/**
 * Resolves the "current" cycle from explicit ClubCycle rows instead of a date
 * formula: it's the highest-numbered non-completed cycle whose due date has
 * already arrived, or the earliest non-completed cycle if none has yet.
 */
export function getCurrentCycleFromRows(
  cycles: { cycleNumber: number; paymentDueDate: Date; isCompleted: boolean }[]
): number {
  const active = [...cycles].filter((c) => !c.isCompleted).sort((a, b) => a.cycleNumber - b.cycleNumber);
  if (active.length === 0) {
    return cycles.length > 0 ? Math.max(...cycles.map((c) => c.cycleNumber)) : 1;
  }
  const now = new Date();
  let current = active[0].cycleNumber;
  for (const c of active) {
    if (c.paymentDueDate <= now) current = c.cycleNumber;
    else break;
  }
  return current;
}

/** Back-dates `date` by `cyclesBack` cycles — used to derive a synthetic cycle-1 anchor from a leader-entered current-cycle date. */
export function subtractCycles(date: Date, cyclesBack: number, durationUnit: DurationUnit, frequency: Frequency): Date {
  return durationUnit === "WEEK" ? subWeeks(date, cyclesBack * weeksPerCycle(frequency)) : subMonths(date, cyclesBack);
}

export interface CycleDates {
  cycle: number;
  dueDate: Date;
  payoutDate: Date;
}

export function getAllCycleDates(club: ClubSchedule): CycleDates[] {
  return Array.from({ length: club.durationCount }, (_, i) => {
    const cycle = i + 1;
    return {
      cycle,
      dueDate: computeCycleDueDate(club, cycle),
      payoutDate: computeCyclePayoutDate(club, cycle),
    };
  });
}

/**
 * The cycle a new payment should be applied to: the member's earliest cycle
 * that doesn't already have a non-rejected report. This is what makes a
 * catch-up payment land on the oldest unpaid cycle instead of "this month's"
 * cycle by date — a member behind by two cycles who finally pays gets it
 * applied to the first one they missed, not the current one.
 */
export function getNextPendingCycleForMember(
  cycles: { cycleNumber: number }[],
  memberReports: { cycleNumber: number | null; status: ReportStatus }[]
): number {
  const claimedCycles = new Set(
    memberReports.filter((r) => r.status !== "REJECTED" && r.cycleNumber !== null).map((r) => r.cycleNumber)
  );
  const sorted = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
  const nextPending = sorted.find((c) => !claimedCycles.has(c.cycleNumber));
  return nextPending?.cycleNumber ?? sorted[sorted.length - 1]?.cycleNumber ?? 1;
}

export type MemberDisplayStatus = "PAID" | "REPORTED" | "OVERDUE" | "UPCOMING";

export function computeMemberStatusForCycle(
  reportsForCycle: Pick<PaymentReport, "status">[],
  cycleDueDate: Date,
  gracePeriodDays = 0
): MemberDisplayStatus {
  const statuses = reportsForCycle.map((r) => r.status as ReportStatus);
  if (statuses.includes("APPROVED")) return "PAID";
  if (statuses.includes("PENDING")) return "REPORTED";
  return addDays(cycleDueDate, gracePeriodDays) < new Date() ? "OVERDUE" : "UPCOMING";
}

export function sumApprovedAmount(reports: Pick<PaymentReport, "status" | "amount">[]): number {
  return reports
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + Number(r.amount), 0);
}

export function computeAmountDue(
  club: { quotaAmount: number; lateFeeAmount: number; gracePeriodDays: number },
  paymentDate: Date,
  cycleDueDate: Date
): { amount: number; isLate: boolean } {
  const isLate = paymentDate > addDays(cycleDueDate, club.gracePeriodDays);
  return { amount: club.quotaAmount + (isLate ? club.lateFeeAmount : 0), isLate };
}
