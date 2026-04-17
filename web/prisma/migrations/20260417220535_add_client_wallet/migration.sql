-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WalletHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletHistory_clientId_idx" ON "WalletHistory"("clientId");

-- AddForeignKey
ALTER TABLE "WalletHistory" ADD CONSTRAINT "WalletHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
