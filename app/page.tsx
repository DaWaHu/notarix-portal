import Image from "next/image";

export default function HomePage() {

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        color: "#0F172A",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          background: "linear-gradient(90deg, #1E3A8A 0%, #1E40AF 55%, #2563EB 100%)",
          color: "white",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 10px 30px rgba(30, 64, 175, 0.20)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Image
            src="/notarix-logo.png"
            alt="Notarix Logo"
            width={52}
            height={52}
            priority
            style={{
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.3 }}>
              NOTARIX™
            </div>
            <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 700 }}>
              Notary order management & signing coordination platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/contact"
            style={{
              background: "white",
              color: "#1E40AF",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
            }}
          >
            Approved User Login
          </a>

          <a
            href="#request-demo"
            style={{
              background: "#0F172A",
              color: "white",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
            }}
          >
            Request Demo
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 34px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            padding: "36px 30px",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.07)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix Signing"
              width={220}
              height={220}
              priority
            />
          </div>

          <h1
            style={{
              fontSize: 46,
              lineHeight: 1.15,
              margin: "0 0 16px",
              fontWeight: 950,
              textAlign: "center",
            }}
          >
            NOTARIX™ helps title companies manage notary signings end-to-end.
          </h1>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "#334155",
              maxWidth: 860,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            NOTARIX™ is a web-based software platform used to create and manage
            notary signing orders, assign notaries, provide signing instructions,
            share and track closing documents, communicate securely between
            parties, monitor order status, and manage notary fee and payment
            details.
          </p>

          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#1E40AF",
            }}
          >
            Built for approved title companies, signing services, and professional notary networks.
          </div>

          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Platform access is provided only to approved organizations and authorized users.
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a
              href="/contact"
              style={{
                background: "#1E40AF",
                color: "white",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 950,
                textDecoration: "none",
                boxShadow: "0 10px 24px rgba(30, 64, 175, 0.22)",
              }}
            >
              Request Platform Access
            </a>

            <a
              href="#features"
              style={{
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 950,
                textDecoration: "none",
              }}
            >
              See Features
            </a>
          </div>
        </div>

        {/* Product Preview Section */}
        <div
          style={{
            marginTop: 24,
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
            border: "1px solid #E5E7EB",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "#1E40AF",
                  marginBottom: 10,
                }}
              >
                Platform Preview
              </div>

              <h2
                style={{
                  fontSize: 30,
                  lineHeight: 1.2,
                  fontWeight: 950,
                  margin: "0 0 14px",
                  color: "#0F172A",
                }}
              >
                Manage notary operations from one centralized dashboard.
              </h2>

              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "#334155",
                  margin: "0 0 16px",
                }}
              >
                NOTARIX™ gives title companies and signing services a single place to
                create orders, assign notaries, manage closing documents, communicate
                with vendors, and track payments in real time.
              </p>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "#334155",
                  lineHeight: 1.9,
                  fontSize: 15,
                }}
              >
                <li>Assign and manage notary signings from one dashboard</li>
                <li>Track document delivery, signing progress, and order status</li>
                <li>Streamline communication, vendor coordination, and payments</li>
              </ul>
            </div>

            <div
              style={{
                background: "#0F172A",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.20)",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)",
                  color: "white",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                NOTARIX™ Dashboard
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {[
                    "Order Intake Review",
                    "Assignment Workflow",
                    "Payment Status Tracking",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                        padding: "12px 14px",
                        fontWeight: 700,
                        color: "#0F172A",
                        background: "#F8FAFC",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  {["Documents", "Messages", "Payments"].map((item) => (
                    <div
                      key={item}
                      style={{
                        background: "#DBEAFE",
                        color: "#1E3A8A",
                        borderRadius: 12,
                        padding: "14px 10px",
                        textAlign: "center",
                        fontWeight: 900,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
{/* Who NOTARIX is for */}
<div
  style={{
    marginTop: 24,
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
  }}
>
  <div
    style={{
      fontWeight: 950,
      fontSize: 20,
      marginBottom: 14,
    }}
  >
    Who NOTARIX™ is for
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 14,
    }}
  >
    {[
      {
        title: "Title Companies",
        text: "Manage signing orders, track document delivery, and coordinate notaries from one centralized system.",
      },
      {
        title: "Signing Services",
        text: "Assign vendors, monitor signing progress, and streamline communication across your network.",
      },
      {
        title: "Professional Notaries",
        text: "Receive assignments, access documents, communicate with clients, and track payment status.",
      },
    ].map((item) => (
      <div
        key={item.title}
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: 16,
          background: "#F8FAFC",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            marginBottom: 6,
            color: "#0F172A",
          }}
        >
          {item.title}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          {item.text}
        </div>
      </div>
    ))}
  </div>
</div>
        {/* In-use proof section */}
        <div
          style={{
            marginTop: 22,
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 8 }}>
            Use NOTARIX™ to:
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#334155",
              lineHeight: 1.9,
              fontSize: 16,
            }}
          >
            <li>Create notary orders and set appointment date/time</li>
            <li>Assign a notary and track status (Pending → Active → Completed → Closed)</li>
            <li>Upload and share instructions and closing packages</li>
            <li>Send secure messages between title company and notary</li>
            <li>Track notary fee, payment method, and payment timing</li>
          </ul>
        </div>

        {/* Features */}
        <div
          id="features"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {[
            {
              title: "Notary Orders",
              text: "Create orders, assign notaries, set signing details, and track status.",
            },
            {
              title: "Documents",
              text: "Upload and share closing packages, instructions, and signed returns.",
            },
            {
              title: "Communication & Payments",
              text: "Centralize messages and track notary fee, payment method, and status.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  fontWeight: 950,
                  marginBottom: 8,
                  fontSize: 18,
                  color: "#0F172A",
                }}
              >
                {f.title}
              </div>

              <div style={{ color: "#334155", lineHeight: 1.6 }}>{f.text}</div>
            </div>
          ))}
        </div>

        {/* Demo / Contact */}
        <div
          id="request-demo"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
            border: "1px solid #E5E7EB",
            borderRadius: 20,
            padding: 22,
            marginTop: 24,
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 20 }}>
            Request a NOTARIX™ demo
          </div>

          <p style={{ marginTop: 10, color: "#334155", lineHeight: 1.7, maxWidth: 780 }}>
            Interested in using NOTARIX™ for notary order management and signing
            coordination? Contact us to request a demo and learn how the platform
            supports title companies, signing services, and vendor networks.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <a
              href="/contact"
              style={{
                background: "#0F172A",
                color: "white",
                padding: "12px 16px",
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.25)",
                transition: "all .15s ease",
              }}
            >
              Contact / Support
            </a>

            <a
              href="/vendors/profile"
              style={{
                background: "linear-gradient(90deg,#1E3A8A,#2563EB)",
                color: "white",
                padding: "12px 18px",
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
                transition: "all .15s ease",
              }}
            >
              Request Vendor Approval
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #E5E7EB",
          padding: "18px 24px",
          color: "#475569",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          background: "#FFFFFF",
        }}
      >
        <div>© NOTARIX™</div>
        <div>
          Accessed: <span style={{ fontWeight: 900 }}>{today}</span>
        </div>
      </footer>
    </main>
  );
}