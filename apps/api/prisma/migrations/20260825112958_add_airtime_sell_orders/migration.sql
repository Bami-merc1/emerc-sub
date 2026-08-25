-- CreateEnum
CREATE TYPE "SellOrderStatus" AS ENUM ('PENDING', 'RECEIVED', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AirtimeSellOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "cashValue" DECIMAL(12,2) NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "receivingNumber" TEXT NOT NULL,
    "status" "SellOrderStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AirtimeSellOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AirtimeSellOrder_referenceCode_key" ON "AirtimeSellOrder"("referenceCode");

-- AddForeignKey
ALTER TABLE "AirtimeSellOrder" ADD CONSTRAINT "AirtimeSellOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
