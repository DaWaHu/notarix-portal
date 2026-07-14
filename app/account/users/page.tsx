import { authorizedUsers } from "../../operations-data";

export default function AccountUsersPage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Account Users</span>
        </a>
        <nav aria-label="Account user navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/notifications">Notifications</a>
          <a className="nav-cta" href="/account/users">Users</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Client Account Administration · Individual Access</p>
          <h1>Authorized Portal Users</h1>
          <p>
            Manage named account users, portal permissions, invitation status,
            MFA posture, and order-submission authority for the approved client profile.
          </p>
        </div>
        <aside>
          <p>Shared accounts</p>
          <strong>Prohibited</strong>
          <span>No shared logins. Every user must have an attributable identity.</span>
        </aside>
      </section>

      <section className="verification-layout" aria-label="Authorized users workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">User controls</p>
            <nav>
              {["Administrators", "Order Submitters", "Invitations", "MFA", "Permissions"].map((label) => (
                <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">User register</p>
                <h2>Client user access matrix</h2>
              </div>
              <strong>{authorizedUsers.length} users</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Authorized portal users</caption>
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Email</th>
                    <th scope="col">Status</th>
                    <th scope="col">Role</th>
                    <th scope="col">Permissions</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {authorizedUsers.map((user) => (
                    <tr key={user.email}>
                      <td><span>Named user</span><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><mark>{user.status}</mark></td>
                      <td>{user.role}</td>
                      <td>{user.permissions}</td>
                      <td><button type="button">Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Access controls</p>
            <h2>User policy</h2>
            <dl>
              <div><dt>MFA</dt><dd>Required for all portal users</dd></div>
              <div><dt>Order submitters</dt><dd>Client admin approval required</dd></div>
              <div><dt>Document access</dt><dd>Logged per user</dd></div>
              <div><dt>Billing access</dt><dd>Restricted</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
