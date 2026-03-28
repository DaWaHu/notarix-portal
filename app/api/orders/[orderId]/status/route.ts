import { NextResponse } from "next/server";
import { z } from "zod";
import { VendorOrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  toStatus: z.nativeEnum(VendorOrderStatus),
  reason: z.string().optional().nullable(),
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
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      return jsonError("Order not found", 404);
    }

    const updated = await prisma.vendorOrder.update({
      where: { id: orderId },
      data: {
        status: parsed.data.toStatus,
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: parsed.data.toStatus,
            reason: parsed.data.reason ?? undefined,
          },
        },
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error: any) {
    return jsonError(
      error?.message || "Failed to update order status",
      500
    );
  }
}
