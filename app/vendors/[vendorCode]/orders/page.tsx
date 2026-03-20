import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Status = "Pending" | "Active" | "Completed" | "Closed";

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; fg: string; border: string }> = {
    Pending: { bg: "#FEF3C7", fg: "#B45309", border: "#FDE68A" },
    Active: { bg: "#DCFCE7", fg: "#166534", border: "#BBF7D0" },
    Completed: { bg: "#E0F2FE", fg: "#075985", border: "#BAE6FD" },
    Closed: { bg: "#F3F4F6", fg: "#374151", border: "#E5E7EB" },
  };

  const c = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: c.fg,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        <span>{title}</span>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  label,
  valueRight,
}: {
  checked?: boolean;
  label: string;
  valueRight?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 10px",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        background: "#F8FAFC",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: `2px solid ${checked ? "#1D4ED8" : "#CBD5E1"}`,
            background: checked ? "#1D4ED8" : "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {checked ? "✓" : ""}
        </span>
        <span style={{ fontWeight: 800, color: "#0F172A" }}>{label}</span>
      </div>
      {valueRight}
    </div>
  );
}

function Timeline({ current }: { current: Status }) {
  const steps: Status[] = ["Pending", "Active", "Completed", "Closed"];
  const idx = steps.indexOf(current);

  return (
    <div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {steps.map((s, i) => {
          const done = i <= idx;
          return (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: done ? "#1D4ED8" : "#CBD5E1",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    color: done ? "#0F172A" : "#94A3B8",
                    fontSize: 13,
                  }}
                >
                  {s}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: done ? "#1D4ED8" : "#E5E7EB",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function nice(value: string | null | undefined) {
  const s = String(value || "").trim();
  return s ? s : "—";
}

export default async function VendorOrdersTemplatePage({
  params,
}: {
  params: { vendorCode: string };
}) {
  const vendorCode = String(params.vendorCode || "").toUpperCase().trim();

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      companyName: true,
      vendorcode: true,
      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      secondaryContactName: true,
      secondaryContactEmail: true,
      secondaryContactPhone: true,
    },
  });

  const headerCompanyName = vendor?.companyName || "CLIENT NAME / TITLE COMPANY";
  const displayVendorCode = vendor?.vendorcode || vendorCode;

  const titleRepName = vendor?.primaryContactName || "John Smith";
  const titleRepEmail = vendor?.primaryContactEmail || "jsmith@titlecompany.com";
  const titleRepPhone = vendor?.primaryContactPhone || "(555) 123-4567";

  const secondRepName = vendor?.secondaryContactName || "Sarah Johnson";
  const secondRepEmail = vendor?.secondaryContactEmail || "sjohnson@notary.com";
  const secondRepPhone = vendor?.secondaryContactPhone || "(555) 987-6643";

  // Keeping mock order detail for now until we wire real VendorOrder records next.
  const expandedStatus: Status = "Active";

  return (
    <main
      style={{
        padding: 28,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        background: "#F1F5F9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "16px 22px",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
          {headerCompanyName}
        </div>
        <div style={{ fontWeight: 800 }}>Powered by Notarix</div>
      </div>

      <div style={{ display: "flex", alignItems: "end", gap: 14 }}>
        <h1 style={{ fontSize: 34, margin: 0, fontWeight: 950 }}>
          Notary Orders
        </h1>
        <span style={{ color: "#64748B", fontWeight: 700 }}>
          Vendor: {displayVendorCode}
        </span>
      </div>

      <div style={{ marginTop: 10, marginBottom: 16, color: "#334155" }}>
        <span style={{ fontWeight: 900 }}>●</span> Pending &nbsp;&nbsp;
        <span style={{ fontWeight: 900 }}>●</span> Active &nbsp;&nbsp;
        <span style={{ fontWeight: 900 }}>●</span> Completed &nbsp;&nbsp;
        <span style={{ fontWeight: 900 }}>●</span> Closed
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        {[
          {
            id: "48219",
            name: "John Smith",
            prop: "114 Lake Dr",
            sub: "Created: 03/02/2026 10:14 AM EST",
            status: "Pending" as Status,
          },
          {
            id: "48218",
            name: "Garcia",
            prop: "72 Pine Ave",
            sub: "Signing Date: March 5, 2026 – 2:30 PM EST",
            status: "Active" as Status,
          },
          {
            id: "48212",
            name: "Daniel Brown",
            prop: "905 Oak Ct",
            sub: "Completed: 02/28/2026 5:18 PM EST",
            status: "Completed" as Status,
          },
        ].map((o) => (
          <div
            key={o.id}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, color: "#0F172A" }}>
                Order #{o.id} | {o.name} | Property: {o.prop}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                {o.sub}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusPill status={o.status} />
              <span style={{ fontSize: 18, color: "#94A3B8" }}>›</span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "14px 18px",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
          marginBottom: 12,
        }}
      >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 800 }}>✓ Status: {expandedStatus}</span>
          <span style={{ opacity: 0.85 }}>▾</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.5fr 1.4fr",
            gap: 12,
          }}
        >
          <Card title="Borrower Information">
            <Field label="Primary Borrower" value="Maria Garcia" />
            <Field
              label="Property Address"
              value="72 Pine Ave, Orlando, FL 32801"
            />
            <Field label="Signing Date" value="March 5, 2026" />
            <Field label="Signing Time" value="2:30 PM EST" />
            <Field label="Phone" value="(555) 987-6543" />
            <Field label="Email" value="mariagarcia@email.com" />
          </Card>

          <Card title="Order Details">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 900, color: "#0F172A" }}>
                Estimated Pages
              </div>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "10px 12px",
                  background: "#fff",
                  fontWeight: 800,
                }}
              >
                140
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <CheckboxRow checked label="Legal" />
              <CheckboxRow label="Letter" />
              <CheckboxRow
                checked
                label="Additional Signer: Robert Garcia"
                valueRight={
                  <span style={{ color: "#64748B", fontWeight: 800 }}>▾</span>
                }
              />
            </div>

            <div
              style={{
                marginTop: 10,
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: 12,
                background: "#F8FAFC",
                color: "#334155",
                fontSize: 13,
                fontWeight: 650,
              }}
            >
              Please ensure all borrowers sign according to the instructions
              before proceeding.
            </div>
          </Card>

          <Card title="Documents">
            {[
              {
                name: "Instructions.pdf",
                who: headerCompanyName,
                time: "03/03/2026 9:22 AM",
              },
              {
                name: "Loan_Package.pdf",
                who: headerCompanyName,
                time: "03/03/2026 9:44 AM",
              },
              {
                name: "Signed_Package.pdf",
                who: "Assigned Notary",
                time: "03/05/2026 4:15 PM",
              },
            ].map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 10px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  marginBottom: 10,
                  background: "#fff",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, color: "#0F172A" }}>
                    {d.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    {d.who} • {d.time}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "#94A3B8" }}>›</span>
              </div>
            ))}

            <button
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              + Add Document
            </button>
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.5fr 1.4fr",
            gap: 12,
          }}
        >
          <Card title="Contacts">
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#E2E8F0",
                    border: "1px solid #CBD5E1",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 900, color: "#0F172A" }}>
                    {nice(titleRepName)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      fontWeight: 800,
                    }}
                  >
                    Primary Contact
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    {nice(titleRepPhone)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    {nice(titleRepEmail)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#E2E8F0",
                    border: "1px solid #CBD5E1",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 900, color: "#0F172A" }}>
                    {nice(secondRepName)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      fontWeight: 800,
                    }}
                  >
                    Secondary Contact
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    {nice(secondRepPhone)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    {nice(secondRepEmail)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Communication Log">
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>
                  {headerCompanyName}{" "}
                  <span style={{ color: "#64748B" }}>• 03/05/2026 10:15 AM</span>
                </div>
                <div style={{ color: "#334155", fontWeight: 650 }}>
                  Please ensure borrower signs all pages in blue ink.
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>
                  Assigned Notary{" "}
                  <span style={{ color: "#64748B" }}>• 03/05/2026 3:38 PM</span>
                </div>
                <div style={{ color: "#334155", fontWeight: 650 }}>
                  Signing completed. Uploading documents now.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <input
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    outline: "none",
                    fontWeight: 700,
                  }}
                />
                <button
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid #1D4ED8",
                    background: "#1D4ED8",
                    color: "white",
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </Card>

          <Card title="Payment Details">
            <Field label="Notary Fee" value="$125.00" />
            <Field label="Estimated Payment Date" value="March 7, 2026" />

            <div style={{ marginTop: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                Payment Method
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                {["VendorPay", "ACH Transfer", "Zelle", "PayPal Business"].map(
                  (m) => (
                    <span
                      key={m}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 999,
                        border: "1px solid #CBD5E1",
                        background: "#F8FAFC",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      {m}
                    </span>
                  )
                )}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <Field label="Payment Status" value="Scheduled" />
              <a
                href="#"
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#1D4ED8",
                }}
              >
                Learn more about payments and timing →
              </a>
            </div>
          </Card>
        </div>

        <Card title="Order Status">
          <Timeline current={expandedStatus} />
        </Card>

        <div style={{ textAlign: "right", color: "#64748B", fontWeight: 800 }}>
          © Notarix.live
        </div>
      </div>
    </main>
  );
}