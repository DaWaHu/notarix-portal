-- CreateEnum
CREATE TYPE "PortalRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'NOTARY', 'VENDOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "IntakeRole" AS ENUM ('VENDOR', 'CLIENT', 'NOTARY', 'GENERAL');

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('NEW', 'REVIEWING', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VendorApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VendorOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ORDER_PACKAGE', 'ID_DOCUMENT', 'SIGNED_PACKAGE', 'INVOICE', 'RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('INTERNAL', 'VENDOR', 'CLIENT', 'NOTARY');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'VENDOR', 'CLIENT', 'NOTARY', 'INTAKE_SUBMISSION', 'ACCESS_REQUEST', 'VENDOR_ORDER', 'APPOINTMENT', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGN', 'UNASSIGN', 'LOGIN', 'EXPORT', 'VIEW');

-- AlterTable
ALTER TABLE "AccessRequest" ADD COLUMN     "intakeSubmissionId" TEXT,
ADD COLUMN     "status_new" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "AccessRequest"
SET "status_new" = CASE
  WHEN "status" = 'pending' THEN 'PENDING'::"AccessRequestStatus"
  WHEN "status" = 'PENDING' THEN 'PENDING'::"AccessRequestStatus"
  WHEN "status" = 'approved' THEN 'APPROVED'::"AccessRequestStatus"
  WHEN "status" = 'APPROVED' THEN 'APPROVED'::"AccessRequestStatus"
  WHEN "status" = 'rejected' THEN 'REJECTED'::"AccessRequestStatus"
  WHEN "status" = 'REJECTED' THEN 'REJECTED'::"AccessRequestStatus"
  WHEN "status" = 'closed' THEN 'CLOSED'::"AccessRequestStatus"
  WHEN "status" = 'CLOSED' THEN 'CLOSED'::"AccessRequestStatus"
  ELSE 'PENDING'::"AccessRequestStatus"
END;

ALTER TABLE "AccessRequest" DROP COLUMN "status";
ALTER TABLE "AccessRequest" RENAME COLUMN "status_new" TO "status";

-- AlterTable
ALTER TABLE "IntakeSubmission" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role_new" "IntakeRole" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "status_new" "IntakeStatus" NOT NULL DEFAULT 'NEW';

UPDATE "IntakeSubmission"
SET
  "role_new" = CASE
    WHEN "role" = 'VENDOR' THEN 'VENDOR'::"IntakeRole"
    WHEN "role" = 'CLIENT' THEN 'CLIENT'::"IntakeRole"
    WHEN "role" = 'NOTARY' THEN 'NOTARY'::"IntakeRole"
    WHEN "role" = 'GENERAL' THEN 'GENERAL'::"IntakeRole"
    ELSE 'GENERAL'::"IntakeRole"
  END,
  "status_new" = CASE
    WHEN "status" = 'NEW' THEN 'NEW'::"IntakeStatus"
    WHEN "status" = 'REVIEWING' THEN 'REVIEWING'::"IntakeStatus"
    WHEN "status" = 'APPROVED' THEN 'APPROVED'::"IntakeStatus"
    WHEN "status" = 'REJECTED' THEN 'REJECTED'::"IntakeStatus"
    WHEN "status" = 'CLOSED' THEN 'CLOSED'::"IntakeStatus"
    ELSE 'NEW'::"IntakeStatus"
  END;

ALTER TABLE "IntakeSubmission" DROP COLUMN "role";
ALTER TABLE "IntakeSubmission" RENAME COLUMN "role_new" TO "role";

ALTER TABLE "IntakeSubmission" DROP COLUMN "status";
ALTER TABLE "IntakeSubmission" RENAME COLUMN "status_new" TO "status";

ALTER TABLE "IntakeSubmission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "approvalStatus" "VendorApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profilePageCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "address1" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zip" DROP NOT NULL,
ALTER COLUMN "primaryPhone" DROP NOT NULL,
ALTER COLUMN "primaryContactName" DROP NOT NULL,
ALTER COLUMN "primaryContactEmail" DROP NOT NULL;

ALTER TABLE "Vendor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- AlterTable
ALTER TABLE "VendorOrder"
ADD COLUMN     "assignedNotaryId" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status_new" "VendorOrderStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "serviceType" DROP NOT NULL;

UPDATE "VendorOrder"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

ALTER TABLE "VendorOrder"
ALTER COLUMN "updatedAt" DROP DEFAULT;

UPDATE "VendorOrder"
SET "status_new" = CASE
  WHEN "status" = 'DRAFT' THEN 'DRAFT'::"VendorOrderStatus"
  WHEN "status" = 'SUBMITTED' THEN 'SUBMITTED'::"VendorOrderStatus"
  WHEN "status" = 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::"VendorOrderStatus"
  WHEN "status" = 'ASSIGNED' THEN 'ASSIGNED'::"VendorOrderStatus"
  WHEN "status" = 'SCHEDULED' THEN 'SCHEDULED'::"VendorOrderStatus"
  WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"VendorOrderStatus"
  WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"VendorOrderStatus"
  ELSE 'DRAFT'::"VendorOrderStatus"
END;

ALTER TABLE "VendorOrder" DROP COLUMN "status";
ALTER TABLE "VendorOrder" RENAME COLUMN "status_new" TO "status";

-- DropTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DailyOrderSequence'
  ) THEN
    DROP TABLE "DailyOrderSequence";
  END IF;
