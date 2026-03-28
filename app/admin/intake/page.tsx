import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { IntakeStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ status?: string }>;
};

const STATUS_OPTIONS = ["ALL", "NEW", "REVIEW", "APPROVED", "ARCHIVED"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

function normalizeStatus(value?: string): StatusOption {
  const upper = String(value || "ALL").toUpperCase();
  return STATUS_OPTIONS.includes(upper as StatusOption)
    ? (upper as StatusOption)
    : "ALL";
}

function normalizeDbStatus(status: string) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "REVIEWING") return "REVIEW";
  if (normalized === "CLOSED") return "ARCHIVED";
  return normalized;
}

function mapUiStatusToDb(status: string): IntakeStatus {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "REVIEW") return "REVIEWING";
  if (normalized === "ARCHIVED") return "CLOSED";
  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "NEW") return "NEW";

  return "NEW";
}

function getStatusLabel(status: string) {
  const normalized = normalizeDbStatus(status);

  switch (normalized) {
    case "NEW":
      return "New";
    case "REVIEW":
      return "In Review";
    case "APPROVED":
      return "Approved";
    case "ARCHIVED":
      return "Archived";
    case "REJECTED":
      return "Rejected";
    default:
      return normalized || "Unknown";
  }
}

function statusMatchesFilter(itemStatus: string, selectedStatus: StatusOption) {
  const normalized = normalizeDbStatus(itemStatus);
  if (selectedStatus === "ALL") return true;
  return normalized === selectedStatus;
}

function formatPhone(phone?: string | null) {
  if (!phone) return "—";
  const cleaned = String(phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString();
}

function getDetailsObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function countForStatus(items: Array<{ status: string }>, status: StatusOption) {
  if (status === "ALL") return items.length;
  return items.filter((item) => normalizeDbStatus(item.status) === status).length;
}

function getStatusPillStyle(status: string): React.CSSProperties {
  switch (normalizeDbStatus(status)) {
    case "NEW":
      return {
        border: "1px solid #BFDBFE",
        background: "#EFF6FF",
        color: "#1D4ED8",
      };
    case "REVIEW":
      return {
        border: "1px solid #FCD34D",
        background: "#FFFBEB",
        color: "#B45309",
      };
    case "APPROVED":
      return {
        border: "1px solid #A7F3D0",
        background: "#ECFDF5",
        color: "#047857",
      };
    case "ARCHIVED":
      return {
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        color: "#475569",
      };
    case "REJECTED":
      return {
        border: "1px solid #FDA4AF",
        background: "#FFF1F2",
        color: "#BE123C",
      };
    default:
      return {
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        color: "#475569",
      };
  }
}

function getRolePillStyle(role: string): React.CSSProperties {
  switch (String(role || "").toUpperCase()) {
    case "CLIENT":
      return {
        border: "1px solid #BFDBFE",
        background: "#EFF6FF",
        color: "#1D4ED8",
      };
    case "NOTARY":
      return {
        border: "1px solid #C7D2FE",
        background: "#EEF2FF",
        color: "#4338CA",
      };
    case "GENERAL":
      return {
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        color: "#475569",
      };
    default:
      return {
        border: "1px solid #CBD5E1",
        background: "#F8FAFC",
        color: "#475569",
      };
  }
}

async function updateIntakeStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const nextStatus = String(formData.get("status") || "").toUpperCase();

  if (!id) return;
  if (!["REVIEW", "APPROVED", "ARCHIVED"].includes(nextStatus)) return;

  await prisma.intakeSubmission.update({
    where: { id },
    data: {
      status: mapUiStatusToDb(nextStatus),
    },
  });

  revalidatePath("/admin/intake");
}

function FilterChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        borderRadius: 999,
        padding: "10px 14px",
        fontSize: 14,
        fontWeight: 800,
        border: active ? "1px solid #1D4ED8" : "1px solid #CBD5E1",
        background: active ? "#1D4ED8" : "#FFFFFF",
        color: active ? "#FFFFFF" : "#334155",
        boxShadow: active ? "0 8px 18px rgba(29, 78, 216, 0.18)" : "none",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          borderRadius: 999,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 900,
          background: active ? "rgba(255,255,255,0.18)" : "#F1F5F9",
          color: active ? "#FFFFFF" : "#475569",
        }}
      >
        {count}
      </span>
    </Link>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "16px 16px",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#DBEAFE",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 32,
          fontWeight: 950,
          lineHeight: 1,
          color: "#FFFFFF",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function QueueMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "blue" | "amber" | "slate";
}) {
  const style =
    tone === "blue"
      ? { border: "1px solid #BFDBFE", background: "#EFF6FF", color: "#1D4ED8" }
      : tone === "amber"
        ? { border: "1px solid #FCD34D", background: "#FFFBEB", color: "#B45309" }
        : { border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#475569" };

  return (
    <div
      style={{
        ...style,
        borderRadius: 20,
        padding: "16px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          opacity: 0.85,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 32,
          fontWeight: 950,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailCard({
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
        borderRadius: 18,
        padding: "16px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "#64748B",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.6,
          color: "#0F172A",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function ActionFormButton({
  id,
  status,
  label,
  style,
}: {
  id: string;
  status: "REVIEW" | "APPROVED" | "ARCHIVED";
  label: string;
  style: {
    border: string;
    background: string;
    color: string;
  };
}) {
  return (
    <form action={updateIntakeStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        style={{
          width: "100%",
          borderRadius: 14,
          padding: "12px 16px",
          border: style.border,
          background: style.background,
          color: style.color,
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminIntakePage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const selectedStatus = normalizeStatus(params.status);

  const allSubmissions = await prisma.intakeSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const submissions = allSubmissions.filter((item) =>
    statusMatchesFilter(item.status, selectedStatus)
  );

  const totalCount = allSubmissions.length;
  const newCount = countForStatus(allSubmissions, "NEW");
  const reviewCount = countForStatus(allSubmissions, "REVIEW");
  const approvedCount = countForStatus(allSubmissions, "APPROVED");
  const archivedCount = countForStatus(allSubmissions, "ARCHIVED");

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F4F7FC 0%, #F8FAFC 44%, #FCFDFE 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#0F172A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "8px 18px 32px",
        }}
      >
        <section
          style={{
            overflow: "hidden",
            borderRadius: 30,
            border: "1px solid #DBEAFE",
            background:
              "linear-gradient(135deg, #0F4FD6 0%, #1D4ED8 45%, #1E3A8A 100%)",
            color: "#FFFFFF",
            boxShadow: "0 16px 34px rgba(49, 74, 159, 0.14)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 22,
              padding: "26px 28px",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.12)",
                  padding: "7px 12px",
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#DBEAFE",
                }}
              >
                Internal Intake Workspace
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 12,
                  fontWeight: 950,
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                  color: "#DBEAFE",
                }}
              >
                Notarix™
              </div>

              <h1
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 48,
                  fontWeight: 950,
                  lineHeight: 0.95,
                  letterSpacing: -1.2,
                }}
              >
                Admin Intake
              </h1>

              <p
                style={{
                  marginTop: 18,
                  marginBottom: 0,
                  maxWidth: 760,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#EFF6FF",
                  fontWeight: 500,
                }}
              >
                Review client onboarding, notary review, support inquiries, demos,
                and portal access requests through a production-grade internal intake queue.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <HeroMetric label="Total Records" value={totalCount} />
              <HeroMetric label="New" value={newCount} />
              <HeroMetric label="In Review" value={reviewCount} />
              <HeroMetric label="Approved" value={approvedCount} />
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid #E2E8F0",
              background: "#F3F6FA",
              borderRadius: 24,
              padding: "20px 20px",
              boxShadow: "0 12px 34px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#1D4ED8",
                  }}
                >
                  Queue Controls
                </div>
                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: 32,
                    fontWeight: 950,
                    lineHeight: 1,
                    letterSpacing: -0.6,
                    color: "#0F172A",
                  }}
                >
                  Intake Filters
                </h2>
                <p
                  style={{
                    marginTop: 10,
                    marginBottom: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Filter the queue by workflow state and review clearly separated intake records.
                </p>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 12,
                  border: "1px solid #DBEAFE",
                  background: "#EFF6FF",
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#1D4ED8",
                }}
              >
                Showing {submissions.length} submission{submissions.length === 1 ? "" : "s"}
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <FilterChip
                href="/admin/intake"
                label="All"
                count={totalCount}
                active={selectedStatus === "ALL"}
              />
              <FilterChip
                href="/admin/intake?status=NEW"
                label="New"
                count={newCount}
                active={selectedStatus === "NEW"}
              />
              <FilterChip
                href="/admin/intake?status=REVIEW"
                label="Review"
                count={reviewCount}
                active={selectedStatus === "REVIEW"}
              />
              <FilterChip
                href="/admin/intake?status=APPROVED"
                label="Approved"
                count={approvedCount}
                active={selectedStatus === "APPROVED"}
              />
              <FilterChip
                href="/admin/intake?status=ARCHIVED"
                label="Archived"
                count={archivedCount}
                active={selectedStatus === "ARCHIVED"}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <QueueMetric label="Archived" value={archivedCount} tone="slate" />
            <QueueMetric label="Active Queue" value={newCount + reviewCount} tone="amber" />
            <QueueMetric label="Visible Results" value={submissions.length} tone="blue" />
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          {submissions.length === 0 ? (
            <div
              style={{
                border: "1px solid #E2E8F0",
                background: "#F3F6FA",
                borderRadius: 24,
                padding: "70px 24px",
                boxShadow: "0 12px 36px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAFC",
                  borderRadius: 18,
                  padding: "40px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 950,
                    letterSpacing: -0.4,
                    color: "#0F172A",
                  }}
                >
                  No intake submissions found
                </div>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  There are no records for the selected workflow filter.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 22 }}>
              {submissions.map((item, index) => {
                const details = getDetailsObject(item.details);
                const normalizedStatus = normalizeDbStatus(item.status);

                return (
                  <article
                    key={item.id}
                    style={{
                      overflow: "hidden",
                      borderRadius: 26,
                      border: "2px solid #475569",
                      background: "#F3F6FA",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px solid #E2E8F0",
                        background:
                          "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
                        padding: "22px 24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          justifyContent: "space-between",
                          gap: 22,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "1 1 760px", minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                border: "1px solid #DBEAFE",
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.16em",
                              }}
                            >
                              Record {index + 1}
                            </span>

                            <span
                              style={{
                                border: "1px solid #E2E8F0",
                                background: "#F3F6FA",
                                color: "#475569",
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {formatDate(item.createdAt)}
                            </span>

                            <span
                              style={{
                                ...getStatusPillStyle(item.status),
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              {getStatusLabel(item.status)}
                            </span>

                          </div>

                          <h3
                            style={{
                              marginTop: 18,
                              marginBottom: 0,
                              fontSize: 34,
                              fontWeight: 950,
                              lineHeight: 1,
                              letterSpacing: -0.8,
                              color: "#0F172A",
                            }}
                          >
                            {item.fullName}
                          </h3>

                          <div
                            style={{
                              marginTop: 18,
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                border: "1px solid #E2E8F0",
                                background: "#F8FAFC",
                                borderRadius: 18,
                                padding: "16px 16px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 900,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.16em",
                                  color: "#64748B",
                                }}
                              >
                                Email
                              </div>
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  lineHeight: 1.6,
                                  color: "#0F172A",
                                  wordBreak: "break-word",
                                }}
                              >
                                {item.email ? (
                                  <a
                                    href={`mailto:${item.email}`}
                                    style={{
                                      color: "#1D4ED8",
                                      textDecoration: "underline",
                                      textUnderlineOffset: 2,
                                    }}
                                  >
                                    {item.email}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                border: "1px solid #E2E8F0",
                                background: "#F8FAFC",
                                borderRadius: 18,
                                padding: "16px 16px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 900,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.16em",
                                  color: "#64748B",
                                }}
                              >
                                Phone
                              </div>
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  lineHeight: 1.6,
                                  color: "#0F172A",
                                }}
                              >
                                {item.phone ? formatPhone(item.phone) : "—"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            width: 260,
                            display: "grid",
                            gap: 10,
                          }}
                        >
                          <a
                            href={`mailto:support@notarix.live?subject=${encodeURIComponent(
                              `Notarix Intake Follow-Up: ${item.fullName}`
                            )}&body=${encodeURIComponent(
                              `Hello ${item.fullName},

This is a follow-up regarding your Notarix intake submission.

Name: ${item.fullName}
Email: ${item.email || "N/A"}
Phone: ${item.phone ? formatPhone(item.phone) : "N/A"}
Status: ${getStatusLabel(item.status)}

Request Type: ${"requestType" in details ? String(details.requestType || "N/A") : "N/A"
                              }
Contact Type: ${"contactType" in details ? String(details.contactType || "N/A") : "N/A"
                              }
Company: ${"company" in details ? String(details.company || "N/A") : "N/A"
                              }
Coverage Area: ${"coverageArea" in details ? String(details.coverageArea || "N/A") : "N/A"
                              }

Original message:
${item.message || "No message provided."}

Best,
Notarix`
                            )}`}
                            style={{
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 14,
                              padding: "12px 16px",
                              background: "#162033",
                              color: "#FFFFFF",
                              fontSize: 14,
                              fontWeight: 800,
                            }}
                          >
                            Email
                          </a>

                          {normalizedStatus === "NEW" ? (
                            <ActionFormButton
                              id={item.id}
                              status="REVIEW"
                              label="Review"
                              style={{
                                border: "1px solid #FCD34D",
                                background: "#FFFBEB",
                                color: "#B45309",
                              }}
                            />
                          ) : null}

                          {normalizedStatus !== "APPROVED" && normalizedStatus !== "ARCHIVED" ? (
                            <ActionFormButton
                              id={item.id}
                              status="APPROVED"
                              label="Approve"
                              style={{
                                border: "1px solid #A7F3D0",
                                background: "#ECFDF5",
                                color: "#047857",
                              }}
                            />
                          ) : null}

                          {normalizedStatus !== "ARCHIVED" ? (
                            <ActionFormButton
                              id={item.id}
                              status="ARCHIVED"
                              label="Archive"
                              style={{
                                border: "1px solid #CBD5E1",
                                background: "#F8FAFC",
                                color: "#475569",
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.05fr 0.95fr",
                      }}
                    >
                      <div
                        style={{
                          borderRight: "1px solid #E2E8F0",
                          background: "#F3F6FA",
                          padding: "22px 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            color: "#1D4ED8",
                          }}
                        >
                          Intake Details
                        </div>

                        <div
                          style={{
                            marginTop: 16,
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 12,
                          }}
                        >
                          <DetailCard
                            label="Company"
                            value={
                              "company" in details ? String(details.company || "—") : "—"
                            }
                          />
                          <DetailCard
                            label="Contact Type"
                            value={
                              "contactType" in details
                                ? String(details.contactType || "—")
                                : "—"
                            }
                          />
                          <DetailCard
                            label="Request Type"
                            value={
                              "requestType" in details
                                ? String(details.requestType || "—")
                                : "—"
                            }
                          />
                          <DetailCard
                            label="Coverage Area"
                            value={
                              "coverageArea" in details
                                ? String(details.coverageArea || "—")
                                : "—"
                            }
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#F8FAFC",
                          padding: "22px 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            color: "#1D4ED8",
                          }}
                        >
                          Submission Message
                        </div>

                        <div
                          style={{
                            marginTop: 16,
                            minHeight: 220,
                            borderRadius: 18,
                            border: "1px solid #E2E8F0",
                            background: "#F3F6FA",
                            padding: "18px 18px",
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: "#475569",
                            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
                          }}
                        >
                          {item.message ? item.message : "No message provided."}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}