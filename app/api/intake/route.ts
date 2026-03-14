import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      company,
      contactType,
      requestType,
      coverageArea,
      message,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    const submission = await prisma.intakeSubmission.create({
      data: {
        role: contactType || "GENERAL",
        fullName: name,
        email,
        phone: phone || null,
        message: message || "",
        status: "NEW",
        details: {
          company: company || "",
          contactType: contactType || "",
          requestType: requestType || "",
          coverageArea: coverageArea || "",
          source: "contact-form",
        },
      },
    });

    return NextResponse.json({
      ok: true,
      submissionId: submission.id,
      message: "Your request has been submitted successfully.",
    });
  } catch (error: any) {
    console.error("INTAKE ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}