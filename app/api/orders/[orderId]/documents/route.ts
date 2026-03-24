import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { DocumentType, DocumentVisibility } from "@prisma/client";

export const runtime = "nodejs";

const bodySchema = z.object({
  fileName: z.string().min(1, "fileName is required"),
  storageKey: z.string().min(1, "storageKey is required"),
  mimeType: z.string().min(1).optional().nullable(),
  fileSizeBytes: z.number().int().nonnegative().optional().nullable(),
  documentType: z.nativeEnum(DocumentType).optional(),
  visibility: z.nativeEnum(DocumentVisibility).optional(),
  notes: z.string().optional().nullable(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return jsonError("Missing orderId", 400);
    }

    const parsed = bodySchema.safeParse(await req.json());

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message || "Invalid request body",
        400
      );
    }

    const order = await prisma.vendorOrder.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      return jsonError("Order not found", 404);
    }

    const document = await prisma.document.create({
      data: {
        vendorOrderId: orderId,
        fileName: parsed.data.fileName,
        storageKey: parsed.data.storageKey,
        mimeType: parsed.data.mimeType ?? undefined,
        fileSizeBytes: parsed.data.fileSizeBytes ?? undefined,
        documentType: parsed.data.documentType ?? undefined,
        visibility: parsed.data.visibility ?? undefined,
        notes: parsed.data.notes ?? undefined,
      },
      select: {
        id: true,
        vendorOrderId: true,
        fileName: true,
        storageKey: true,
        mimeType: true,
        fileSizeBytes: true,
        documentType: true,
        visibility: true,
      },
    });

    return NextResponse.json({ ok: true, document });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return jsonError("A document with that storage key already exists", 409);
    }

    return jsonError(
      error?.message || "Failed to attach document to order",
      500
    );
  }
}
