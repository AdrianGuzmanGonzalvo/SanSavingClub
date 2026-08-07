-- AlterTable
ALTER TABLE "ClubCycle" ADD COLUMN     "cycleFrequency" "Frequency";

-- AlterTable
ALTER TABLE "SavingsClub" ADD COLUMN     "allowMembersToViewOtherPayments" BOOLEAN NOT NULL DEFAULT true;
