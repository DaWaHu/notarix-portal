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
DROP COLUMN "status",
ADD COLUMN     "status" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "IntakeSubmission" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "IntakeRole" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "IntakeStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "approvalStatus" "VendorApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profilePageCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "address1" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zip" DROP NOT NULL,
ALTER COLUMN "primaryPhone" DROP NOT NULL,
ALTER COLUMN "primaryContactName" DROP NOT NULL,
ALTER COLUMN "primaryContactEmail" DROP NOT NULL,
ALTER COLUMN "primaryContactPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VendorOrder" ADD COLUMN     "assignedNotaryId" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT,
ALTER COLUMN "serviceType" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "VendorOrderStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "DailyOrderSequence";

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
CREATE INDEX "VendorOrder_signingDate_idx" ON "VendorOrder"("signingDate");

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