END $$;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "role" "PortalRole" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "intakeSubmissionId" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaryProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "commissionNumber" TEXT,
    "commissionState" TEXT,
    "commissionExpiresAt" TIMESTAMP(3),
    "isRONApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "coverageAreas" TEXT,
    "notes" TEXT,

    CONSTRAINT "NotaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorOrderId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "locationName" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorOrderId" TEXT,
    "vendorId" TEXT,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'INTERNAL',
    "uploadedByUserId" TEXT,
    "notes" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "vendorOrderId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE INDEX "VendorUser_userId_idx" ON "VendorUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorUser_vendorId_userId_key" ON "VendorUser"("vendorId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_intakeSubmissionId_key" ON "Client"("intakeSubmissionId");

-- CreateIndex
CREATE INDEX "Client_fullName_idx" ON "Client"("fullName");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "ClientUser_userId_idx" ON "ClientUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_clientId_userId_key" ON "ClientUser"("clientId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotaryProfile_userId_key" ON "NotaryProfile"("userId");

-- CreateIndex
CREATE INDEX "NotaryProfile_isActive_idx" ON "NotaryProfile"("isActive");

-- CreateIndex
CREATE INDEX "NotaryProfile_commissionState_idx" ON "NotaryProfile"("commissionState");

-- CreateIndex
CREATE INDEX "Appointment_vendorOrderId_idx" ON "Appointment"("vendorOrderId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_scheduledStart_idx" ON "Appointment"("scheduledStart");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_vendorOrderId_idx" ON "Document"("vendorOrderId");

-- CreateIndex
CREATE INDEX "Document_vendorId_idx" ON "Document"("vendorId");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");

-- CreateIndex
CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_vendorOrderId_idx" ON "AuditLog"("vendorOrderId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AccessRequest_email_idx" ON "AccessRequest"("email");

-- CreateIndex
CREATE INDEX "AccessRequest_status_idx" ON "AccessRequest"("status");

-- CreateIndex
CREATE INDEX "AccessRequest_createdAt_idx" ON "AccessRequest"("createdAt");

-- CreateIndex
CREATE INDEX "IntakeSubmission_status_idx" ON "IntakeSubmission"("status");

-- CreateIndex
CREATE INDEX "IntakeSubmission_email_idx" ON "IntakeSubmission"("email");

-- CreateIndex
CREATE INDEX "IntakeSubmission_createdAt_idx" ON "IntakeSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "Vendor_companyName_idx" ON "Vendor"("companyName");

-- CreateIndex
CREATE INDEX "Vendor_approvalStatus_idx" ON "Vendor"("approvalStatus");

-- CreateIndex
CREATE INDEX "Vendor_isActive_idx" ON "Vendor"("isActive");

-- CreateIndex
CREATE INDEX "VendorOrder_vendorId_idx" ON "VendorOrder"("vendorId");

-- CreateIndex
CREATE INDEX "VendorOrder_clientId_idx" ON "VendorOrder"("clientId");

-- CreateIndex
CREATE INDEX "VendorOrder_assignedNotaryId_idx" ON "VendorOrder"("assignedNotaryId");

-- CreateIndex
CREATE INDEX "VendorOrder_status_idx" ON "VendorOrder"("status");

-- CreateIndex
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'VendorOrder'
      AND column_name = 'signingDate'
  ) THEN
    EXECUTE 'CREATE INDEX "VendorOrder_signingDate_idx" ON "VendorOrder"("signingDate")';
  END IF;
END $$;

-- CreateIndex
CREATE INDEX "VendorOrder_createdAt_idx" ON "VendorOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaryProfile" ADD CONSTRAINT "NotaryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_assignedNotaryId_fkey" FOREIGN KEY ("assignedNotaryId") REFERENCES "NotaryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrder" ADD CONSTRAINT "VendorOrder_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "VendorOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "IntakeSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

