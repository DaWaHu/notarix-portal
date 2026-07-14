import { headers } from "next/headers";
import {
  isLocalDevHost,
  localStaffPreviewPath,
  safeAuthReturnPath,
} from "../chatgpt-auth";

type SignInPageProps = {
  searchParams: Promise<{
    return_to?: string;
  }>;
};

const passkeyBenefits = [
  [
    "No shared staff passwords",
    "Passkeys reduce password reuse and phishing risk for protected staff workflows.",
  ],
  [
    "Works across approved devices",
    "Staff can use a device passkey after the production identity provider is connected.",
  ],
  [
    "Safer approval controls",
    "Sensitive actions such as profile activation and payable changes should require strong reauthentication.",
  ],
] as const;

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const requestHeaders = await headers();
  const isLocal = isLocalDevHost(requestHeaders.get("host"));
  const { return_to: returnToParam } = await searchParams;
  const returnTo = safeAuthReturnPath(returnToParam ?? "/staff/requests");
  const previewPath = localStaffPreviewPath(returnTo);

  return (
    <main className="signin-page">
      <section className="signin-panel" aria-label="Notarix staff sign in">
        <div className="signin-brand">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <p>Staff access</p>
        </div>
        <div className="signin-copy">
          <p className="kicker">Secure staff authentication</p>
          <h1>Continue with passkey protection</h1>
          <p>
            Notarix staff access should use strong authentication before review,
            approval, document, RON, or payable workflows are available.
          </p>
        </div>

        <div className="passkey-list" aria-label="Passkey benefits">
          {passkeyBenefits.map(([title, description]) => (
            <section key={title}>
              <span aria-hidden="true" />
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="signin-actions">
          {isLocal ? (
            <>
              <a href={previewPath}>Continue With Local Staff Preview</a>
              <a href={previewPath}>Continue Without Passkey</a>
            </>
          ) : (
            <>
              <button disabled type="button">
                Continue With Passkey
              </button>
              <a href="/">Return Home</a>
            </>
          )}
        </div>

        <p className="signin-note">
          Production passkey enrollment must be enforced through the identity
          provider with MFA, device controls, role-based access, and audit logs.
        </p>
      </section>
    </main>
  );
}
