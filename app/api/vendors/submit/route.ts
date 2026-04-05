import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/formatPhone";
import { generateSequentialOrderNumber } from "@/lib/generateOrderNumber";

export const runtime = "nodejs";

const bodySchema = z.object({
  vendorCode: z.string().min(1, "vendorCode is required"),
  primaryBorrowerName: z.string().min(1, "Primary borrower name is required"),
  secondaryBorrowerName: z.string().optional().nullable(),
  borrowerPhone: z.string().optional().nullable(),
  borrowerEmail: z.string().optional().nullable(),
  propertyAddress1: z.string().min(1, "Property address is required"),
  propertyAddress2: z.string().optional().nullable(),
  propertyCity: z.string().min(1, "Property city is required"),
  propertyState: z.string().min(1, "Property state is required"),
  propertyZip: z.string().min(1, "Property ZIP is required"),
  signingDate: z.string().min(1, "Signing date is required"),
  signingTimeLabel: z.string().min(1, "Signing time is required"),
  estimatedPages: z.number().int().nonnegative().optional().nullable(),
  paperSize: z.string().optional().nullable(),
  preferredInk: z.string().optional().nullable(),
  serviceType: z.string().min(1, "Service type is required"),
  feeAmount: z.number().nonnegative().optional().nullable(),
  isRON: z.boolean().optional(),
  specialInstructions: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message || "Invalid request body",
        400
      );
    }

    const data = parsed.data;

    const vendor = await prisma.vendor.findUnique({
      where: { vendorcode: data.vendorCode },
      select: { id: true, vendorcode: true },
    });

    if (!vendor) {
      return jsonError("Vendor not found", 404);
    }

    const orderNumber = await generateSequentialOrderNumber();

    const order = await prisma.vendorOrder.create({
      data: {
        vendorId: vendor.id,
        orderNumber,
        primaryBorrowerName: data.primaryBorrowerName,
        secondaryBorrowerName: data.secondaryBorrowerName ?? undefined,
        borrowerPhone: formatPhone(data.borrowerPhone) ?? undefined,
        borrowerEmail: data.borrowerEmail ?? undefined,
        propertyAddress1: data.propertyAddress1,
        propertyAddress2: data.propertyAddress2 ?? undefined,
        propertyCity: data.propertyCity,
        propertyState: data.propertyState,
        propertyZip: data.propertyZip,
        signingDate: new Date(data.signingDate),
        signingTimeLabel: data.signingTimeLabel,
        estimatedPages: data.estimatedPages ?? undefined,
        paperSize: data.paperSize ?? undefined,
        preferredInk: data.preferredInk ?? undefined,
        serviceType: data.serviceType,
        feeAmount: data.feeAmount ?? undefined,
        isRON: data.isRON ?? false,
        specialInstructions: data.specialInstructions ?? undefined,
        paymentMethod: data.paymentMethod ?? "VendorPay",
        status: "SUBMITTED",
      },
      select: {
        id: true,
        orderNumber: true,
        vendorId: true,
        status: true,
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return jsonError(
      error?.message || "Failed to submit vendor order",
      500
    );
  }
}