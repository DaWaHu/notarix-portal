export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * This schema matches what your FORM sends from /admin/vendors/new
 */
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

    /**
     * IMPORTANT: These field names MUST match your Prisma schema exactly.
     * From your prisma/schema.prisma Vendor model:
     * - vendorcode
     * - companyLogoUrl
     * - primaryPhone, secondaryPhone
     * - primaryContactName, primaryContactEmail, primaryContactPhone
     * - secondaryContactName, secondaryContactEmail, secondaryContactPhone
     */
    const created = await prisma.vendor.create({
      data: {
        vendorcode: data.vendorCode,

        companyName: data.companyName.trim(),
        companyLogoUrl: data.logoUrl,

        address1: data.address1 || "",
        address2: data.address2,
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",

        primaryPhone: data.primaryPhone || "",
        secondaryPhone: data.secondaryPhone,

        primaryContactName: data.primaryName.trim(),
        primaryContactEmail: data.primaryEmail.trim().toLowerCase(),
        primaryContactPhone: data.primaryPhone || "",

        secondaryContactName: data.secondaryName,
        secondaryContactEmail: data.secondaryEmail ? data.secondaryEmail.trim().toLowerCase() : null,
        secondaryContactPhone: data.secondaryPhone,

        // notes is not in Vendor model currently, so we do not store it here yet.
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
    // Print the REAL error in your terminal:
    console.error("VENDOR CREATE ERROR:", err);

    // If this is a Prisma error, it often has code/meta:
    const prismaCode = err?.code;
    const prismaMeta = err?.meta;

    // Show more detail in development only:
    const isDev = process.env.NODE_ENV !== "production";

    // Duplicate vendor code unique constraint often shows as P2002
    if (prismaCode === "P2002") {
      return jsonError("That vendor code already exists. Please use a different vendor code.", 409, isDev ? prismaMeta : undefined);
    }

    return jsonError(
      "Server error saving vendor",
      500,
      isDev
        ? {
            message: err?.message,
            code: prismaCode,
            meta: prismaMeta,
          }
        : undefined
    );
  }
}
