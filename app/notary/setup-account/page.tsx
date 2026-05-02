export default function NotarySetupAccountPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "#F8FAFC",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            background: "#F3F4F6",
            border: "1px solid #D1D5DB",
            borderRadius: 24,
            padding: 16,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 116,
                height: 116,
                borderRadius: 20,
                background: "#FFFFFF",
                border: "1px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/notarix-logo.png"
                alt="Notarix logo"
                style={{
                  maxWidth: "78%",
                  maxHeight: "78%",
                  objectFit: "contain",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Notarix™
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#4B5563",
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#F3F4F6",
            border: "1px solid #D1D5DB",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#6B7280",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Notarix™ Notary Portal
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.05,
              fontWeight: 950,
              color: "#111827",
            }}
          >
            Set Up Your Account
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 24,
              color: "#4B5563",
              fontWeight: 600,
              fontSize: 16,
              maxWidth: 720,
              lineHeight: 1.6,
            }}
          >
            Complete your account setup to access the Notarix™ notary portal.
          </p>

          <form style={{ display: "grid", gap: 20, maxWidth: 680 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                style={inputStyle}
                placeholder="Enter your email address"
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Create Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                style={inputStyle}
                placeholder="Create your password"
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                style={inputStyle}
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              style={{
                border: 0,
                borderRadius: 12,
                padding: "14px 18px",
                background: "#3B59F4",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: 15,
                cursor: "pointer",
                width: "fit-content",
                boxShadow: "0 4px 10px rgba(59, 89, 244, 0.18)",
              }}
            >
              Complete Account Setup
            </button>
          </form>
        </div>
      </div>
    
    </main>
  );
}
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};