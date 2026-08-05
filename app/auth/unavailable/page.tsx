import { safeAuthReturnPath } from "../../portal-auth";

type AuthUnavailablePageProps = {
  searchParams: Promise<{ return_to?: string }>;
};

export default async function AuthUnavailablePage({ searchParams }: AuthUnavailablePageProps) {
  const { return_to: returnToParam } = await searchParams;
  const returnTo = safeAuthReturnPath(returnToParam ?? "/");

  return (
    <main className="signin-page">
      <section className="signin-panel" aria-label="Notarix authentication unavailable">
        <div className="signin-brand">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <p>Secure portal access</p>
        </div>
        <div className="signin-copy">
          <p className="kicker">Authentication unavailable</p>
          <h1>Portal sign-in is not configured</h1>
          <p>
            Notarix Signings requires its approved identity provider and a valid
            application session. Access remains closed until those controls are available.
          </p>
        </div>
        <div className="signin-actions">
          <a href={returnTo}>Return</a>
        </div>
      </section>
    </main>
  );
}
