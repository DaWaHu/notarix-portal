import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  channel: z.string().optional().nullable(),
  direction: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1, "Message is required"),
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

    const communication = await prisma.vendorOrderCommunication.create({
      data: {
        vendorOrderId: orderId,
        channel: parsed.data.channel ?? null,
        direction: parsed.data.direction ?? null,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message.trim(),
      },
      select: {
        id: true,
        createdAt: true,
        channel: true,
        direction: true,
        subject: true,
        message: true,
      },
    });

    return NextResponse.json({ ok: true, communication });
  } catch (error: any) {
    return jsonError(
      error?.message || "Failed to save communication",
      500
    );
  }
}