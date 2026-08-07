import { prisma } from "@/lib/prisma";
import { isReportForCycle } from "@/lib/club";
import type { DurationUnit, Frequency, PaymentReport, TrustTier } from "@prisma/client";

export function computeTrustTier(completedClubsCount: number, punctualityScore: number): TrustTier {
  if (completedClubsCount >= 6 && punctualityScore >= 90) return "GOLD";
  if (completedClubsCount >= 3) return "SILVER";
  return "BRONZE";
}

/** Whether a payment report was made on or before the due date of the cycle it belongs to. */
export function isPaymentOnTime(
  durationUnit: DurationUnit,
  frequency: Frequency,
  cycles: { paymentDueDate: Date }[],
  report: Pick<PaymentReport, "paymentDate">
): boolean {
  const matchingCycle = cycles.find((c) => isReportForCycle(report, c.paymentDueDate, durationUnit, frequency));
  if (!matchingCycle) return true;
  return report.paymentDate <= matchingCycle.paymentDueDate;
}

/** Updates a member's punctuality stats after one of their payments is approved. */
export async function recordPaymentApproval(userId: string, onTime: boolean): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      totalPaymentsCount: { increment: 1 },
      onTimePaymentsCount: onTime ? { increment: 1 } : undefined,
    },
  });

  const punctualityScore = user.totalPaymentsCount > 0 ? (user.onTimePaymentsCount / user.totalPaymentsCount) * 100 : 100;

  await prisma.user.update({
    where: { id: userId },
    data: { punctualityScore, trustTier: computeTrustTier(user.completedClubsCount, punctualityScore) },
  });
}

/** Increments completedClubsCount and recalculates trust tier for every member of a club that just completed. */
export async function recordClubCompletion(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { completedClubsCount: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { trustTier: computeTrustTier(user.completedClubsCount, user.punctualityScore) },
    });
  }
}

/** Records (or updates) an admin's 1-5 star rating of a member for a club, and recalculates the member's average. */
export async function recordRating(params: {
  clubId: string;
  authorId: string;
  targetId: string;
  stars: number;
  comment: string | null;
}): Promise<void> {
  const { clubId, authorId, targetId, stars, comment } = params;

  await prisma.rating.upsert({
    where: { clubId_authorId_targetId: { clubId, authorId, targetId } },
    update: { stars, comment },
    create: { clubId, authorId, targetId, stars, comment },
  });

  const ratings = await prisma.rating.findMany({ where: { targetId }, select: { stars: true } });
  const averageRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

  await prisma.user.update({ where: { id: targetId }, data: { averageRating } });
}
