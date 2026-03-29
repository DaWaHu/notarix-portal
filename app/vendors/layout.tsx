import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function VendorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #EFF4FF 0%, #F8FAFC 46%, #FFFFFF 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px 18px 10px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBEAFE",
            borderRadius: 20,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            boxShadow: "0 10px 28px rgba(30, 64, 175, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.10)",
                flexShrink: 0,
              }}
            >
              <Image
                src="/notarix-logo.png"
                alt="Notarix™"
                width={28}
                height={28}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 20,
                  lineHeight: 1.05,
                  letterSpacing: -0.2,
                  color: "#1E3A8A",
                }}
              >
                Notarix Client Portal
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginTop: 2,
                }}
              >
                Approved client workspace
              </div>
            </div>
          </div>

          <nav
            aria-label="Client portal navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={navButtonStyle}>
              Home
            </Link>
            <Link href="/vendors" style={navButtonStyle}>
              Clients
            </Link>
          </nav>
        </div>
      </section>

      <div>{children}</div>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#1D4ED8",
  color: "#FFFFFF",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 900,
  fontSize: 14,
  lineHeight: 1,
  boxShadow: "0 8px 18px rgba(29, 78, 216, 0.14)",
};