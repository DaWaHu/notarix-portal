import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  paperSize: z.string().optional().nullable(),
  preferredInk: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
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

    const existing = await prisma.vendorOrder.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Order not found", 404);
    }

    const order = await prisma.vendorOrder.update({
      where: { id: orderId },
      data: {
        paperSize: parsed.data.paperSize?.trim() || null,
        preferredInk: parsed.data.preferredInk?.trim() || null,
        specialInstructions: parsed.data.specialInstructions?.trim() || null,
      },
      select: {
        id: true,
        paperSize: true,
        preferredInk: true,
        specialInstructions: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return jsonError(
      error?.message || "Failed to update signing details",
      500
    );
  }
}