import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const runtime = "nodejs";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

type IntakeRole = "CLIENT" | "NOTARY" | "GENERAL";

function normalizeRole(contactType: unknown): IntakeRole {
  const raw = String(contactType || "").trim().toLowerCase();

  if (!raw) {
    return "GENERAL";
  }

  const clientTypes = new Set([
    "client",
    "title company",
    "signing service",
    "attorney / law firm",
    "attorney",
    "law firm",
    "lender / mortgage company",
    "lender",
    "mortgage company",
    "real estate professional",
    "vendor / service provider",
    "vendor",
    "service provider",
  ]);

  const notaryTypes = new Set([
    "notary",
    "notary signing agent",
  ]);

  const generalTypes = new Set([
    "general",
    "general inquiry",
    "technology / integration partner",
    "technology partner",
    "integration partner",
    "other",
  ]);

  if (clientTypes.has(raw)) {
    return "CLIENT";
  }

  if (notaryTypes.has(raw)) {
    return "NOTARY";
  }

  if (generalTypes.has(raw)) {
    return "GENERAL";
  }

  return "GENERAL";
}

function normalizeDisplayContactType(contactType: unknown): string {
  const role = normalizeRole(contactType);

  if (role === "CLIENT") return "Client";
  if (role === "NOTARY") return "Notary";
  return "General";
}

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
    } = body ?? {};

    if (!name || !email || !contactType || !requestType) {
      return NextResponse.json(
        {
          ok: false,
          error: "Name, email, contact type, and request type are required.",
        },
        { status: 400 }
      );
    }

    const normalizedRole = normalizeRole(contactType);
    const normalizedContactType = normalizeDisplayContactType(contactType);

    const submission = await prisma.intakeSubmission.create({
      data: {
        role: normalizedRole,
        fullName: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        message: message ? String(message).trim() : "",
        status: "NEW",
        details: {
          company: company ? String(company).trim() : "",
          contactType: normalizedContactType,
          originalContactType: contactType ? String(contactType).trim() : "",
          requestType: requestType ? String(requestType).trim() : "",
          coverageArea: coverageArea ? String(coverageArea).trim() : "",
          source: "contact-form",
        },
      },
    });

    const createdAt = new Date(submission.createdAt).toLocaleString();

    const subject = `New Notarix™ intake request: ${requestType}`;

    const textBody = `
A new Notarix™ intake request has been submitted.

Submission ID: ${submission.id}
Created: ${createdAt}

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Company: ${company || "N/A"}
Contact Type: ${normalizedContactType}
Original Contact Type: ${contactType || "N/A"}
Stored Role: ${normalizedRole}
Request Type: ${requestType || "N/A"}
Coverage Area: ${coverageArea || "N/A"}

Message:
${message || "No message provided."}
`.trim();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">New Notarix™ intake request</h2>
        <p style="margin-top: 0; color: #475569;">
          A new inquiry was submitted through the Notarix™ contact form.
        </p>

        <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
          <tbody>
            <tr><td style="padding: 8px; font-weight: 700;">Submission ID</td><td style="padding: 8px;">${submission.id}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Created</td><td style="padding: 8px;">${createdAt}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Name</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Email</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Phone</td><td style="padding: 8px;">${phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Company</td><td style="padding: 8px;">${company || "N/A"}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Contact Type</td><td style="padding: 8px;">${normalizedContactType}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Original Contact Type</td><td style="padding: 8px;">${contactType || "N/A"}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Stored Role</td><td style="padding: 8px;">${normalizedRole}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Request Type</td><td style="padding: 8px;">${requestType || "N/A"}</td></tr>
            <tr><td style="padding: 8px; font-weight: 700;">Coverage Area</td><td style="padding: 8px;">${coverageArea || "N/A"}</td></tr>
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <div style="font-weight: 700; margin-bottom: 6px;">Message</div>
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            ${message ? String(message).replace(/\n/g, "<br />") : "No message provided."}
          </div>
        </div>
      </div>
    `;

    try {
      await ses.send(
        new SendEmailCommand({
          Source: process.env.AWS_SES_FROM_EMAIL || "support@notarix.live",
          Destination: {
            ToAddresses: [
              process.env.AWS_SES_TO_EMAIL || "support@notarix.live",
            ],
          },
          Message: {
            Subject: {
              Data: subject,
              Charset: "UTF-8",
            },
            Body: {
              Text: {
                Data: textBody,
                Charset: "UTF-8",
              },
              Html: {
                Data: htmlBody,
                Charset: "UTF-8",
              },
            },
          },
        })
      );
    } catch (emailError) {
      console.error("SES EMAIL ERROR:", emailError);
    }

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