import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientReadiness } from "@/lib/client-readiness";

export const runtime = "nodejs";

function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ vendorCode: string }> }
) {
  try {
    const { vendorCode } = await params;
    const normalizedVendorCode = String(vendorCode || "").trim().toUpperCase();

    if (!normalizedVendorCode) {
      return jsonError("Missing vendorCode", 400);
    }

    const vendor = await prisma.vendor.findUnique({
      where: { vendorcode: normalizedVendorCode },
      select: {
        id: true,
        vendorcode: true,
        approvalStatus: true,
        companyName: true,
        companyType: true,
        companyLogoUrl: true,
        website: true,
        address1: true,
        city: true,
        state: true,
        zip: true,
        primaryPhone: true,
        primaryContactName: true,
        primaryContactEmail: true,
        primaryContactPhone: true,
        secondaryContactName: true,
        secondaryContactEmail: true,
        secondaryContactPhone: true,
        documents: {
          select: {
            fileName: true,
            notes: true,
          },
        },
      },
    });

    if (!vendor) {
      return jsonError("Client not found", 404);
    }

    const readiness = getClientReadiness(vendor);

    if (
      readiness.missingProfileFields.length > 0 ||
      readiness.missingRequiredDocs.length > 0
    ) {
      return jsonError("Client is not ready for final approval", 400, {
        missingProfileFields: readiness.missingProfileFields,
        missingRequiredDocs: readiness.missingRequiredDocs,
      });
    }

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
        vendorcode: true,
        approvalStatus: true,
      },
    });

    return NextResponse.json({ ok: true, vendor: updated });
  } catch (error: any) {
    return jsonError(
      error?.message || "Failed to approve client",
      500
    );
  }
}