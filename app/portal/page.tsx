import { PortalAccessForm } from "./PortalAccessForm";

export default function PortalAccessPage() {
  return (
    <main className="portal-page">
      <header className="portal-header compact">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Portal navigation">
          <a href="/">Home</a>
        </nav>
      </header>

      <section className="single-form-shell" id="access-request">
        <PortalAccessForm />
      </section>
    </main>
  );
}
