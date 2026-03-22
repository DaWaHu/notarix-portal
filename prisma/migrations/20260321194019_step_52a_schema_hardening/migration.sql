/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `VendorOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'RESCHEDULED';

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'UPLOAD';

-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'STATUS_HISTORY';

-- AlterEnum
ALTER TYPE "DocumentVisibility" ADD VALUE 'SHARED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VendorOrderStatus" ADD VALUE 'REJECTED';
ALTER TYPE "VendorOrderStatus" ADD VALUE 'NO_SHOW';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_vendorOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_vendorOrderId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "createdByUserId" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "checksumSha256" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "IntakeSubmission" ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "primaryContactPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VendorOrder" ADD COLUMN     "borrowerEmail" TEXT,
ADD COLUMN     "borrowerPhone" TEXT,
ADD COLUMN     "estimatedPages" INTEGER,
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "paperSize" TEXT,
ADD COLUMN     "preferredInk" TEXT,
ADD COLUMN     "primaryBorrowerName" TEXT,
ADD COLUMN     "propertyAddress1" TEXT,
ADD COLUMN     "propertyAddress2" TEXT,
ADD COLUMN     "propertyCity" TEXT,
ADD COLUMN     "propertyState" TEXT,
ADD COLUMN     "propertyZip" TEXT,
ADD COLUMN     "secondaryBorrowerName" TEXT,
ADD COLUMN     "signingDate" TIMESTAMP(3),
ADD COLUMN     "signingTimeLabel" TEXT,
ADD COLUMN     "specialInstructions" TEXT,
ALTER COLUMN "signerName" DROP NOT NULL,
ALTER COLUMN "signerAddress1" DROP NOT NULL,
ALTER COLUMN "signerCity" DROP NOT NULL,
ALTER COLUMN "signerState" DROP NOT NULL,
ALTER COLUMN "signerZip" DROP NOT NULL,
ALTER COLUMN "signerPhone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VendorOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendorOrderId" TEXT NOT NULL,
    "fromStatus" "VendorOrderStatus",
    "toStatus" "VendorOrderStatus" NOT NULL,
    "changedByUserId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "VendorOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorOrderStatusHistory_vendorOrderId_idx" ON "VendorOrderStatusHistory"("vendorOrderId");

-- CreateIndex
CREATE INDEX "VendorOrderStatusHistory_changedByUserId_idx" ON "VendorOrderStatusHistory"("changedByUserId");

-- CreateIndex
CREATE INDEX "VendorOrderStatusHistory_createdAt_idx" ON "VendorOrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "VendorOrderStatusHistory_toStatus_idx" ON "VendorOrderStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "Appointment_createdByUserId_idx" ON "Appointment"("createdByUserId");

-- CreateIndex
CREATE INDEX "Document_uploadedByUserId_idx" ON "Document"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "Document_uploadedAt_idx" ON "Document"("uploadedAt");

-- CreateIndex
CREATE INDEX "Document_checksumSha256_idx" ON "Document"("checksumSha256");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOrder_orderNumber_key" ON "VendorOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "VendorOrder_signingDate_idx" ON "VendorOrder"("signingDate");

-- AddForeignKey
ALTER TABLE "VendorOrderStatusHistory" ADD CONSTRAINT "VendorOrderStatusHistory_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrderStatusHistory" ADD CONSTRAINT "VendorOrderStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
