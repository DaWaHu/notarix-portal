export const dynamic = "force-dynamic";

const sectionCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 950,
  color: "#0F172A",
  margin: 0,
};

const listStyle: React.CSSProperties = {
  margin: "14px 0 0",
  paddingLeft: 20,
  color: "#334155",
  fontWeight: 600,
  lineHeight: 1.8,
};

export default function ClientBusinessRulesPage() {
  return (
    <main
      style={{
        padding: "8px 18px 32px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
            border: "1px solid #BFDBFE",
            borderRadius: 30,
            padding: 26,
            boxShadow: "0 14px 34px rgba(30, 58, 138, 0.14)",
            color: "#FFFFFF",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.10)",
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#DBEAFE",
            }}
          >
            Client Policies
          </div>

          <h1
            style={{
              margin: "14px 0 0",
              fontSize: 44,
              lineHeight: 1,
              fontWeight: 950,
              letterSpacing: -1,
            }}
          >
            Notarix Client Business Rules
          </h1>

          <div
            style={{
              marginTop: 12,
              fontSize: 15,
              lineHeight: 1.7,
              fontWeight: 600,
              color: "#E0E7FF",
              maxWidth: 860,
            }}
          >
            These standards govern how client organizations submit work, maintain
            account readiness, communicate with Notarix, and remain in approved status.
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          <section style={sectionCard}>
            <h2 style={sectionTitle}>Required Client Standards</h2>
            <ul style={listStyle}>
              <li>Maintain complete and current organization profile information.</li>
              <li>Keep primary and secondary contact information accurate at all times.</li>
              <li>Submit all required onboarding and compliance documents before final approval.</li>
              <li>Use approved portal channels for operational communication and document delivery.</li>
              <li>Notify Notarix promptly of any material contact, billing, or service-area changes.</li>
            </ul>
          </section>

          <section style={sectionCard}>
            <h2 style={sectionTitle}>Order Submission Rules</h2>
            <ul style={listStyle}>
              <li>Orders are not considered confirmed until acknowledged in the system.</li>
              <li>Incomplete files or missing signing details may delay assignment or scheduling.</li>
              <li>Special instructions, signer issues, and time-sensitive conditions must be disclosed in advance.</li>
              <li>Clients must provide accurate borrower, property, and scheduling data.</li>
              <li>Last-minute requests are subject to availability and are not guaranteed.</li>
            </ul>
          </section>

          <section style={sectionCard}>
            <h2 style={sectionTitle}>Document Handling Rules</h2>
            <ul style={listStyle}>
              <li>Only upload relevant, complete, and properly labeled documents.</li>
              <li>Sensitive documents must be transmitted through approved portal workflows only.</li>
              <li>Required client documents must remain current to maintain approved status.</li>
              <li>Expired, incomplete, or inconsistent documents may place the account back into review.</li>
              <li>Clients are responsible for the accuracy of all uploaded records.</li>
            </ul>
          </section>

          <section style={sectionCard}>
            <h2 style={sectionTitle}>Billing & Administrative Rules</h2>
            <ul style={listStyle}>
              <li>Billing contact information must remain current and monitored.</li>
              <li>Payment terms and invoicing expectations must be acknowledged before final approval.</li>
              <li>Outstanding administrative or compliance issues may delay service activation.</li>
              <li>Repeated account deficiencies may result in restricted portal access or account review.</li>
            </ul>
          </section>

          <section style={sectionCard}>
            <h2 style={sectionTitle}>Client Do&apos;s and Don&apos;ts</h2>
            <ul style={listStyle}>
              <li>Do provide complete order instructions and updated contact information.</li>
              <li>Do identify unusual signing conditions, access issues, or compliance constraints in advance.</li>
              <li>Do keep your client profile and required documents current.</li>
              <li>Don&apos;t bypass approved communication channels for operational matters.</li>
              <li>Don&apos;t submit incomplete packages and assume immediate scheduling.</li>
              <li>Don&apos;t share portal access with unauthorized personnel.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}