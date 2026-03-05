export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const VendorCreateSchema = z.object({
  vendorCode: z
    .string()
    .min(3, "vendorCode is required")
    .max(64, "vendorCode is too long")
    .transform((v) => (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim())
    .refine((v) => /^[A-Z0-9]+$/.test(v), "vendorCode must be letters/numbers only"),

  companyName: z.string().min(1, "companyName is required").max(200),

  logoUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() ? v.trim() : null))
    .refine((v) => v === null || /^https?:\/\/.+/i.test(v), "logoUrl must be a valid URL"),

  address1: z.string().optional().or(z.literal("")).transform((v) => v || ""),
  address2: z.string().optional().or(z.literal("")).transform((v) => (v ? v : null)),
  city: z.string().optional().or(z.literal("")).transform((v) => v || ""),
  state: z.string().optional().or(z.literal("")).transform((v) => v || ""),
  zip: z.string().optional().or(z.literal("")).transform((v) => v || ""),

  primaryName: z.string().min(1, "primaryName is required").max(200),
  primaryEmail: z.string().email("primaryEmail must be a valid email").max(200),
  primaryPhone: z.string().optional().or(z.literal("")).transform((v) => v || ""),

  secondaryName: z.string().optional().or(z.literal("")).transform((v) => (v ? v : null)),
  secondaryEmail: z.string().optional().or(z.literal("")).transform((v) => (v ? v : null)),
  secondaryPhone: z.string().optional().or(z.literal("")).transform((v) => (v ? v : null)),

  notes: z.string().optional().or(z.literal("")).transform((v) => (v ? v : null)),
});

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json(
    { ok: false, error: message, ...(extra ? { extra } : {}) },
    { status }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Missing JSON body", 400);

    const parsed = VendorCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 422, parsed.error.flatten());
    }

    const data = parsed.data;

    // IMPORTANT: These names match YOUR prisma/schema.prisma Vendor model.
    const created = await prisma.vendor.create({
      data: {
        // prisma field is vendorcode (lowercase)
        vendorcode: data.vendorCode,

        companyName: data.companyName.trim(),
        // prisma field is companyLogoUrl
        companyLogoUrl: data.logoUrl,

        // address fields in your schema are required (address1, city, state, zip)
        // so we ensure they are at least empty strings
        address1: data.address1 || "",
        address2: data.address2,
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",

        // vendor phones (your schema has these)
        primaryPhone: data.primaryPhone || "",
        secondaryPhone: data.secondaryPhone,

        // contact fields (your schema has these exact names)
        primaryContactName: data.primaryName.trim(),
        primaryContactEmail: data.primaryEmail.trim().toLowerCase(),
        primaryContactPhone: data.primaryPhone || "",

        secondaryContactName: data.secondaryName,
        secondaryContactEmail: data.secondaryEmail ? data.secondaryEmail.trim().toLowerCase() : null,
        secondaryContactPhone: data.secondaryPhone,

        // notes is NOT a column in Vendor right now, so we don't store it yet.
      },
      select: {
        id: true,
        vendorcode: true,
        companyName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { ok: true, vendorCode: created.vendorcode, vendor: created },
      { status: 200 }
    );
  } catch (err: any) {
    // Show the real error in terminal (very helpful)
    console.error("VENDOR CREATE ERROR:", err);

    // Prisma unique error (vendorcode unique)
    if (err?.code === "P2002") {
      return jsonError("That vendor code already exists. Please use a different vendor code.", 409);
    }

    return jsonError("Server error saving vendor", 500, {
      message: err?.message,
      code: err?.code,
    });
  }
}
