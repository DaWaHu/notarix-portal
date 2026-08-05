export default function MaintenancePage() {
  return (
    <main className="maintenance-shell">
      <section className="maintenance-panel">
        <div>
          <img
            alt="Notarix Signings"
            className="maintenance-logo"
            src="/notarix-logo.png"
          />
          <p className="maintenance-kicker">Controlled maintenance window</p>
          <h1>Notarix Signings portal access is temporarily restricted.</h1>
          <p>
            Public profile, order, client, and notary workflows are paused while
            Notarix Signings performs controlled maintenance. Staff access,
            provider callbacks, and recovery routes remain available to
            authorized personnel.
          </p>
        </div>

        <dl className="maintenance-status">
          <div>
            <dt>Portal state</dt>
            <dd>Maintenance lock active</dd>
          </div>
          <div>
            <dt>Public workflows</dt>
            <dd>Temporarily unavailable</dd>
          </div>
          <div>
            <dt>Staff operations</dt>
            <dd>Restricted access remains available</dd>
          </div>
        </dl>

        <div className="maintenance-actions">
          <a href="/auth/login">Staff Sign In</a>
          <a href="mailto:support@notarix.live">Contact Support</a>
        </div>

        <p className="maintenance-note">
          No action is required from clients, notaries, or signers unless
          Notarix Signings staff contacts you directly.
        </p>
      </section>
    </main>
  );
}
