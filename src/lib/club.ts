import { addDays, addWeeks, differenceInCalendarMonths, differenceInCalendarWeeks, isSameWeek, setDay } from "date-fns";
import type { DurationUnit, PaymentReport, ReportStatus } from "@prisma/client";

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
}

function dateForCycle(startDate: Date, unit: DurationUnit, cycle: number, day: number): Date {
  const offset = cycle - 1;
  return unit === "WEEK" ? dateInOffsetWeek(startDate, offset, day) : dateInOffsetMonth(startDate, offset, day);
}

export function computeCycleDueDate(
  club: Pick<ClubSchedule, "startDate" | "durationUnit" | "paymentDueDay">,
  cycle: number
): Date {
  return dateForCycle(club.startDate, club.durationUnit, cycle, club.paymentDueDay);
}

export function computeCyclePayoutDate(
  club: Pick<ClubSchedule, "startDate" | "durationUnit" | "payoutDay">,
  cycle: number
): Date {
  return dateForCycle(club.startDate, club.durationUnit, cycle, club.payoutDay);
}

export function getCurrentCycle(startDate: Date, durationUnit: DurationUnit, durationCount: number): number {
  const diff =
    durationUnit === "WEEK"
      ? differenceInCalendarWeeks(new Date(), startDate, { weekStartsOn: 0 }) + 1
      : differenceInCalendarMonths(new Date(), startDate) + 1;
  return Math.min(Math.max(diff, 1), durationCount);
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

/** A payment report "belongs" to whichever cycle's due-date period (week or month) contains its reported payment date. */
export function isReportForCycle(
  report: Pick<PaymentReport, "paymentDate">,
  cycleDueDate: Date,
  durationUnit: DurationUnit
): boolean {
  if (durationUnit === "WEEK") {
    return isSameWeek(report.paymentDate, cycleDueDate, { weekStartsOn: 0 });
  }
  return (
    report.paymentDate.getFullYear() === cycleDueDate.getFullYear() &&
    report.paymentDate.getMonth() === cycleDueDate.getMonth()
  );
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
  club: { monthlyAmount: number; lateFeeAmount: number; gracePeriodDays: number },
  paymentDate: Date,
  cycleDueDate: Date
): { amount: number; isLate: boolean } {
  const isLate = paymentDate > addDays(cycleDueDate, club.gracePeriodDays);
  return { amount: club.monthlyAmount + (isLate ? club.lateFeeAmount : 0), isLate };
}
