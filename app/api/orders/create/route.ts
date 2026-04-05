import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/formatPhone";
import { generateSequentialOrderNumber } from "@/lib/generateOrderNumber";

export const runtime = "nodejs";

const OrderCreateSchema = z.object({
  vendorCode: z
    .string()
    .min(1, "vendorCode is required")
    .transform((v) => (v || "").toUpperCase().trim()),

  primaryBorrowerName: z.string().min(1, "Primary borrower name is required"),
  secondaryBorrowerName: z.string().optional().nullable(),

  propertyAddress1: z.string().min(1, "Property address is required"),
  propertyAddress2: z.string().optional().nullable(),
  propertyCity: z.string().min(1, "Property city is required"),
  propertyState: z.string().min(1, "Property state is required"),
  propertyZip: z.string().min(1, "Property zip is required"),

  borrowerPhone: z.string().optional().nullable(),
  borrowerEmail: z.string().optional().nullable(),

  signingDate: z.string().optional().nullable(),
  signingTimeLabel: z.string().optional().nullable(),

  estimatedPages: z.number().int().optional().nullable(),
  feeAmount: z.number().nonnegative().optional().nullable(),
  paymentDueStatus: z.string().optional().nullable(),
  paymentDueDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  paymentPaid: z.boolean().optional(),
  paymentPaidDate: z.string().optional().nullable(),
  paymentNotes: z.string().optional().nullable(),

  paperSize: z.string().optional().nullable(),
  preferredInk: z.string().optional().nullable(),

  isRON: z.boolean().optional(),
  serviceType: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
});

function jsonError(message: string, status = 400, extra?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError("Missing JSON body", 400);
    }

    const parsed = OrderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed", 422, parsed.error.flatten());
    }

    const data = parsed.data;

    const vendor = await prisma.vendor.findUnique({
      where: { vendorcode: data.vendorCode },
      select: {
        id: true,
        vendorcode: true,
        companyName: true,
      },
    });

    if (!vendor) {
      return jsonError("Vendor not found for the provided vendor code.", 404);
    }

    const created = await prisma.vendorOrder.create({
      data: {
        vendorId: vendor.id,
        orderNumber: await generateSequentialOrderNumber(),
        status: "DRAFT",

        primaryBorrowerName: data.primaryBorrowerName.trim(),
        secondaryBorrowerName: data.secondaryBorrowerName?.trim() || null,

        propertyAddress1: data.propertyAddress1.trim(),
        propertyAddress2: data.propertyAddress2?.trim() || null,
        propertyCity: data.propertyCity.trim(),
        propertyState: data.propertyState.trim(),
        propertyZip: data.propertyZip.trim(),

        borrowerPhone: formatPhone(data.borrowerPhone),
        borrowerEmail: data.borrowerEmail?.trim().toLowerCase() || null,

        signingDate: parseOptionalDate(data.signingDate),
        signingTimeLabel: data.signingTimeLabel?.trim() || null,

        estimatedPages: data.estimatedPages ?? null,
        feeAmount: data.feeAmount ?? null,
        paymentDueStatus: data.paymentDueStatus?.trim() || null,
        paymentDueDate: parseOptionalDate(data.paymentDueDate),
        paymentMethod: data.paymentMethod?.trim() || null,
        paymentPaid: data.paymentPaid ?? false,
        paymentPaidDate: parseOptionalDate(data.paymentPaidDate),
        paymentNotes: data.paymentNotes?.trim() || null,

        paperSize: data.paperSize?.trim() || null,
        preferredInk: data.preferredInk?.trim() || null,

        isRON: data.isRON ?? false,
        serviceType: data.serviceType?.trim() || null,
        specialInstructions: data.specialInstructions?.trim() || null,

        signerName: data.primaryBorrowerName.trim(),
        signerAddress1: data.propertyAddress1.trim(),
        signerAddress2: data.propertyAddress2?.trim() || null,
        signerCity: data.propertyCity.trim(),
        signerState: data.propertyState.trim(),
        signerZip: data.propertyZip.trim(),
        signerPhone: formatPhone(data.borrowerPhone) || "",
        notes: data.specialInstructions?.trim() || null,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        primaryBorrowerName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        order: created,
        vendor: {
          vendorCode: vendor.vendorcode,
          companyName: vendor.companyName,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("ORDER CREATE ERROR:", err);

    let errorText = "Server error saving order";

    if (err instanceof Error) {
      errorText = err.message;
    } else if (typeof err === "string") {
      errorText = err;
    } else {
      try {
        errorText = JSON.stringify(err);
      } catch {
        errorText = "Unknown server error";
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: errorText,
      },
      { status: 500 }
    );
  }
}