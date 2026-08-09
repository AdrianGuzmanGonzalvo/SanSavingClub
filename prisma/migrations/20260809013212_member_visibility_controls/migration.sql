-- AlterTable
ALTER TABLE "SavingsClub" DROP COLUMN "allowMembersToViewOtherPayments",
ADD COLUMN     "allowMembersToViewOtherNames" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowMembersToViewOtherPayoutDates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowMembersToViewOtherTurns" BOOLEAN NOT NULL DEFAULT true;
