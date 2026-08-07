-- AlterTable
ALTER TABLE "SavingsClub" ADD COLUMN     "isPreExisting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startCycleNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ClubCycle" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "paymentDueDate" TIMESTAMP(3) NOT NULL,
    "payoutDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubCycle_clubId_cycleNumber_key" ON "ClubCycle"("clubId", "cycleNumber");

-- AddForeignKey
ALTER TABLE "ClubCycle" ADD CONSTRAINT "ClubCycle_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "SavingsClub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
