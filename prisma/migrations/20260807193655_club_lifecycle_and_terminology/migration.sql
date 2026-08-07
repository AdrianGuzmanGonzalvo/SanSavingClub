-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'BI_WEEKLY', 'EVERY_OTHER_WEEK', 'MONTHLY');

-- AlterEnum
ALTER TYPE "ClubStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "PaymentReport" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable: preserve existing quota amounts by renaming instead of drop+add
ALTER TABLE "SavingsClub" RENAME COLUMN "monthlyAmount" TO "quotaAmount";
ALTER TABLE "SavingsClub" ADD COLUMN     "frequency" "Frequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "roundNumber" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "PaymentReport" ADD CONSTRAINT "PaymentReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
