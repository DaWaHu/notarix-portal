import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
  paperSize: z.string().optional().nullable(),
  preferredInk: z.string().optional().nullable(),

  isRON: z.boolean().optional(),
  serviceType: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
});

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json(
    { ok: false, error: message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${y}${m}${d}-${rand}`;
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
        orderNumber: generateOrderNumber(),
        status: "PENDING",

        // New fields
        primaryBorrowerName: data.primaryBorrowerName.trim(),
        secondaryBorrowerName: data.secondaryBorrowerName?.trim() || null,

        propertyAddress1: data.propertyAddress1.trim(),
        propertyAddress2: data.propertyAddress2?.trim() || null,
        propertyCity: data.propertyCity.trim(),
        propertyState: data.propertyState.trim(),
        propertyZip: data.propertyZip.trim(),

        borrowerPhone: data.borrowerPhone?.trim() || null,
        borrowerEmail: data.borrowerEmail?.trim().toLowerCase() || null,

        signingDate: data.signingDate ? new Date(data.signingDate) : null,
        signingTimeLabel: data.signingTimeLabel?.trim() || null,

        estimatedPages: data.estimatedPages ?? null,
        paperSize: data.paperSize?.trim().toUpperCase() || null,
        preferredInk: data.preferredInk?.trim().toUpperCase() || null,

        isRON: data.isRON ?? false,
        serviceType: data.serviceType?.trim() || null,
        specialInstructions: data.specialInstructions?.trim() || null,

        // Old required fields still in the table
        signerName: data.primaryBorrowerName.trim(),
        signerAddress1: data.propertyAddress1.trim(),
        signerAddress2: data.propertyAddress2?.trim() || null,
        signerCity: data.propertyCity.trim(),
        signerState: data.propertyState.trim(),
        signerZip: data.propertyZip.trim(),
        signerPhone: data.borrowerPhone?.trim() || "",
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