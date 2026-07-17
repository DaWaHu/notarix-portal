import { requireStaffRouteAccess } from "../../access-policy";
import {
  getDeploymentReadinessControls,
  getDeploymentReadinessSummary,
  getDeploymentRequiredRuntimeSecrets,
} from "../../deployment-readiness-data";

export default async function DeploymentReadinessCenterPage() {
  const { role, user } = await requireStaffRouteAccess(
    "/staff/deployment-readiness",
    ["Admin", "SuperAdmin"],
  );
  const summary = getDeploymentReadinessSummary();
  const controls = getDeploymentReadinessControls(summary);
  const runtimeSecrets = getDeploymentRequiredRuntimeSecrets();
  const launchBlockers = [
    !summary.databaseConfigured ? "Postgres DATABASE_URL required" : null,
    summary.missingRequiredRuntimeSecrets.length
      ? `${summary.missingRequiredRuntimeSecrets.length} required runtime secret(s) missing`
      : null,
    !summary.productionUrlConfigured ? "Production URL required for callback replay" : null,
  ].filter(Boolean);

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Deployment readiness navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/platform">Platform Configuration</a>
          <a href="/staff/integrations">Integrations</a>
          <a href="/staff/system-health">System Health</a>
          <a className="nav-cta" href="/staff/deployment-readiness">
            Deployment Readiness
          </a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Production Deployment · Runtime Secret Control</p>
          <h1>Deployment Readiness Center</h1>
          <p>
            Confirm the production project binding, database binding, runtime
            secret homes, callback replay command, and launch hold status before
            Notarix Signings releases live profile, evidence, notification, and
            order workflows.
          </p>
        </div>
        <aside>
          <p>Launch posture</p>
          <strong>{summary.status}</strong>
          <span>
            {launchBlockers.length
              ? `${launchBlockers.length} blocker(s) require resolution.`
              : "Ready for signed callback replay against deployment."}
          </span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Deployment readiness summary">
        {[
          [
            "Production host",
            "Vercel",
            summary.vercelEnvironmentDetected ? "Vercel runtime detected" : "Local readiness preview",
          ],
          [
            "Postgres database",
            summary.databaseConfigured ? "Configured" : "DATABASE_URL required",
            "Production workflow persistence must bind to Postgres.",
          ],
          [
            "Runtime secrets",
            `${summary.presentRequiredRuntimeSecretCount} of ${summary.requiredRuntimeSecretCount}`,
            "Required secret references detected without exposing values.",
          ],
          [
            "Callback replay",
            summary.productionUrlConfigured ? "Ready" : "URL pending",
            "Signed callback replay runs after deployed URL is available.",
          ],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Deployment readiness workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Deployment file</p>
              <h2>{summary.providerPlatform}</h2>
              <span>
                Runtime secrets stay in Vercel. This page reports presence and
                binding status only; values are never displayed.
              </span>
            </section>
            <p className="request-label">Launch index</p>
            <nav>
              {controls.map((control) => (
                <a href={`#${control.id.toLowerCase()}`} key={control.id}>
                  <span>{control.control}</span>
                  <small>{control.status}</small>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Launch controls</p>
                <h2>Production deployment readiness matrix</h2>
              </div>
              <strong>{controls.length} controls</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Deployment readiness controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Production home</th>
                    <th scope="col">Status</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {controls.map((control) => (
                    <tr id={control.id.toLowerCase()} key={control.id}>
                      <td>
                        <span>{control.id}</span>
                        <strong>{control.control}</strong>
                      </td>
                      <td>{control.productionHome}</td>
                      <td>
                        <mark
                          data-status={
                            control.status.includes("required") ||
                            control.status.includes("missing")
                              ? "Restricted"
                              : "Verified"
                          }
                        >
                          {control.status}
                        </mark>
                      </td>
                      <td>{control.authority}</td>
                      <td>{control.action}</td>
                      <td><a href="/staff/platform">Review</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <header className="console-panel-heading">
              <div>
                <p className="request-label">Secret register</p>
                <h2>Required runtime secret presence</h2>
              </div>
              <strong>{summary.requiredRuntimeSecretCount} required</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Required runtime secrets without secret values</caption>
                <thead>
                  <tr>
                    <th scope="col">Secret</th>
                    <th scope="col">Home</th>
                    <th scope="col">Status</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runtimeSecrets.map((secret) => (
                    <tr key={secret.name}>
                      <td>
                        <span>Runtime</span>
                        <strong>{secret.name}</strong>
                      </td>
                      <td>{secret.home}</td>
                      <td>
                        <mark data-status={secret.configured ? "Verified" : "Restricted"}>
                          {secret.configured ? "Reference present" : "Reference missing"}
                        </mark>
                      </td>
                      <td>{secret.purpose}</td>
                      <td>Admin or Super Admin</td>
                      <td><a href="/staff/integrations">Review</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Deployment command center</p>
            <h2>Launch hold</h2>
            <p className="activation-summary">
              Production launch should remain held until database binding,
              runtime secrets, and deployed callback replay are verified by an
              authorized Admin or Super Admin.
            </p>
            <dl>
              <div>
                <dt>Signed-in authority</dt>
                <dd>{role} · {user.displayName}</dd>
              </div>
              <div>
                <dt>Postgres database</dt>
                <dd>{summary.databaseConfigured ? "Configured" : "DATABASE_URL missing"}</dd>
              </div>
              <div>
                <dt>Notification webhook</dt>
                <dd>
                  {summary.missingRequiredRuntimeSecrets.includes(
                    "NOTARIX_NOTIFICATION_WEBHOOK_SECRET",
                  )
                    ? "NOTARIX_NOTIFICATION_WEBHOOK_SECRET required"
                    : "Notification callback secret present"}
                </dd>
              </div>
              <div>
                <dt>Production URL</dt>
                <dd>{summary.productionUrlConfigured ? "Configured" : "Required after deployment"}</dd>
              </div>
              <div>
                <dt>Replay command</dt>
                <dd>{summary.callbackReplayCommand}</dd>
              </div>
            </dl>
            <div className="decision-actions">
              <a href="/staff/provider-environment">Open Provider Environment</a>
              <a href="/staff/integrations">Open Integrations</a>
              <a href="/staff/system-health">Open System Health</a>
              <a href="/staff/platform">Open Platform Configuration</a>
            </div>
            <p className="decision-lock-note">
              The command-line readiness script remains the final deployment
              check before release. This page gives staff a safe operational
              view of the same production blockers without exposing credentials.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
