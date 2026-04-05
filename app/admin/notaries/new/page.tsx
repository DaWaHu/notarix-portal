import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/formatPhone";
import { generateEntityCode } from "@/lib/generateEntityCode";
import { sendNotaryOnboardingEmail } from "@/lib/ses";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#0F172A",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

async function createNotary(formData: FormData) {
  "use server";

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = formatPhone(String(formData.get("phone") || "").trim());

  const address1 = String(formData.get("address1") || "").trim();
  const address2 = String(formData.get("address2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const zip = String(formData.get("zip") || "").trim();

  const commissionNumber = String(formData.get("commissionNumber") || "").trim();
  const commissionState = String(formData.get("commissionState") || "")
    .trim()
    .toUpperCase();
  const coverageAreas = String(formData.get("coverageAreas") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!/^[A-Z]{2}$/.test(commissionState)) {
    throw new Error("Commission state must be a 2-letter state code.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, notaryProfile: { select: { id: true } } },
  });

  if (existingUser?.notaryProfile) {
    throw new Error("A notary profile already exists for that email.");
  }

  const notaryCode = await generateEntityCode({
    role: "NOTARY",
    state: commissionState,
  });

  const user =
    existingUser ||
    (await prisma.user.create({
      data: {
        email,
        firstName: fullName.split(" ").slice(0, 1).join(" ") || null,
        lastName: fullName.split(" ").slice(1).join(" ") || null,
        phone: phone || null,
        isActive: true,
      },
      select: { id: true },
    }));

  await prisma.notaryProfile.create({
    data: {
      userId: user.id,
      notaryCode,
      fullName,
      email,
      phone: phone || null,
      address1: address1 || null,
      address2: address2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      commissionNumber: commissionNumber || null,
      commissionState,
      coverageAreas: coverageAreas || null,
      notes: notes || null,
      isActive: true,
      isRONApproved: false,
    },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const profileUrl = `${appUrl}/notaries/${notaryCode}`;

  try {
    await sendNotaryOnboardingEmail({
      to: email,
      notaryCode,
      profileUrl,
    });
  } catch (error) {
    console.error("Failed to send notary onboarding email", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/notaries");
  revalidatePath("/notaries");

  redirect("/admin/notaries");
}

export default function AdminCreateNotaryPage() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 40,
                  lineHeight: 1.1,
                  fontWeight: 950,
                  color: "#0F172A",
                }}
              >
                Create Notary
              </h1>
              <div
                style={{
                  marginTop: 8,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Create a notary record with an automatically generated notary code and profile foundation.
              </div>
            </div>

            <a
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                border: "1px solid #CBD5E1",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 800,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              Back to Admin
            </a>
          </div>

          <form action={createNotary} style={{ display: "grid", gap: 28 }}>
            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Identity
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Full Name">
                  <input
                    name="fullName"
                    style={inputStyle}
                    placeholder="Enter full legal name"
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    style={inputStyle}
                    placeholder="name@email.com"
                    required
                  />
                </Field>

                <Field label="Phone">
                  <input
                    name="phone"
                    style={inputStyle}
                    placeholder="123-456-7890"
                  />
                </Field>

                <div
                  style={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    display: "grid",
                    alignContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0F172A",
                      marginBottom: 6,
                    }}
                  >
                    Notary Code
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#475569",
                      lineHeight: 1.45,
                    }}
                  >
                    Generated automatically using the format NYYNNNNST when the record is created.
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Address
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Address Line 1">
                  <input name="address1" style={inputStyle} />
                </Field>

                <Field label="Address Line 2">
                  <input name="address2" style={inputStyle} />
                </Field>

                <Field label="City">
                  <input name="city" style={inputStyle} />
                </Field>

                <Field label="State">
                  <input
                    name="state"
                    style={inputStyle}
                    placeholder="Example: NC"
                    maxLength={2}
                  />
                </Field>

                <Field label="ZIP Code">
                  <input name="zip" style={inputStyle} />
                </Field>
              </div>
            </section>

            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Commission & Coverage
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Commission Number">
                  <input name="commissionNumber" style={inputStyle} />
                </Field>

                <Field label="Commission State">
                  <input
                    name="commissionState"
                    style={inputStyle}
                    placeholder="Example: AZ"
                    maxLength={2}
                    required
                  />
                </Field>

                <Field label="Coverage Areas">
                  <input
                    name="coverageAreas"
                    style={inputStyle}
                    placeholder="Example: Maricopa County, Pima County"
                  />
                </Field>

                <Field label="Notes">
                  <input
                    name="notes"
                    style={inputStyle}
                    placeholder="Optional administrative note"
                  />
                </Field>
              </div>
            </section>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "14px 20px",
                  background: "#1D4ED8",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Create Notary
              </button>

              <a
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: "1px solid #CBD5E1",
                  borderRadius: 10,
                  padding: "14px 20px",
                  fontWeight: 800,
                  color: "#0F172A",
                  background: "#fff",
                }}
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}