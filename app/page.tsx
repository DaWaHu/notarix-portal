const services = ["Mobile Notary", "Electronic Notary", "Remote Online Notary"];

const serviceCards = [
  {
    title: "Mobile Notary",
    body: "Professional notarization at homes, offices, hospitals, facilities, and agreed signing locations.",
  },
  {
    title: "Electronic Notarial Services",
    body: "Structured electronic notarization workflows with secure identity readiness, document handling, and completion tracking.",
  },
  {
    title: "Remote Online Notary",
    body: "Secure RON coordination with approved remote notaries, participant invitations, and attorney observer access when permitted.",
  },
];

const trustSignals = [
  "Role-based portal access",
  "RON authorization review",
  "Secure document workflow",
  "Audit-ready transaction history",
];

const legalLinks = [
  "Privacy Policy",
  "Terms of Use",
  "Accessibility",
  "Cookie Notice",
  "Refund and Cancellation Policy",
  "RON Disclosure",
  "Mobile Notary Service Terms",
  "Electronic Communications Consent",
  "Disclaimer",
];

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero">
        <header className="site-header">
          <a className="brand" href="/">
            <img src="/notarix-logo.png" alt="Notarix Signings" />
          </a>
          <nav aria-label="Primary navigation">
            <a href="#services">Services</a>
            <a href="/portal">Request Portal Access</a>
            <a className="nav-cta" href="/portal">Request Access</a>
          </nav>
        </header>

        <div className="hero-grid">
          <section className="hero-copy" aria-label="Notarix service overview">
            <p className="kicker">Professional mobile and remote notary</p>
            <p className="service-line">{services.join(" | ")}</p>
            <h1>Notarial Services Made Simple</h1>
            <p className="intro">
              Notarix provides reliable mobile, electronic, and remote online
              notarial services for individuals, families, law firms, and
              businesses. We support secure appointment coordination, document
              readiness, signer communication, and same-day notary needs.
            </p>
            <div className="hero-actions">
              <a className="cta primary" href="/portal">
                Request Access <span aria-hidden="true">›</span>
              </a>
            </div>
          </section>

          <aside className="visual-panel" aria-label="Notarix service preview">
            <div className="hero-image-frame">
              <img
                className="hero-image"
                src="/notarix-hero-notarial-session.png"
                alt="Professional notarial appointment with documents and no visible faces"
              />
            </div>
          </aside>
        </div>
      </section>

      <section
        className="service-section"
        id="services"
        aria-label="Notarix service pillars"
      >
        <div className="section-heading">
          <p>Notarix Signings platform standard</p>
          <h2>Premium notarial service presentation with secure portal intelligence.</h2>
        </div>

        <div className="service-grid">
          {serviceCards.map((card) => (
            <article key={card.title}>
              <span />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <div className="trust-strip">
          {trustSignals.map((signal) => (
            <p key={signal}>{signal}</p>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <section className="footer-links" aria-label="Legal and policy resources">
          {legalLinks.map((link) => (
            <span aria-disabled="true" className="locked-link" key={link}>
              {link}
            </span>
          ))}
        </section>

        <section className="copyright">
          <p>© Copyright Notarix Signings 2026</p>
          <p>
            Website content, service descriptions, branding, graphics, documents,
            workflows, educational materials, and digital resources are provided
            for Notarix Signings use and may not be copied, distributed,
            modified, or used commercially without written authorization.
          </p>
        </section>
      </footer>
    </main>
  );
}
