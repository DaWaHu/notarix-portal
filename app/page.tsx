import Image from "next/image";
import type { CSSProperties } from "react";

const PAGE_BLUE = "#FFFFFF";
const CARD_GRAY = "#F1F1F1";
const INNER_GRAY = "#F7F7F8";
const BORDER = "#C7CFDB";
const BORDER_SOFT = "#D6DCE6";
const PRIMARY_BLUE = "#3B59F4";
const PRIMARY_BLUE_SOFT = "#EEF2FF";
const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: PAGE_BLUE,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        color: TEXT_DARK,
      }}
    >
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "6px 4px 0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#f3f3f3",
            border: "1px solid #d7d7d7",
            borderRadius: 18,
            padding: "6px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 22,
                background: "#ffffff",
                border: "1px solid #d7d7d7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                flexShrink: 0,
              }}
            >
              <Image
                src="/notarix-logo.png"
                alt="Notarix™"
                width={76}
                height={76}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 16,
                  lineHeight: 1.1,
                  letterSpacing: -0.3,
                  color: "#333333",
                }}
              >
                Notarix™
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#666666",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginTop: 8,
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a href="/contact" style={headerPrimaryButton}>
              Request Access
            </a>
            <a href="/admin" style={headerPrimaryButton}>
              Staff Portal
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "18px 20px 14px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            background: CARD_GRAY,
            border: `2px solid ${BORDER}`,
            boxShadow:
              "0 1px 2px rgba(20, 23, 34, 0.03), inset 0 4px 0 rgba(59, 89, 244, 0.9)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 78% 35%, rgba(59, 89, 244, 0.08), transparent 24%), radial-gradient(circle at 85% 70%, rgba(59, 89, 244, 0.05), transparent 28%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              padding: "28px 26px 30px",
              display: "grid",
              gridTemplateColumns: "1.08fr 0.92fr",
              gap: 26,
              alignItems: "center",
            }}
          >
            <div>
              <div style={eyebrowPillStyle}>
                Professional notary operations and client portal access
              </div>

              <h1
                style={{
                  margin: "18px 0 0",
                  fontSize: 42,
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: -1.1,
                  maxWidth: 640,
                  color: TEXT_DARK,
                }}
              >
                A professional notary portal designed for secure, scalable
                signing operations.
              </h1>

              <p
                style={{
                  marginTop: 18,
                  marginBottom: 0,
                  fontSize: 16,
                  lineHeight: 1.58,
                  color: TEXT_MID,
                  maxWidth: 680,
                  fontWeight: 500,
                }}
              >
                Built to support law firms, title companies, lenders, escrow
                teams, and institutional notarial workflows. Notarix is designed
                to support structured document execution, workflow oversight,
                service coordination, and client-specific operational
                customization.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 26,
                }}
              >
                <a href="/contact" style={heroSecondaryButton}>
                  Schedule a Consultation »
                </a>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 34,
                overflow: "hidden",
                background:
                  "linear-gradient(180deg, #F6F8FC 0%, #EEF2F8 48%, #E7ECF5 100%)",
                border: `1px solid ${BORDER_SOFT}`,
                boxShadow: "0 22px 56px rgba(20, 23, 34, 0.08)",
                isolation: "isolate",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    radial-gradient(circle at 18% 20%, rgba(59, 89, 244, 0.14), transparent 30%),
                    radial-gradient(circle at 82% 18%, rgba(59, 89, 244, 0.10), transparent 26%),
                    linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(247,249,252,0.82) 34%, rgba(234,239,247,0.88) 100%)
                  `,
                  zIndex: 0,
                }}
              />

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 18%, rgba(255,255,255,0.14) 82%, rgba(255,255,255,0.42) 100%)",
                  opacity: 0.7,
                  zIndex: 0,
                }}
              />

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "7%",
                  right: "7%",
                  top: "8%",
                  height: "49%",
                  borderRadius: 24,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(232,238,248,0.96) 0%, rgba(219,227,240,0.96) 100%)",
                  border: "1px solid rgba(167, 180, 204, 0.42)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 100%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`window-pane-${i}`}
                      style={{
                        borderLeft:
                          i === 0
                            ? "none"
                            : "1px solid rgba(139, 152, 176, 0.26)",
                      }}
                    />
                  ))}
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "46%",
                    background:
                      "linear-gradient(180deg, rgba(206,216,232,0.10) 0%, rgba(188,200,220,0.22) 100%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "6%",
                    right: "6%",
                    bottom: "14%",
                    height: 120,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "0%",
                      bottom: 0,
                      width: 54,
                      height: 66,
                      borderRadius: "10px 10px 0 0",
                      background:
                        "linear-gradient(180deg, #AEBBD0 0%, #93A3BD 100%)",
                      opacity: 0.9,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "9%",
                      bottom: 0,
                      width: 70,
                      height: 92,
                      borderRadius: "12px 12px 0 0",
                      background:
                        "linear-gradient(180deg, #98A9C4 0%, #7E90AE 100%)",
                      opacity: 0.92,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "22%",
                      bottom: 0,
                      width: 58,
                      height: 76,
                      borderRadius: "10px 10px 0 0",
                      background:
                        "linear-gradient(180deg, #A8B6CA 0%, #8B9CB6 100%)",
                      opacity: 0.92,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "35%",
                      bottom: 0,
                      width: 82,
                      height: 110,
                      borderRadius: "12px 12px 0 0",
                      background:
                        "linear-gradient(180deg, #8B9FBE 0%, #7187A9 100%)",
                      opacity: 0.94,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "52%",
                      bottom: 0,
                      width: 66,
                      height: 88,
                      borderRadius: "12px 12px 0 0",
                      background:
                        "linear-gradient(180deg, #A6B4CA 0%, #8799B4 100%)",
                      opacity: 0.9,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "66%",
                      bottom: 0,
                      width: 92,
                      height: 98,
                      borderRadius: "12px 12px 0 0",
                      background:
                        "linear-gradient(180deg, #95A8C4 0%, #778CAB 100%)",
                      opacity: 0.92,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "0%",
                      bottom: 0,
                      width: 60,
                      height: 72,
                      borderRadius: "10px 10px 0 0",
                      background:
                        "linear-gradient(180deg, #B1BDD1 0%, #92A3BD 100%)",
                      opacity: 0.88,
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "7%",
                    right: "7%",
                    bottom: "11%",
                    height: 2,
                    background: "rgba(122, 134, 156, 0.28)",
                  }}
                />
              </div>

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  bottom: "10%",
                  height: "34%",
                  borderRadius: 28,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(242,246,251,0.96) 100%)",
                  border: "1px solid rgba(179, 189, 207, 0.48)",
                  boxShadow:
                    "0 18px 28px rgba(20, 23, 34, 0.06), inset 0 1px 0 rgba(255,255,255,0.88)",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "5.5%",
                    right: "5.5%",
                    top: "18%",
                    height: 12,
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, #D8E0EC 0%, #C6D0DF 100%)",
                    opacity: 0.9,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "8%",
                    top: "34%",
                    width: "30%",
                    height: "42%",
                    borderRadius: 18,
                    background:
                      "linear-gradient(180deg, rgba(236,241,248,0.96) 0%, rgba(225,232,243,0.96) 100%)",
                    border: "1px solid rgba(180, 191, 211, 0.52)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 12,
                      top: 12,
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(59, 89, 244, 0.18)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 24,
                      top: 32,
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(118, 132, 156, 0.22)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 36,
                      top: 48,
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(118, 132, 156, 0.16)",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "41%",
                    top: "26%",
                    width: "22%",
                    height: "50%",
                    borderRadius: 18,
                    background:
                      "linear-gradient(180deg, rgba(229,236,246,0.98) 0%, rgba(214,224,239,0.98) 100%)",
                    border: "1px solid rgba(173, 186, 208, 0.48)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  <div
                    style={{
                      width: "58%",
                      height: "58%",
                      borderRadius: 14,
                      background:
                        "linear-gradient(180deg, rgba(59,89,244,0.18) 0%, rgba(59,89,244,0.08) 100%)",
                      border: "1px solid rgba(59,89,244,0.14)",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: "8%",
                    top: "32%",
                    width: "22%",
                    height: "38%",
                    borderRadius: 18,
                    background:
                      "linear-gradient(180deg, rgba(236,241,248,0.96) 0%, rgba(224,231,242,0.96) 100%)",
                    border: "1px solid rgba(180, 191, 211, 0.52)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      right: 14,
                      top: 14,
                      height: 9,
                      borderRadius: 999,
                      background: "rgba(118, 132, 156, 0.16)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      right: 28,
                      top: 32,
                      height: 9,
                      borderRadius: 999,
                      background: "rgba(118, 132, 156, 0.12)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 52,
                      width: 42,
                      height: 24,
                      borderRadius: 999,
                      background: "rgba(59, 89, 244, 0.12)",
                      border: "1px solid rgba(59, 89, 244, 0.14)",
                    }}
                  />
                </div>
              </div>

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "10%",
                  right: "10%",
                  bottom: "8%",
                  height: 26,
                  borderRadius: 999,
                  background: "rgba(20, 23, 34, 0.08)",
                  filter: "blur(12px)",
                  zIndex: 2,
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  width: "min(72%, 360px)",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "10%",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 56%, rgba(255,255,255,0.24) 100%)",
                    filter: "blur(2px)",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "18%",
                    borderRadius: "50%",
                    border: "1px solid rgba(59, 89, 244, 0.12)",
                    background: "rgba(255,255,255,0.42)",
                    backdropFilter: "blur(3px)",
                  }}
                />
                <Image
                  src="/notarix-logo.png"
                  alt="Notarix"
                  fill
                  sizes="(max-width: 900px) 260px, 360px"
                  style={{
                    objectFit: "contain",
                    filter: "drop-shadow(0 22px 40px rgba(20, 23, 34, 0.16))",
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "2px 20px 14px",
          boxSizing: "border-box",
        }}
      >
        <div style={sectionCardStyle}>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              lineHeight: 1.08,
              fontWeight: 950,
              color: TEXT_DARK,
              letterSpacing: -0.4,
            }}
          >
            Services a professional notary portal can provide
          </h2>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <div style={featureCard}>
              <div style={featureIconPill}>📋</div>
              <div style={featureTitle}>Portal-Based Request Management</div>
              <div style={featureText}>
                Centralized submission of service requests and supporting
                documents, with structured workflow visibility and administrative
                oversight.
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIconPill}>📄</div>
              <div style={featureTitle}>
                Structured Communication and Status Oversight
              </div>
              <div style={featureText}>
                Disciplined coordination of updates, document exchange, and
                signing milestones for greater accountability and clarity.
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIconPill}>🧩</div>
              <div style={featureTitle}>
                Client-Specific Workflow Customization
              </div>
              <div style={featureText}>
                Adaptable workflows that align service structures and document
                expectations with the operational needs of each client.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "2px 20px 14px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div style={sectionCardStyle}>
            <div style={visionMissionHeadingRowStyle}>
              <div style={visionMissionIconStyle}>👁</div>
              <div style={visionMissionTitleStyle}>Vision</div>
            </div>
            <p style={visionMissionBodyStyle}>
              To provide organizations with a secure, reliable, and
              client-centered portal through which professional notarial
              services may be coordinated, managed, and reviewed with greater
              administrative confidence.
            </p>
          </div>

          <div style={sectionCardStyle}>
            <div style={visionMissionHeadingRowStyle}>
              <div style={visionMissionIconStyle}>🛡️</div>
              <div style={visionMissionTitleStyle}>Mission</div>
            </div>
            <p style={visionMissionBodyStyle}>
              To facilitate a superior standard of document execution, workflow
              coordination, and operational clarity, while supporting the
              service, reporting, and compliance expectations of institutional
              and professional clients.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "2px 20px 20px",
          boxSizing: "border-box",
        }}
      >
        <div style={sectionCardStyle}>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              lineHeight: 1.08,
              fontWeight: 950,
              color: TEXT_DARK,
              letterSpacing: -0.4,
            }}
          >
            What the portal is built to provide
          </h2>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            <InfoRow
              title="Secure Client Access"
              text="Controlled access to relevant requests, records, and operational details based on user role."
              icon="🔒"
            />
            <InfoRow
              title="Order and Service Visibility"
              text="Clear oversight of active orders, notarial service status, and progress updates."
              icon="🔎"
            />
            <InfoRow
              title="Documentation Control"
              text="Organized handling of forms and supporting documents to reduce errors and administrative omissions."
              icon="📁"
            />
            <InfoRow
              title="Operational Flexibility"
              text="Custom workflows to align with unique client needs and operational protocols."
              icon="⚙️"
            />
          </div>
        </div>
      </section>

      <footer
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 20px 30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            borderRadius: 22,
            minHeight: 210,
            background: CARD_GRAY,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              minHeight: 210,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: TEXT_MID,
              textAlign: "center",
              padding: "24px 16px",
            }}
          >
            <div style={footerLogoShellStyle}>
              <Image
                src="/notarix-logo.png"
                alt="Notarix"
                width={58}
                height={58}
                style={{
                  width: 58,
                  height: 58,
                  objectFit: "contain",
                }}
              />
            </div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              © 2026 Notarix.live
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoRow({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER_SOFT}`,
        borderRadius: 14,
        padding: "18px 18px",
        background: INNER_GRAY,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: "#FFFFFF",
          border: `1px solid ${BORDER_SOFT}`,
          fontSize: 20,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: TEXT_DARK,
            marginBottom: 5,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: TEXT_MID,
            fontWeight: 600,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

const headerPrimaryButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  background: PRIMARY_BLUE,
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  boxShadow: "0 6px 14px rgba(59, 89, 244, 0.18)",
};

const heroSecondaryButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#ffffff",
  color: TEXT_DARK,
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 900,
  fontSize: 14,
  border: `1px solid ${BORDER_SOFT}`,
};

const eyebrowPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: PRIMARY_BLUE_SOFT,
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 999,
  padding: "8px 14px",
  fontSize: 12,
  fontWeight: 800,
  color: TEXT_DARK,
};

const sectionCardStyle: CSSProperties = {
  background: CARD_GRAY,
  border: `1px solid ${BORDER}`,
  borderRadius: 22,
  padding: "22px 22px 20px",
  boxShadow: "0 1px 2px rgba(20, 23, 34, 0.03)",
};

const featureCard: CSSProperties = {
  background: INNER_GRAY,
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 18,
  padding: "18px 18px",
};

const featureIconPill: CSSProperties = {
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  background: "#FFFFFF",
  border: `1px solid ${BORDER_SOFT}`,
  fontSize: 22,
  marginBottom: 12,
};

const featureTitle: CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  color: TEXT_DARK,
  marginBottom: 10,
  lineHeight: 1.15,
};

const featureText: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 600,
  color: TEXT_MID,
};

const visionMissionHeadingRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const visionMissionIconStyle: CSSProperties = {
  width: 50,
  height: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#FFFFFF",
  border: `1px solid ${BORDER_SOFT}`,
  fontSize: 24,
};

const visionMissionTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  color: TEXT_DARK,
};

const visionMissionBodyStyle: CSSProperties = {
  margin: "16px 0 0",
  fontSize: 16,
  lineHeight: 1.6,
  color: TEXT_DARK,
  fontWeight: 500,
};

const footerLogoShellStyle: CSSProperties = {
  width: 78,
  height: 78,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#FFFFFF",
  borderRadius: 16,
  border: `1px solid ${BORDER_SOFT}`,
};