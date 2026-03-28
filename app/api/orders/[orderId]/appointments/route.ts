// app/api/orders/[orderId]/appointments/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  scheduledStart: z.string().min(1, "Scheduled start is required"),
  scheduledEnd: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return jsonError("Missing orderId", 400);
    }

    const existing = await prisma.vendorOrder.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Order not found", 404);
    }

    const appointments = await prisma.appointment.findMany({
      where: { vendorOrderId: orderId },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        locationName: true,
        address1: true,
        address2: true,
        city: true,
        state: true,
        zip: true,
        contactName: true,
        contactPhone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, appointments });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to load appointments", 500);
  }
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

    const appointment = await prisma.appointment.create({
      data: {
        vendorOrderId: orderId,
        status: parsed.data.status ?? AppointmentStatus.PENDING,
        scheduledStart: new Date(parsed.data.scheduledStart),
        scheduledEnd: parsed.data.scheduledEnd
          ? new Date(parsed.data.scheduledEnd)
          : null,
        locationName: parsed.data.locationName ?? null,
        address1: parsed.data.address1 ?? null,
        address2: parsed.data.address2 ?? null,
        city: parsed.data.city ?? null,
        state: parsed.data.state ?? null,
        zip: parsed.data.zip ?? null,
        contactName: parsed.data.contactName ?? null,
        contactPhone: parsed.data.contactPhone ?? null,
        notes: parsed.data.notes ?? null,
      },
      select: {
        id: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        locationName: true,
        address1: true,
        address2: true,
        city: true,
        state: true,
        zip: true,
        contactName: true,
        contactPhone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, appointment });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to create appointment", 500);
  }
}