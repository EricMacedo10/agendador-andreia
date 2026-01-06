-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('FULL_DAY', 'PARTIAL');

-- CreateTable
CREATE TABLE "DayBlock" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT,
    "blockType" "BlockType" NOT NULL DEFAULT 'FULL_DAY',
    "startTime" TEXT,
    "endTime" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DayBlock_startDate_endDate_idx" ON "DayBlock"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "DayBlock" ADD CONSTRAINT "DayBlock_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
