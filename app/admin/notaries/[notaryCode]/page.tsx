import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NotaryPhotoUpload from "./NotaryPhotoUpload";

type PageProps = {
  params: Promise<{ notaryCode: string }>;
};

export const dynamic = "force-dynamic";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not provided";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Not provided";
  return d.toLocaleDateString();
}

function formatAddress(parts: Array<string | null | undefined>) {
  const cleaned = parts
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned.join(", ") : "Not provided";
}

export default async function NotaryProfilePage({ params }: PageProps) {
  const { notaryCode } = await params;
  const normalizedNotaryCode = String(notaryCode || "").trim().toUpperCase();

  if (!normalizedNotaryCode) {
    notFound();
  }

  const notary = await prisma.notaryProfile.findUnique({
    where: { notaryCode: normalizedNotaryCode },
    select: {
      id: true,
      notaryCode: true,
      fullName: true,
      email: true,
      phone: true,
      photoUrl: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      zip: true,
      commissionNumber: true,
      commissionState: true,
      commissionExpiresAt: true,
      isRONApproved: true,
      isActive: true,
      coverageAreas: true,
      travelRadiusMiles: true,
      specialties: true,
      eoCoverageAmount: true,
      backgroundCheckDate: true,
      paymentMethod: true,
      paymentNotes: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!notary) {
    notFound();
  }

  const fullAddress = formatAddress([
    notary.address1,
    notary.address2,
    notary.city,
    notary.state,
    notary.zip,
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        padding: 28,
        color: "#0F172A",
        fontFamily:
          'Inter, "Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: "32px 28px",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 22,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #DBEAFE",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Notary portal
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 42,
                  lineHeight: 1.04,
                  fontWeight: 950,
                  letterSpacing: -0.9,
                  color: "#0F172A",
                }}
              >
                {nice(notary.fullName)}
              </h1>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <MetaPill label="Notary Code" value={nice(notary.notaryCode)} />
                <MetaPill
                  label="Commission State"
                  value={nice(notary.commissionState)}
                />
                <MetaPill
                  label="RON"
                  value={notary.isRONApproved ? "Approved" : "Not Approved"}
                />
                <MetaPill
                  label="Status"
                  value={notary.isActive ? "Active" : "Inactive"}
                />
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "#475569",
                  fontWeight: 600,
                  maxWidth: 820,
                }}
              >
                This notary profile is now connected to the live database record.
                The next build phase will add photo upload, document workspace,
                assigned orders, communication actions, and payout visibility.
              </div>
            </div>

            <div
              style={{
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 10,
                }}
              >
                Profile snapshot
              </div>

              <div
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  borderRadius: 14,
                  minHeight: 180,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  marginBottom: 14,
                  padding: 14,
                }}
              >
                {notary.photoUrl ? (
                  <img
                    src={notary.photoUrl}
                    alt={`${nice(notary.fullName)} photo`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                      display: "block",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 14,
                      color: "#64748B",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    No notary photo uploaded yet
                  </div>
                )}
              </div>

              <NotaryPhotoUpload notaryCode={nice(notary.notaryCode)} />

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Email:</strong> {nice(notary.email)}
                </div>
                <div>
                  <strong>Phone:</strong> {nice(notary.phone)}
                </div>
                <div>
                  <strong>Coverage:</strong> {nice(notary.coverageAreas)}
                </div>
                <div>
                  <strong>Updated:</strong> {formatDate(notary.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <Panel title="Contact & Address">
            <InfoRow label="Email" value={nice(notary.email)} />
            <InfoRow label="Phone" value={nice(notary.phone)} />
            <InfoRow label="Address" value={fullAddress} />
            <InfoRow label="State" value={nice(notary.state)} />
          </Panel>

          <Panel title="Commission & Credentials">
            <InfoRow
              label="Commission Number"
              value={nice(notary.commissionNumber)}
            />
            <InfoRow
              label="Commission State"
              value={nice(notary.commissionState)}
            />
            <InfoRow
              label="Commission Expiration"
              value={formatDate(notary.commissionExpiresAt)}
            />
            <InfoRow
              label="RON Approved"
              value={notary.isRONApproved ? "Yes" : "No"}
            />
          </Panel>

          <Panel title="Coverage & Professional Profile">
            <InfoRow label="Coverage Areas" value={nice(notary.coverageAreas)} />
            <InfoRow
              label="Travel Radius"
              value={
                notary.travelRadiusMiles != null
                  ? `${notary.travelRadiusMiles} miles`
                  : "Not provided"
              }
            />
            <InfoRow label="Specialties" value={nice(notary.specialties)} />
            <InfoRow
              label="E&O Coverage"
              value={nice(notary.eoCoverageAmount)}
            />
          </Panel>

          <Panel title="Administrative Details">
            <InfoRow
              label="Background Check Date"
              value={formatDate(notary.backgroundCheckDate)}
            />
            <InfoRow label="Payment Method" value={nice(notary.paymentMethod)} />
            <InfoRow label="Payment Notes" value={nice(notary.paymentNotes)} />
            <InfoRow label="Notes" value={nice(notary.notes)} />
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 22,
          lineHeight: 1.1,
          fontWeight: 900,
          color: "#0F172A",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        background: "#F8FAFC",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748B",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#0F172A",
          lineHeight: 1.45,
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        borderRadius: 999,
        padding: "8px 12px",
        fontSize: 13,
        color: "#475569",
      }}
    >
      <span style={{ fontWeight: 700, color: "#64748B" }}>{label}:</span>
      <span style={{ color: "#0F172A" }}>{value}</span>
    </div>
  );
}