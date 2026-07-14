import { supportThreads } from "../operations-data";

export default function SupportPage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Support Messages</span>
        </a>
        <nav aria-label="Support navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/notary/dashboard">Notary Dashboard</a>
          <a className="nav-cta" href="/support">Support</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Message Center · Staff-Visible Support</p>
          <h1>Support And Correction Threads</h1>
          <p>
            Coordinate correction requests, credential questions, order issues,
            and escalation ownership without exposing restricted staff-only
            audit notes.
          </p>
        </div>
        <aside>
          <p>Escalation control</p>
          <strong>Owned queue</strong>
          <span>Every thread has a staff owner and last activity time.</span>
        </aside>
      </section>

      <section className="verification-layout" aria-label="Support workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Message views</p>
            <nav>
              {["All Threads", "Corrections", "Credentials", "Orders", "Escalated"].map((label) => (
                <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Thread register</p>
                <h2>Support communication matrix</h2>
              </div>
              <strong>{supportThreads.length} threads</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Support threads</caption>
                <thead>
                  <tr>
                    <th scope="col">Thread</th>
                    <th scope="col">Participant</th>
                    <th scope="col">Status</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Last activity</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {supportThreads.map((thread) => (
                    <tr key={thread.id}>
                      <td><span>{thread.id}</span><strong>{thread.subject}</strong></td>
                      <td>{thread.participant}</td>
                      <td><mark>{thread.status}</mark></td>
                      <td>{thread.owner}</td>
                      <td>{thread.lastActivity}</td>
                      <td><button type="button">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Support policy</p>
            <h2>Controlled messaging</h2>
            <dl>
              <div><dt>Correction messages</dt><dd>Returned sections only</dd></div>
              <div><dt>Restricted notes</dt><dd>Staff-only audit material withheld</dd></div>
              <div><dt>Escalations</dt><dd>Assigned staff owner required</dd></div>
              <div><dt>Retention</dt><dd>Thread retained with profile or order record</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
