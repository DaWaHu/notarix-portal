import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/", headers = {}) {
  return requestRoute(path, { headers });
}

async function requestRoute(path = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      ...init,
      headers: { accept: "text/html", ...(init.headers ?? {}) },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Notarix Signings brand composition", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);

  const html = await response.text();
  assert.match(html, /<title>Notarix Signings Portal<\/title>/i);
  assert.match(html, /Notarix Signings/);
  assert.match(html, /notarix-logo\.png/);
  assert.match(html, /notarix-hero-notarial-session\.png/);
  assert.match(html, /Notarial Services Made Simple/);
  assert.match(html, /Remote Online Notary/);
  assert.match(html, /Electronic Notary/);
  assert.match(html, /Request Portal Access/);
  assert.match(html, /Request Access/);
  assert.match(html, /href="\/portal"/);
  const landingAnchorHrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(
    ([, href]) => href,
  );
  assert.deepEqual(landingAnchorHrefs, ["/portal", "/portal", "/portal"]);
  assert.doesNotMatch(html, /href="#/);
  assert.doesNotMatch(html, /href="\/"/);
  assert.match(html, /Privacy Policy/);
  assert.match(html, /RON Disclosure/);
  assert.match(html, /Electronic Communications Consent/);
  assert.match(html, /aria-disabled="true" class="locked-link"/);
  assert.match(html, /© Copyright Notarix Signings 2026/);
  assert.doesNotMatch(html, /Estate Planning|Apostille Services|Translation/);
  assert.doesNotMatch(html, /RON Session|Dec 31 2026|6:00 PM ET/);
  assert.doesNotMatch(html, /NS<\/span><strong>Verified/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /Start Request/);
});

test("server-renders the portal access request workflow", async () => {
  const response = await render("/portal");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Notarix Signings Access Request/);
  assert.match(html, /Contact Received/);
  assert.match(html, /NSR intake review/);
  assert.match(html, /Access request process/);
  assert.match(html, /Contact form/);
  assert.match(html, /NSR created/);
  assert.match(html, /Profile invitation/);
  assert.match(html, /Staff verification/);
  assert.match(html, /support@notarix\.live/);
  assert.match(html, /action="mailto:support@notarix\.live"/);
  assert.match(html, /Submit onboarding information to Notarix staff/);
  assert.match(html, /555-123-4567/);
  assert.match(html, /\[0-9\]\{3\}-\[0-9\]\{3\}-\[0-9\]\{4\}/);
  assert.match(html, /Send Access Request/);
  assert.match(html, /Controlled intake/);
  assert.doesNotMatch(html, /Client Portal Access|Notary Portal Access/);
  assert.doesNotMatch(html, /Activation workflow|Pending Review/);
});

test("server-renders the staff access request queue", async () => {
  const lockedResponse = await render("/staff/requests");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/requests", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Portal access requests/);
  assert.match(html, /href="\/">Home<\/a>/);
  assert.match(html, /Logout/);
  assert.match(html, /Requests stay inactive until staff approval/);
  assert.match(html, /Review client and notary access requests/);
  assert.match(html, /Notarix Signings Request/);
  assert.match(html, /NSR-1001/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001"/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001\/profile-verification"/);
  assert.match(html, /href="\/staff\/financial-controls"/);
  assert.doesNotMatch(html, /NAR-/);
  assert.match(html, /Pending Review/);
  assert.match(html, /Profile Completion Pending/);
  assert.match(html, /Credential Verification/);
  assert.match(html, /555-123-4567/);
  assert.match(html, /Open Review/);
  assert.match(html, /Send Invitation/);
  assert.match(html, /Notarix Signings Staff Workspace/);
  assert.match(html, /Authorized staff use only/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("server-renders the passkey-ready sign-in screen", async () => {
  const response = await render(
    "/signin-with-chatgpt?return_to=/staff/requests",
    { host: "localhost:3000" },
  );
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Continue with passkey protection/);
  assert.match(html, /No shared staff passwords/);
  assert.match(html, /Works across approved devices/);
  assert.match(html, /Safer approval controls/);
  assert.match(html, /Continue With Local Staff Preview/);
  assert.match(html, /Continue Without Passkey/);
  assert.match(html, /Production passkey enrollment must be enforced/);
});

test("server-renders the protected staff review detail workflow", async () => {
  const lockedResponse = await render("/staff/requests/NSR-1001");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/requests/NSR-1001", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Staff review record/);
  assert.match(html, /NSR-1001/);
  assert.match(html, /Current status/);
  assert.match(html, /Pending Review/);
  assert.match(html, /Request summary/);
  assert.match(html, /Eligibility review/);
  assert.match(html, /Credential review/);
  assert.match(html, /Activation requirements/);
  assert.match(html, /Open Profile Verification/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001\/profile-verification"/);
  assert.match(html, /Send Profile Invitation/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001\/invitation"/);
  assert.match(html, /Place On Hold/);
  assert.match(html, /Audit intelligence/);
  assert.match(html, /Jul 10 2026 at 9:12 AM ET/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("server-renders the protected staff profile verification workspace", async () => {
  const lockedResponse = await render("/staff/requests/NSR-1001/profile-verification");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/requests/NSR-1001/profile-verification", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Staff Verification Console/);
  assert.match(html, /Notary Profile Verification/);
  assert.match(html, /NSR-1001/);
  assert.match(html, /Bernadette W Hudlin/);
  assert.match(html, /8<!-- --> items unresolved/);
  assert.match(html, /Logout/);
  assert.match(html, /Operational hold/);
  assert.match(html, /Activation prohibited/);
  assert.match(html, /Activation control center/);
  assert.match(html, /Required items remaining/);
  assert.match(html, /Submitted profile/);
  assert.match(html, /Secure Staff Operations/);
  assert.match(html, /Executive verification matrix/);
  assert.match(html, /Profile verification requirements/);
  assert.match(html, /Requirement/);
  assert.match(html, /Evidence/);
  assert.match(html, /Assigned reviewer/);
  assert.match(html, /Last updated/);
  assert.match(html, /Action/);
  assert.match(html, /href="#overview"/);
  assert.match(html, /href="#contact-and-addresses"/);
  assert.match(html, /href="#identity"/);
  assert.match(html, /href="#commission"/);
  assert.match(html, /href="#eo-insurance"/);
  assert.match(html, /href="#background-check"/);
  assert.match(html, /href="#nna-certification"/);
  assert.match(html, /href="#ron-authorization"/);
  assert.match(html, /href="#w-9-payables"/);
  assert.match(html, /href="#staff-decision"/);
  assert.doesNotMatch(html, /aria-label="Overview: Verified"/);
  assert.match(html, /numbering follows actual activation order/);
  assert.match(html, /NSN-NC-2607-0001/);
  assert.match(html, /Case file index/);
  assert.match(html, /Submitted profile dossier/);
  assert.match(html, /Identity, contact, address, and service record/);
  assert.match(html, /Legal name/);
  assert.match(html, /Company \/ DBA/);
  assert.match(html, /DaWaHu Collective, LLC/);
  assert.match(html, /Residence address/);
  assert.match(html, /1428 Glenwood Avenue, Raleigh, NC 27605/);
  assert.match(html, /Mailing address/);
  assert.match(html, /PO Box 1842, Raleigh, NC 27602/);
  assert.match(html, /Phone numbers/);
  assert.match(html, /555-123-4567 mobile/);
  assert.match(html, /555-234-7890 work/);
  assert.match(html, /Service area/);
  assert.match(html, /Wake, Durham, Orange, and Johnston counties/);
  assert.match(html, /Emergency contact/);
  assert.match(html, /Morgan Ellis/);
  assert.match(html, /Address control/);
  assert.match(html, /Case file/);
  assert.match(html, /Profile type/);
  assert.match(html, /Jurisdiction/);
  assert.match(html, /aria-label="Overview: Console summary"/);
  assert.match(html, /aria-label="Contact &amp; Addresses: Needs review"/);
  assert.match(html, /aria-label="RON Authorization: Restricted"/);
  assert.match(html, /aria-label="Staff Decision: Elevated approval"/);
  assert.match(html, /Access controls/);
  assert.match(html, /Platform safeguards applied to this staff review/);
  assert.match(html, /MFA\/passkey required/);
  assert.match(html, /Staff role level: General Admin/);
  assert.match(html, /Audit tracking enabled/);
  assert.match(html, /Financial changes restricted/);
  assert.match(html, /RON restricted until verified/);
  assert.match(html, /Evidence access logged/);
  assert.match(html, /Audit report restricted to Super Admin/);
  assert.match(html, /Payable eligibility status/);
  assert.match(html, /Background check/);
  assert.match(html, /National Notary Association report preferred/);
  assert.match(html, /E&amp;O insurance/);
  assert.match(html, /W-9 form/);
  assert.match(html, /completed-w-9-form\.pdf/);
  assert.match(html, /nna-signing-agent-certificate\.pdf/);
  assert.match(html, /Evidence packet/);
  assert.match(html, /2<!-- --> evidence<!-- --> <!-- -->files/);
  assert.match(html, /identity-document-analysis-report\.pdf/);
  assert.match(html, /camera-based-liveness-result\.json/);
  assert.match(html, /Open Evidence/);
  assert.match(html, /href="\/evidence\/IDENTITY-DOCUMENT-ANALYSIS-REPORT"/);
  assert.match(html, /href="\/evidence\/CAMERA-BASED-LIVENESS-RESULT"/);
  assert.match(html, /Provider Result/);
  assert.match(html, /Restricted staff view/);
  assert.match(html, /Identity proofing provider record/);
  assert.match(html, /camera-based liveness check/);
  assert.match(html, /Remote online notary authorization/);
  assert.match(html, /RON eligibility status/);
  assert.match(html, /Restricted until verified/);
  assert.match(html, /Evidence review command/);
  assert.match(html, /Staff identity and audit note/);
  assert.match(html, /Mark Verified/);
  assert.match(html, /Request Correction/);
  assert.match(html, /Escalate/);
  assert.match(html, /Two-step approval/);
  assert.match(html, /General Admin verification/);
  assert.match(html, /Administrator or Super Admin approval/);
  assert.match(html, /Notification recipients/);
  assert.match(html, /Super Admin and Administrator/);
  assert.match(html, /GenAdmin Verification Incomplete/);
  assert.match(html, /Audit report access/);
  assert.match(html, /Restricted to Super Admin report workspace/);
  assert.match(html, /Workflow status path/);
  assert.match(html, /Contact Received/);
  assert.match(html, /NSR Created/);
  assert.match(html, /Profile Invitation Sent/);
  assert.match(html, /Profile Submitted/);
  assert.match(html, /Ready for Elevated Approval/);
  assert.match(html, /Admin\/Super Admin Review/);
  assert.match(html, /Final activation checklist/);
  assert.match(html, /Email approval notification/);
  assert.match(html, /Phone or SMS approval notification with consent/);
  assert.doesNotMatch(html, /GenAdmin activity trail/);
  assert.match(html, /Approval Locked/);
  assert.match(html, /verification items remain unresolved/);
  assert.doesNotMatch(
    html,
    /href="\/staff\/requests\/NSR-1001\/profile-verification\/decision\/approve"/,
  );
  assert.match(html, /Request Corrections/);
  assert.match(html, /Keep Inactive/);
  assert.match(
    html,
    /href="\/staff\/requests\/NSR-1001\/profile-verification\/decision\/corrections"/,
  );
  assert.match(
    html,
    /href="\/staff\/requests\/NSR-1001\/profile-verification\/decision\/inactive"/,
  );
  assert.match(html, /Approving authority/);
  assert.match(html, /Administrator or Super Admin required/);
  assert.match(html, /Separate Super Admin report required before final approval/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("server-renders the protected client profile verification workspace", async () => {
  const lockedResponse = await render("/staff/requests/NSR-1002/profile-verification");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/requests/NSR-1002/profile-verification", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Client Profile Verification/);
  assert.match(html, /NSR-1002/);
  assert.match(html, /Coleman Title Group/);
  assert.match(html, /organization authority, billing readiness, user access, document controls/);
  assert.match(html, /Client authority/);
  assert.match(html, /Order access/);
  assert.match(html, /Billing authority/);
  assert.match(html, /Client authority and activation matrix/);
  assert.match(html, /Client identity, authority, billing, and order record/);
  assert.match(html, /Legal entity/);
  assert.match(html, /Client type/);
  assert.match(html, /Authorized representative/);
  assert.match(html, /Business address/);
  assert.match(html, /Billing mailing address/);
  assert.match(html, /Authorized email domain/);
  assert.match(html, /Requested services/);
  assert.match(html, /Organization/);
  assert.match(html, /Business identity/);
  assert.match(html, /Authority/);
  assert.match(html, /Authorized representative/);
  assert.match(html, /Contact/);
  assert.match(html, /Client contact record/);
  assert.match(html, /Billing and payment setup/);
  assert.match(html, /Authorized portal users/);
  assert.match(html, /Document handling rules/);
  assert.match(html, /Order submission authority/);
  assert.match(html, /Risk and compliance review/);
  assert.match(html, /client-billing-authorization\.pdf/);
  assert.match(html, /authorized-user-roster\.csv/);
  assert.match(html, /client-order-permission-request\.pdf/);
  assert.match(html, /Order eligibility status/);
  assert.match(html, /Billing eligibility status/);
  assert.match(html, /Assigned(?:<!-- -->|\s)*NSC/);
  assert.match(html, /NSC-NC-2607-0001/);
  assert.match(html, /Order permissions restricted until approved/);
  assert.match(html, /Document access limited to authorized users/);
  assert.match(html, /Super Admin and Administrator/);
  assert.match(html, /GenAdmin Verification Incomplete/);
  assert.match(html, /Final activation checklist/);
  assert.doesNotMatch(html, /NNA certification/);
  assert.doesNotMatch(html, /Notary commission/);
  assert.doesNotMatch(html, /RON authority/);
  assert.doesNotMatch(html, /Assigned NSN/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("restricts the profile verification audit report to SuperAdmin role", async () => {
  const genAdminResponse = await render(
    "/staff/requests/NSR-1001/profile-verification/audit-report",
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(genAdminResponse.status, 404);

  const superAdminResponse = await render(
    "/staff/requests/NSR-1001/profile-verification/audit-report",
    {
      "oai-authenticated-user-email": "superadmin@example.com",
      "x-notarix-staff-role": "SuperAdmin",
    },
  );
  assert.equal(superAdminResponse.status, 200);

  const html = await superAdminResponse.text();
  assert.match(html, /Super Admin Report/);
  assert.match(html, /Profile Verification Audit Report/);
  assert.match(html, /Super Admin only/);
  assert.match(html, /Two-step approval evidence/);
  assert.match(html, /General Admin verification/);
  assert.match(html, /Administrator or Super Admin approval/);
  assert.match(html, /GenAdmin activity trail/);
  assert.match(html, /GenAdmin001/);
  assert.match(html, /GenAdmin004/);
});

test("server-renders protected staff activation decision screens", async () => {
  const lockedResponse = await render(
    "/staff/requests/NSR-1001/profile-verification/decision/approve",
  );
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render(
    "/staff/requests/NSR-1001/profile-verification/decision/approve",
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Activation decision review/);
  assert.match(html, /Approval blocked/);
  assert.match(html, /Profile cannot be approved yet/);
  assert.match(html, /stored verification records still contain/);
  assert.match(html, /must be generated at activation, not reserved before approval/);
  assert.match(html, /NSN-NC-2607-0001/);
  assert.match(html, /Notarix Signing Notary Number/);
  assert.match(html, /Not reserved before activation/);
  assert.match(html, /numbering follows actual activation order/);
  assert.match(html, /Internal audit report/);
  assert.match(html, /Approval accountability/);
  assert.match(html, /Approving staff identifier/);
  assert.match(html, /General Admin verification completion/);
  assert.match(html, /Email approval notice delivery log/);
  assert.match(html, /Phone or SMS approval notice consent and delivery log/);
  assert.match(html, /GenAdmin001/);
  assert.match(html, /GenAdmin005/);
  assert.match(html, /Open review items/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);

  const correctionsResponse = await render(
    "/staff/requests/NSR-1001/profile-verification/decision/corrections",
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(correctionsResponse.status, 200);
  const correctionsHtml = await correctionsResponse.text();
  assert.match(correctionsHtml, /Request Corrections/);
  assert.match(correctionsHtml, /Return profile for correction/);
  assert.match(correctionsHtml, /Correction request issued/);

  const inactiveResponse = await render(
    "/staff/requests/NSR-1001/profile-verification/decision/inactive",
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(inactiveResponse.status, 200);
  const inactiveHtml = await inactiveResponse.text();
  assert.match(inactiveHtml, /Keep Inactive/);
  assert.match(inactiveHtml, /Maintain inactive access/);
  assert.match(inactiveHtml, /No notary assignment eligibility is granted while inactive/);
});

test("server-renders the protected staff profile invitation workflow", async () => {
  const lockedResponse = await render("/staff/requests/NSR-1001/invitation");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/requests/NSR-1001/invitation", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Profile invitation preparation/);
  assert.match(html, /NSR-1001/);
  assert.match(html, /Notary Portal Profile/);
  assert.match(html, /Complete your Notarix Signings profile/);
  assert.match(html, /href="\/profile\/complete\/NSR-1001"/);
  assert.match(html, /Preview Profile Completion Page/);
  assert.match(html, /Jul 18 2026 at 5:00 PM ET/);
  assert.match(html, /Profile Invitation Sent/);
  assert.match(html, /Single recipient, staff-issued, audit logged/);
  assert.match(html, /Required profile sections/);
  assert.match(html, /Commission profile and primary jurisdiction/);
  assert.match(html, /Staff receives profile-completion notification/);
  assert.match(html, /Submitted profile moves to GenAdmin Verification/);
  assert.match(html, /Correction requests reopen only the flagged profile sections/);
  assert.match(html, /Administrator or Super Admin final approval/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("server-renders invited profile completion pages", async () => {
  const notaryResponse = await render("/profile/complete/NSR-1001");
  assert.equal(notaryResponse.status, 200);
  const notaryHtml = await notaryResponse.text();
  assert.match(notaryHtml, /Complete your notary profile/);
  assert.match(notaryHtml, /DaWaHu Collective, LLC/);
  assert.match(notaryHtml, /Profile Completion Pending/);
  assert.match(notaryHtml, /Commission Expiration Date/);
  assert.match(notaryHtml, /Remote online notary authorization/);
  assert.match(notaryHtml, /Approved by state/);
  assert.match(notaryHtml, /Notary profile sections/);
  assert.match(notaryHtml, /href="#background-check"/);
  assert.match(notaryHtml, /href="#eo-insurance"/);
  assert.match(notaryHtml, /href="#payment-ledger"/);
  assert.match(notaryHtml, /Address and company information/);
  assert.match(notaryHtml, /Company name/);
  assert.match(notaryHtml, /Website/);
  assert.match(notaryHtml, /Address Line 1/);
  assert.match(notaryHtml, /Payment Address is the same as primary address/);
  assert.match(notaryHtml, /Home Phone/);
  assert.match(notaryHtml, /Mobile Phone/);
  assert.match(notaryHtml, /Mobile phone verified/);
  assert.match(notaryHtml, /Work Phone/);
  assert.match(notaryHtml, /Emergency Contact Name/);
  assert.match(notaryHtml, /Payable setup/);
  assert.match(notaryHtml, /VendorPay-style provider/);
  assert.match(notaryHtml, /Credential completion overview/);
  assert.match(notaryHtml, /W-9 Form/);
  assert.match(notaryHtml, /Completed W-9 Form/);
  assert.match(notaryHtml, /Background check/);
  assert.match(notaryHtml, /Background Check Provider/);
  assert.match(notaryHtml, /Background Check Report Date/);
  assert.match(notaryHtml, /Background Check Report/);
  assert.match(notaryHtml, /E&amp;O insurance/);
  assert.match(notaryHtml, /E&amp;O Policy Number/);
  assert.match(notaryHtml, /E&amp;O Insurance Declaration Page/);
  assert.match(notaryHtml, /ID Number/);
  assert.match(notaryHtml, /Verification Type/);
  assert.match(notaryHtml, /Identity Proofing Provider/);
  assert.match(notaryHtml, /Liveness \/ Selfie Result/);
  assert.match(notaryHtml, /Identity proofing provider with selfie and liveness check/);
  assert.match(notaryHtml, /Attach provider result showing document analysis/);
  assert.match(notaryHtml, /NNA Profile Certificate Link/);
  assert.match(notaryHtml, /NNA Exam Date/);
  assert.match(notaryHtml, /Commission Number/);
  assert.match(notaryHtml, /Proof of RON Training Certificate Date/);
  assert.match(notaryHtml, /RON Digital Certificate Provider/);
  assert.match(notaryHtml, /First reminder at 90 days before expiration/);
  assert.match(notaryHtml, /Weekly reminders beginning 30 days before expiration/);
  assert.match(notaryHtml, /Assigned orders/);
  assert.match(notaryHtml, /Administrator or Super Admin only/);
  assert.match(notaryHtml, /General Admin users may review status/);
  assert.match(notaryHtml, /Selecting submit moves this profile to GenAdmin Verification/);
  assert.match(notaryHtml, /locked for staff review/);
  assert.match(notaryHtml, /Approval notification consent/);
  assert.match(notaryHtml, /Profile Submitted/);
  assert.match(notaryHtml, /Administrator or Super Admin final approval/);
  assert.match(notaryHtml, /Dec 31 2026/);
  assert.match(notaryHtml, /555-123-4567/);
  assert.doesNotMatch(notaryHtml, /prototype screen/);
  assert.doesNotMatch(notaryHtml, /\b\d{10,11}\b/);

  const clientResponse = await render("/profile/complete/NSR-1002");
  assert.equal(clientResponse.status, 200);
  const clientHtml = await clientResponse.text();
  assert.match(clientHtml, /Complete your client profile/);
  assert.match(clientHtml, /Coleman Title Group/);
  assert.match(clientHtml, /Client type/);
  assert.match(clientHtml, /Client relationship/);
  assert.match(clientHtml, /Organization authority/);
  assert.match(clientHtml, /Legal entity or customer name/);
  assert.match(clientHtml, /DBA or office name/);
  assert.match(clientHtml, /Authorized representative/);
  assert.match(clientHtml, /Representative title/);
  assert.match(clientHtml, /Authority or business verification/);
  assert.match(clientHtml, /Client addresses and phone numbers/);
  assert.match(clientHtml, /Business Address/);
  assert.match(clientHtml, /Mailing Address/);
  assert.match(clientHtml, /Office Phone/);
  assert.match(clientHtml, /Billing Phone/);
  assert.match(clientHtml, /Billing and payment authorization/);
  assert.match(clientHtml, /Billing contact email/);
  assert.match(clientHtml, /Payment preference/);
  assert.match(clientHtml, /Billing authorization/);
  assert.match(clientHtml, /Authorized portal users/);
  assert.match(clientHtml, /Authorized users/);
  assert.match(clientHtml, /Approved email domain/);
  assert.match(clientHtml, /Authorized user roster/);
  assert.match(clientHtml, /Document handling rules/);
  assert.match(clientHtml, /Document delivery instructions/);
  assert.match(clientHtml, /Requested service access/);
  assert.match(clientHtml, /Remote online notarization/);
  assert.match(clientHtml, /Loan signing appointments/);
  assert.match(clientHtml, /Selecting submit moves this profile to GenAdmin Verification/);
  assert.match(clientHtml, /Approval notification consent/);
  assert.match(clientHtml, /Profile Submitted/);
  assert.match(clientHtml, /555-234-6789/);
  assert.doesNotMatch(clientHtml, /\b\d{10,11}\b/);
});

test("server-renders elevated approval and post-verification profile routes", async () => {
  const queueLocked = await render("/staff/elevated-approval");
  assert.equal(queueLocked.status, 307);

  const queueResponse = await render("/staff/elevated-approval", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(queueResponse.status, 200);
  const queueHtml = await queueResponse.text();
  assert.match(queueHtml, /Elevated Approval Queue/);
  assert.match(queueHtml, /NSR-1004/);
  assert.match(queueHtml, /Grant &amp; Ledger Law PLLC/);
  assert.match(queueHtml, /Final approval requires elevated authority/);
  assert.match(queueHtml, /href="\/staff\/elevated-approval\/NSR-1004"/);

  const approvalResponse = await render("/staff/elevated-approval/NSR-1004", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(approvalResponse.status, 200);
  const approvalHtml = await approvalResponse.text();
  assert.match(approvalHtml, /Final Approval Review/);
  assert.match(approvalHtml, /Grant Final Approval/);
  assert.match(approvalHtml, /Generated at approval/);
  assert.match(approvalHtml, /NSC-NC-2607-0001/);
  assert.match(approvalHtml, /Administrator or Super Admin/);

  const correctionResponse = await render("/profile/corrections/NSR-1001");
  assert.equal(correctionResponse.status, 200);
  const correctionHtml = await correctionResponse.text();
  assert.match(correctionHtml, /Profile Correction Response/);
  assert.match(correctionHtml, /Returned profile sections/);
  assert.match(correctionHtml, /Resubmit Corrections/);

  const activeResponse = await render("/profile/active/NSR-1002");
  assert.equal(activeResponse.status, 200);
  const activeHtml = await activeResponse.text();
  assert.match(activeHtml, /Profile Activation Complete/);
  assert.match(activeHtml, /NSC-NC-2607-0001/);
  assert.match(activeHtml, /Open Dashboard/);
  assert.match(activeHtml, /Your Notarix Signings account is active/);
});

test("server-renders role-based portal landing pages", async () => {
  const staffLocked = await render("/staff");
  assert.equal(staffLocked.status, 307);
  assert.match(staffLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const genAdminResponse = await render("/staff", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(genAdminResponse.status, 200);
  const genAdminHtml = await genAdminResponse.text();
  assert.match(genAdminHtml, /GenAdmin Operations Home/);
  assert.match(genAdminHtml, /Role-Based Portal Routing/);
  assert.match(genAdminHtml, /Final approval, financial activation, and restricted audit reports are unavailable/);
  assert.match(genAdminHtml, /Profile Verification/);
  assert.match(genAdminHtml, /Order Operations/);
  assert.match(genAdminHtml, /Order Intake/);
  assert.match(genAdminHtml, /Signer Readiness/);
  assert.match(genAdminHtml, /Appointments/);
  assert.match(genAdminHtml, /Order Closeout/);
  assert.match(genAdminHtml, /Evidence Intake/);
  assert.match(genAdminHtml, /Document Validation/);
  assert.match(genAdminHtml, /Retention/);
  assert.match(genAdminHtml, /href="\/staff\/requests\/NSR-1001\/profile-verification"/);
  assert.match(genAdminHtml, /href="\/staff\/orders"/);
  assert.match(genAdminHtml, /href="\/staff\/order-intake"/);
  assert.match(genAdminHtml, /href="\/staff\/signers"/);
  assert.match(genAdminHtml, /href="\/staff\/appointments"/);
  assert.match(genAdminHtml, /href="\/staff\/order-closeout"/);
  assert.match(genAdminHtml, /href="\/staff\/evidence-intake"/);
  assert.match(genAdminHtml, /href="\/staff\/document-validation"/);
  assert.match(genAdminHtml, /href="\/notifications"/);
  assert.match(genAdminHtml, /href="\/credentials\/expiration"/);
  assert.match(genAdminHtml, /Production role routing should be enforced/);

  const adminResponse = await render("/staff", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(adminResponse.status, 200);
  const adminHtml = await adminResponse.text();
  assert.match(adminHtml, /Admin Operations Home/);
  assert.match(adminHtml, /Elevated Approval/);
  assert.match(adminHtml, /Order Operations/);
  assert.match(adminHtml, /Order Intake/);
  assert.match(adminHtml, /Signer Readiness/);
  assert.match(adminHtml, /Appointments/);
  assert.match(adminHtml, /Order Closeout/);
  assert.match(adminHtml, /Financial Reports/);
  assert.match(adminHtml, /Command Activity/);
  assert.match(adminHtml, /Evidence Intake/);
  assert.match(adminHtml, /Document Validation/);
  assert.match(adminHtml, /Retention/);
  assert.match(adminHtml, /Platform Configuration/);
  assert.match(adminHtml, /System Health/);
  assert.match(adminHtml, /Access Control/);
  assert.match(adminHtml, /Integrations/);
  assert.match(adminHtml, /Super Admin audit retention holds and ledger correction overrides remain restricted/);
  assert.match(adminHtml, /href="\/staff\/financial-reports"/);
  assert.match(adminHtml, /href="\/staff\/platform"/);
  assert.match(adminHtml, /href="\/staff\/command-center\/activity"/);

  const superAdminResponse = await render("/staff", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(superAdminResponse.status, 200);
  const superAdminHtml = await superAdminResponse.text();
  assert.match(superAdminHtml, /Super Admin Operations Home/);
  assert.match(superAdminHtml, /Audit Reporting/);
  assert.match(superAdminHtml, /Order Operations/);
  assert.match(superAdminHtml, /Order Intake/);
  assert.match(superAdminHtml, /Signer Readiness/);
  assert.match(superAdminHtml, /Appointments/);
  assert.match(superAdminHtml, /Order Closeout/);
  assert.match(superAdminHtml, /Command Activity/);
  assert.match(superAdminHtml, /Evidence Intake/);
  assert.match(superAdminHtml, /Document Validation/);
  assert.match(superAdminHtml, /Retention/);
  assert.match(superAdminHtml, /Platform Configuration/);
  assert.match(superAdminHtml, /System Health/);
  assert.match(superAdminHtml, /Access Control/);
  assert.match(superAdminHtml, /Integrations/);
  assert.match(superAdminHtml, /Restricted Evidence/);
  assert.match(superAdminHtml, /href="\/staff\/audit-reports"/);
  assert.match(superAdminHtml, /href="\/staff\/platform"/);
  assert.match(superAdminHtml, /href="\/staff\/command-center\/activity"/);
  assert.match(superAdminHtml, /All restricted controls are visible here/);

  const clientResponse = await render("/client");
  assert.equal(clientResponse.status, 200);
  const clientHtml = await clientResponse.text();
  assert.match(clientHtml, /Client Portal Home/);
  assert.match(clientHtml, /Role-Based Portal Home/);
  assert.match(clientHtml, /NSC-NC-2607-0001/);
  assert.match(clientHtml, /Client routing matrix/);
  assert.match(clientHtml, /Authorized Users/);
  assert.match(clientHtml, /Billing status/);
  assert.match(clientHtml, /Delivery Receipt/);
  assert.match(clientHtml, /href="\/client\/dashboard"/);
  assert.match(clientHtml, /href="\/client\/orders"/);
  assert.match(clientHtml, /href="\/client\/orders\/ORD-2607-0001\/completion"/);
  assert.match(clientHtml, /href="\/orders\/new"/);
  assert.match(clientHtml, /href="\/account\/users"/);

  const notaryResponse = await render("/notary");
  assert.equal(notaryResponse.status, 200);
  const notaryHtml = await notaryResponse.text();
  assert.match(notaryHtml, /Notary Portal Home/);
  assert.match(notaryHtml, /NSN-NC-2607-0001/);
  assert.match(notaryHtml, /Notary routing matrix/);
  assert.match(notaryHtml, /Assignments/);
  assert.match(notaryHtml, /Completion Package/);
  assert.match(notaryHtml, /Payables/);
  assert.match(notaryHtml, /RON eligibility/);
  assert.match(notaryHtml, /href="\/notary\/dashboard"/);
  assert.match(notaryHtml, /href="\/notary\/assignments"/);
  assert.match(notaryHtml, /href="\/notary\/assignments\/ORD-2607-0001\/completion"/);
  assert.match(notaryHtml, /href="\/credentials\/expiration"/);
  assert.doesNotMatch(notaryHtml, /\b\d{10,11}\b/);
});

test("server-renders permanent portal operation pages", async () => {
  const clientResponse = await render("/client/dashboard");
  assert.equal(clientResponse.status, 200);
  const clientHtml = await clientResponse.text();
  assert.match(clientHtml, /Client Operations Dashboard/);
  assert.match(clientHtml, /ORD-2607-0001/);
  assert.match(clientHtml, /Authorized users/);
  assert.match(clientHtml, /Document upload/);
  assert.match(clientHtml, /Delivery Receipt/);

  const clientOrdersResponse = await render("/client/orders");
  assert.equal(clientOrdersResponse.status, 200);
  const clientOrdersHtml = await clientOrdersResponse.text();
  assert.match(clientOrdersHtml, /Client Order Management Console/);
  assert.match(clientOrdersHtml, /Coleman Title Group/);
  assert.match(clientOrdersHtml, /ORD-2607-0001/);
  assert.match(clientOrdersHtml, /Order progress and document matrix/);
  assert.match(clientOrdersHtml, /Invoice Pending/);
  assert.match(clientOrdersHtml, /Submit Order Documents/);
  assert.match(clientOrdersHtml, /Submit Replacement Documents/);
  assert.match(clientOrdersHtml, /Acknowledge Correction Notice/);
  assert.match(clientOrdersHtml, /Upload Documents/);
  assert.match(clientOrdersHtml, /Delivery Receipt/);
  assert.match(clientOrdersHtml, /href="\/client\/orders\/ORD-2607-0001\/completion"/);

  const clientCompletionResponse = await render("/client/orders/ORD-2607-0001/completion");
  assert.equal(clientCompletionResponse.status, 200);
  const clientCompletionHtml = await clientCompletionResponse.text();
  assert.match(clientCompletionHtml, /Order Delivery Receipt/);
  assert.match(clientCompletionHtml, /Delivery receipt and completion matrix/);
  assert.match(clientCompletionHtml, /Completion package/);
  assert.match(clientCompletionHtml, /Delivered documents/);
  assert.match(clientCompletionHtml, /Invoice posture/);
  assert.match(clientCompletionHtml, /Communication receipt/);
  assert.match(clientCompletionHtml, /Final order receipt/);
  assert.match(clientCompletionHtml, /Client-visible document register/);
  assert.match(clientCompletionHtml, /seller-closing-package\.pdf/);
  assert.match(clientCompletionHtml, /Final receipt available after staff closeout/);
  assert.doesNotMatch(clientCompletionHtml, /borrower-identification-copy\.pdf/);
  assert.match(clientCompletionHtml, /Return To Orders/);

  const notaryResponse = await render("/notary/dashboard");
  assert.equal(notaryResponse.status, 200);
  const notaryHtml = await notaryResponse.text();
  assert.match(notaryHtml, /Notary Operations Dashboard/);
  assert.match(notaryHtml, /NSN-NC-2607-0001/);
  assert.match(notaryHtml, /Credential monitor/);
  assert.match(notaryHtml, /Completion Package/);

  const assignmentResponse = await render("/notary/assignments");
  assert.equal(assignmentResponse.status, 200);
  const assignmentHtml = await assignmentResponse.text();
  assert.match(assignmentHtml, /Notary Assignment Console/);
  assert.match(assignmentHtml, /Bernadette W Hudlin/);
  assert.match(assignmentHtml, /Assignment readiness matrix/);
  assert.match(assignmentHtml, /ORD-2607-0001/);
  assert.match(assignmentHtml, /ORD-2607-0003/);
  assert.match(assignmentHtml, /Accept Assignment/);
  assert.match(assignmentHtml, /Decline Assignment/);
  assert.match(assignmentHtml, /Confirm Arrival/);
  assert.match(assignmentHtml, /Upload Completion Package/);
  assert.match(assignmentHtml, /Open Completion Package/);
  assert.match(assignmentHtml, /href="\/notary\/assignments\/ORD-2607-0001\/completion"/);
  assert.match(assignmentHtml, /Review Credentials/);

  const notaryCompletionResponse = await render("/notary/assignments/ORD-2607-0001/completion");
  assert.equal(notaryCompletionResponse.status, 200);
  const notaryCompletionHtml = await notaryCompletionResponse.text();
  assert.match(notaryCompletionHtml, /Completion Package And Payable Status/);
  assert.match(notaryCompletionHtml, /Completion package and payable matrix/);
  assert.match(notaryCompletionHtml, /Assignment acceptance/);
  assert.match(notaryCompletionHtml, /Appointment attendance/);
  assert.match(notaryCompletionHtml, /Completion package upload/);
  assert.match(notaryCompletionHtml, /Credential impact/);
  assert.match(notaryCompletionHtml, /Payable status/);
  assert.match(notaryCompletionHtml, /Notary-accessible document register/);
  assert.match(notaryCompletionHtml, /Upload Completion Package/);
  assert.match(notaryCompletionHtml, /Notary completion receipts do not approve payment/);
  assert.doesNotMatch(notaryCompletionHtml, /Client invoice release/);

  const newOrderResponse = await render("/orders/new");
  assert.equal(newOrderResponse.status, 200);
  const newOrderHtml = await newOrderResponse.text();
  assert.match(newOrderHtml, /Create Notarial Order/);
  assert.match(newOrderHtml, /Submit Order Request/);
  assert.match(newOrderHtml, /Document access logged/);

  const orderResponse = await render("/orders/ORD-2607-0001");
  assert.equal(orderResponse.status, 200);
  const orderHtml = await orderResponse.text();
  assert.match(orderHtml, /Order Case File/);
  assert.match(orderHtml, /Central System Record/);
  assert.match(orderHtml, /Service, parties, lifecycle, and closeout record/);
  assert.match(orderHtml, /Order lifecycle and authority matrix/);
  assert.match(orderHtml, /Closeout checklist and release controls/);
  assert.match(orderHtml, /Confirm Notary Acceptance/);
  assert.match(orderHtml, /Confirm Appointment/);
  assert.match(orderHtml, /Record Completion Package/);
  assert.match(orderHtml, /Close Order/);
  assert.match(orderHtml, /href="\/staff\/order-intake"/);
  assert.match(orderHtml, /href="\/staff\/signers"/);
  assert.match(orderHtml, /href="\/staff\/appointments"/);
  assert.match(orderHtml, /href="\/staff\/order-closeout"/);
  assert.match(orderHtml, /Open Intake Queue/);
  assert.match(orderHtml, /Open Signer Readiness/);
  assert.match(orderHtml, /Open Appointments/);
  assert.match(orderHtml, /Open Closeout Console/);
  assert.match(orderHtml, /seller-closing-package\.pdf/);
  assert.match(orderHtml, /href="\/staff\/orders\/ORD-2607-0001\/assignment"/);
  assert.match(orderHtml, /href="\/evidence\/DOC-2607-0001"/);

  const staffOrdersLocked = await render("/staff/orders");
  assert.equal(staffOrdersLocked.status, 307);
  assert.match(staffOrdersLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const staffOrdersResponse = await render("/staff/orders", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(staffOrdersResponse.status, 200);
  const staffOrdersHtml = await staffOrdersResponse.text();
  assert.match(staffOrdersHtml, /Order Operations Command Center/);
  assert.match(staffOrdersHtml, /Operational control matrix/);
  assert.match(staffOrdersHtml, /ORD-2607-0001/);
  assert.match(staffOrdersHtml, /ORD-2607-0002/);
  assert.match(staffOrdersHtml, /Queue Notary Assignment/);
  assert.match(staffOrdersHtml, /Release Validated Documents/);
  assert.match(staffOrdersHtml, /Request Missing Documents/);
  assert.match(staffOrdersHtml, /Route Financial Review/);
  assert.match(staffOrdersHtml, /Open Signer Readiness/);
  assert.match(staffOrdersHtml, /Open Appointments/);
  assert.match(staffOrdersHtml, /Open Closeout Console/);

  const orderIntakeLocked = await render("/staff/order-intake");
  assert.equal(orderIntakeLocked.status, 307);
  assert.match(orderIntakeLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const orderIntakeResponse = await render("/staff/order-intake", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(orderIntakeResponse.status, 200);
  const orderIntakeHtml = await orderIntakeResponse.text();
  assert.match(orderIntakeHtml, /Order Lifecycle Intake Queue/);
  assert.match(orderIntakeHtml, /Portal submission and staff routing matrix/);
  assert.match(orderIntakeHtml, /Client portal/);
  assert.match(orderIntakeHtml, /Notary portal/);
  assert.match(orderIntakeHtml, /Order document upload/);
  assert.match(orderIntakeHtml, /Completion package/);
  assert.match(orderIntakeHtml, /Release Validated Documents/);
  assert.match(orderIntakeHtml, /Confirm Notary Acceptance/);
  assert.match(orderIntakeHtml, /Route Financial Review/);
  assert.match(orderIntakeHtml, /Open Signer Readiness/);
  assert.match(orderIntakeHtml, /Open Appointments/);

  const signersLocked = await render("/staff/signers");
  assert.equal(signersLocked.status, 307);
  assert.match(signersLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const signersResponse = await render("/staff/signers", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(signersResponse.status, 200);
  const signersHtml = await signersResponse.text();
  assert.match(signersHtml, /Signer Readiness And Identity Check Center/);
  assert.match(signersHtml, /Signer identity and readiness matrix/);
  assert.match(signersHtml, /SGN-2607-0001/);
  assert.match(signersHtml, /Dana Whitaker/);
  assert.match(signersHtml, /Government-issued photo identification at appointment/);
  assert.match(signersHtml, /Remote identity proofing and credential analysis/);
  assert.match(signersHtml, /Electronic witness requirement under review/);
  assert.match(signersHtml, /Confirm Ready Appointment/);
  assert.match(signersHtml, /Request Identity Documents/);
  assert.match(signersHtml, /Escalate Identity Issue/);
  assert.match(orderIntakeHtml, /Open Closeout Console/);

  const appointmentsLocked = await render("/staff/appointments");
  assert.equal(appointmentsLocked.status, 307);
  assert.match(appointmentsLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const appointmentsResponse = await render("/staff/appointments", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(appointmentsResponse.status, 200);
  const appointmentsHtml = await appointmentsResponse.text();
  assert.match(appointmentsHtml, /Appointment Scheduling And Confirmation Center/);
  assert.match(appointmentsHtml, /Appointment readiness and confirmation matrix/);
  assert.match(appointmentsHtml, /APT-2607-0001/);
  assert.match(appointmentsHtml, /Signer and location confirmation required/);
  assert.match(appointmentsHtml, /Client notice failed; retry required/);
  assert.match(appointmentsHtml, /Confirm Appointment/);
  assert.match(appointmentsHtml, /Retry Client Notice/);
  assert.match(appointmentsHtml, /Request Missing Documents/);
  assert.match(appointmentsHtml, /Escalate Appointment Issue/);
  assert.match(appointmentsHtml, /Open Signer Readiness/);

  const orderCloseoutLocked = await render("/staff/order-closeout");
  assert.equal(orderCloseoutLocked.status, 307);
  assert.match(orderCloseoutLocked.headers.get("location") ?? "", /signin-with-chatgpt/);

  const orderCloseoutResponse = await render("/staff/order-closeout", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(orderCloseoutResponse.status, 200);
  const orderCloseoutHtml = await orderCloseoutResponse.text();
  assert.match(orderCloseoutHtml, /Order Closeout And Delivery Console/);
  assert.match(orderCloseoutHtml, /Order closeout control matrix/);
  assert.match(orderCloseoutHtml, /Completion package validation/);
  assert.match(orderCloseoutHtml, /Client document delivery/);
  assert.match(orderCloseoutHtml, /Client invoice release/);
  assert.match(orderCloseoutHtml, /Notary payable routing/);
  assert.match(orderCloseoutHtml, /Retention and audit closeout/);
  assert.match(orderCloseoutHtml, /Record Completion Package/);
  assert.match(orderCloseoutHtml, /Release Validated Documents/);
  assert.match(orderCloseoutHtml, /Route Financial Review/);
  assert.match(orderCloseoutHtml, /Close Order/);

  const documentResponse = await render("/documents");
  assert.equal(documentResponse.status, 200);
  const documentHtml = await documentResponse.text();
  assert.match(documentHtml, /Document Vault/);
  assert.match(documentHtml, /Uploaded document controls/);
  assert.match(documentHtml, /Restricted identity records/);
  assert.match(documentHtml, /href="\/evidence\/DOC-2607-0001"/);
  assert.match(documentHtml, /href="\/evidence\/DOC-2607-0002"/);

  const userResponse = await render("/account/users");
  assert.equal(userResponse.status, 200);
  const userHtml = await userResponse.text();
  assert.match(userHtml, /Authorized Portal Users/);
  assert.match(userHtml, /No shared logins/);
  assert.match(userHtml, /Client Account Administrator/);

  const supportResponse = await render("/support");
  assert.equal(supportResponse.status, 200);
  const supportHtml = await supportResponse.text();
  assert.match(supportHtml, /Support And Correction Threads/);
  assert.match(supportHtml, /Correction request for billing authorization/);
  assert.match(supportHtml, /restricted staff-only/);

  const settingsResponse = await render("/settings/organization");
  assert.equal(settingsResponse.status, 200);
  const settingsHtml = await settingsResponse.text();
  assert.match(settingsHtml, /Organization Profile Controls/);
  assert.match(settingsHtml, /Submit Profile Change/);
  assert.match(settingsHtml, /NSC-NC-2607-0001/);
});

test("server-renders the protected evidence file viewer", async () => {
  const lockedResponse = await render("/evidence/EV-W9-FORM");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/evidence/EV-W9-FORM", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Secure Evidence Viewer/);
  assert.match(html, /Controlled Evidence Review/);
  assert.match(html, /Completed W-9 form/);
  assert.match(html, /completed-w-9-form\.pdf/);
  assert.match(html, /Restricted financial review/);
  assert.match(html, /Restricted tax record/);
  assert.match(html, /SHA-256 fingerprint/);
  assert.match(html, /Encrypted evidence object pending production storage binding/);
  assert.match(html, /Retain under tax onboarding and payable control policy/);
  assert.match(html, /Access audit/);
  assert.match(html, /Record Access Note/);
  assert.match(html, /Flag Evidence Issue/);
  assert.match(html, /Request Replacement/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001\/profile-verification"/);
  assert.match(html, /href="\/documents"/);
});

test("server-renders the protected evidence upload and intake review workspace", async () => {
  const lockedResponse = await render("/staff/evidence-intake");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/evidence-intake", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Evidence Upload And Intake Review/);
  assert.match(html, /Evidence Intake/);
  assert.match(html, /Upload custody and validation matrix/);
  assert.match(html, /Profile evidence/);
  assert.match(html, /Order documents/);
  assert.match(html, /Restricted files/);
  assert.match(html, /Scan complete/);
  assert.match(html, /EV-W9-FORM/);
  assert.match(html, /EV-NNA-CERTIFICATE/);
  assert.match(html, /DOC-2607-0001/);
  assert.match(html, /completed-w-9-form\.pdf/);
  assert.match(html, /nna-signing-agent-certificate\.pdf/);
  assert.match(html, /seller-closing-package\.pdf/);
  assert.match(html, /Malware scan complete/);
  assert.match(html, /Encrypted object storage and signed access URLs required in production/);
  assert.match(html, /href="\/evidence\/EV-W9-FORM"/);
  assert.match(html, /href="\/evidence\/EV-NNA-CERTIFICATE"/);
  assert.match(html, /href="\/evidence\/DOC-2607-0001"/);
  assert.match(html, /Production upload submission will require encrypted storage/);
  assert.match(html, /href="\/staff\/document-validation"/);
  assert.match(html, /Open Validation Queue/);
  assert.match(html, /Logout/);
});

test("server-renders the protected document malware and validation queue", async () => {
  const lockedResponse = await render("/staff/document-validation");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/document-validation", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Document Malware And Validation Queue/);
  assert.match(html, /Document Validation/);
  assert.match(html, /Malware scan and release matrix/);
  assert.match(html, /Ready for release/);
  assert.match(html, /Restricted holds/);
  assert.match(html, /Storage pending/);
  assert.match(html, /Hash coverage/);
  assert.match(html, /Allowed type/);
  assert.match(html, /SHA-256 recorded/);
  assert.match(html, /Restricted release hold/);
  assert.match(html, /seller-closing-package\.pdf/);
  assert.match(html, /borrower-identification-copy\.pdf/);
  assert.match(html, /completed-w-9-form\.pdf/);
  assert.match(html, /Release Validated Evidence/);
  assert.match(html, /Quarantine Failed File/);
  assert.match(html, /Request Replacement Upload/);
  assert.match(html, /Escalate Restricted Document/);
  assert.match(html, /href="\/evidence\/DOC-2607-0001"/);
  assert.match(html, /href="\/evidence\/DOC-2607-0002"/);
  assert.match(html, /Production validation must connect to a real malware scanning service/);
  assert.match(html, /No command submitted/);
  assert.match(html, /Logout/);
});

test("server-renders the protected retention and records policy center", async () => {
  const lockedResponse = await render("/staff/retention");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/retention", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Retention And Records Policy Center/);
  assert.match(html, /Records policy and hold matrix/);
  assert.match(html, /Profile records/);
  assert.match(html, /Identity proofing records/);
  assert.match(html, /Order documents/);
  assert.match(html, /W-9 and payable records/);
  assert.match(html, /Command receipts/);
  assert.match(html, /Deletion blocked/);
  assert.match(html, /Append-only records/);
  assert.match(html, /RET-2607-0002/);
  assert.match(html, /Audit hold recommended/);
  assert.match(html, /Place Retention Hold/);
  assert.match(html, /Release Retention Hold/);
  assert.match(html, /Mark Deletion Review Needed/);
  assert.match(html, /Escalate Retention Exception/);
  assert.match(html, /No command submitted/);
  assert.match(html, /Production retention enforcement should use immutable audit records/);
  assert.match(html, /Logout/);
});

test("server-renders the protected system health and recovery center", async () => {
  const lockedResponse = await render("/staff/system-health");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/system-health", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /System Health And Recovery Center/);
  assert.match(html, /Backup, recovery, and provider health matrix/);
  assert.match(html, /Database backup/);
  assert.match(html, /Encrypted evidence storage/);
  assert.match(html, /Notification provider/);
  assert.match(html, /Identity provider MFA\/passkeys/);
  assert.match(html, /Malware scanning service/);
  assert.match(html, /Pending integrations/);
  assert.match(html, /Recovery posture/);
  assert.match(html, /SYS-2607-0001/);
  assert.match(html, /Verify Backup Recovery/);
  assert.match(html, /Open Recovery Drill/);
  assert.match(html, /Escalate System Incident/);
  assert.match(html, /Mark Provider Degraded/);
  assert.match(html, /No command submitted/);
  assert.match(html, /Production readiness requires real provider monitoring/);
  assert.match(html, /href="\/staff\/access-control"/);
  assert.match(html, /href="\/staff\/integrations"/);
  assert.match(html, /href="\/staff\/platform"/);
  assert.match(html, /Logout/);
});

test("server-renders the protected identity provider and access control center", async () => {
  const lockedResponse = await render("/staff/access-control");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/access-control", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Identity Provider And Access Control Administration/);
  assert.match(html, /Identity, role, and session control matrix/);
  assert.match(html, /Open reviews/);
  assert.match(html, /Passkey gaps/);
  assert.match(html, /Device issues/);
  assert.match(html, /Least privilege/);
  assert.match(html, /IAM-2607-0001/);
  assert.match(html, /GenAdmin001/);
  assert.match(html, /Super Admin/);
  assert.match(html, /Support Review/);
  assert.match(html, /MFA enrolled/);
  assert.match(html, /Passkey enrollment required/);
  assert.match(html, /Suspend Staff Session/);
  assert.match(html, /Require MFA\/Passkey Reset/);
  assert.match(html, /Open Access Review/);
  assert.match(html, /Escalate Privilege Exception/);
  assert.match(html, /No command submitted/);
  assert.match(html, /Production access control must be enforced server-side/);
  assert.match(html, /href="\/staff\/platform"/);
  assert.match(html, /Logout/);
});

test("server-renders the protected provider integration status center", async () => {
  const lockedResponse = await render("/staff/integrations");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/integrations", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Provider Integration Status Center/);
  assert.match(html, /Integration status and compliance matrix/);
  assert.match(html, /Identity provider/);
  assert.match(html, /Email and SMS delivery/);
  assert.match(html, /Encrypted file storage/);
  assert.match(html, /Malware scanning service/);
  assert.match(html, /Payment and accounting provider/);
  assert.match(html, /Pending providers/);
  assert.match(html, /Callback controls/);
  assert.match(html, /INT-2607-0001/);
  assert.match(html, /Verify Provider Integration/);
  assert.match(html, /Mark Integration Degraded/);
  assert.match(html, /Open Callback Review/);
  assert.match(html, /Escalate Provider Risk/);
  assert.match(html, /No command submitted/);
  assert.match(html, /Production provider integrations require secrets management/);
  assert.match(html, /href="\/staff\/platform"/);
  assert.match(html, /Logout/);
});

test("server-renders the protected platform configuration center", async () => {
  const lockedResponse = await render("/staff/platform");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/platform", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Admin Platform Configuration Center/);
  assert.match(html, /Platform configuration control matrix/);
  assert.match(html, /Service catalog/);
  assert.match(html, /Jurisdiction rules/);
  assert.match(html, /Credential expiration/);
  assert.match(html, /Notification templates/);
  assert.match(html, /Document retention/);
  assert.match(html, /Financial rules/);
  assert.match(html, /Security baseline/);
  assert.match(html, /Verify Identity Provider/);
  assert.match(html, /Verify Backup Readiness/);
  assert.match(html, /Require MFA \/ Passkey Reset/);
  assert.match(html, /Place Retention Hold/);
  assert.match(html, /Open System Health/);
  assert.match(html, /Open Integrations/);
  assert.match(html, /Open Access Control/);
  assert.match(html, /Open Retention/);
  assert.match(html, /Production configuration changes should require authenticated/);
  assert.match(html, /Logout/);
});

test("server-renders the protected financial controls workspace", async () => {
  const lockedResponse = await render("/staff/financial-controls");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/financial-controls", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Payable And Billing Approval Console/);
  assert.match(html, /Financial activation control matrix/);
  assert.match(html, /W-9 and payable activation/);
  assert.match(html, /Client billing authorization/);
  assert.match(html, /Payment ledger correction/);
  assert.match(html, /General Admin may review status but cannot approve financial activation/);
  assert.match(html, /Administrator or Super Admin/);
  assert.match(html, /Super Admin/);
  assert.match(html, /completed-w-9-form\.pdf/);
  assert.match(html, /client-billing-authorization\.pdf/);
  assert.match(html, /href="\/evidence\/EV-W9-FORM"/);
  assert.match(html, /href="\/evidence\/EV-CLIENT-BILLING-AUTH"/);
  assert.match(html, /Financial Approval Locked/);
  assert.match(html, /Escalate to Super Admin/);
  assert.match(html, /href="\/staff\/financial-reports"/);
  assert.match(html, /href="\/staff\/audit-reports"/);
});

test("server-renders the protected Super Admin audit reporting center", async () => {
  const lockedResponse = await render("/staff/audit-reports");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const genAdminResponse = await render("/staff/audit-reports", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(genAdminResponse.status, 404);

  const response = await render("/staff/audit-reports", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Super Admin Audit Reporting Center/);
  assert.match(html, /Super Admin Audit Reporting/);
  assert.match(html, /General Admin users cannot access this report workspace/);
  assert.match(html, /Audit event matrix/);
  assert.match(html, /High-risk events/);
  assert.match(html, /Evidence access/);
  assert.match(html, /Financial controls/);
  assert.match(html, /Retention posture/);
  assert.match(html, /Append-only/);
  assert.match(html, /AUD-2607-0001/);
  assert.match(html, /AUD-2607-0006/);
  assert.match(html, /GenAdmin001/);
  assert.match(html, /Payment ledger correction remains locked/);
  assert.match(html, /NSC-NC-2607-0001/);
  assert.match(html, /NTF-2607-0005/);
  assert.match(html, /CRD-2607-0003/);
  assert.match(html, /Export Audit Report/);
  assert.match(html, /Place Retention Hold/);
  assert.match(html, /Escalate Exception/);
  assert.match(html, /Corrections should be appended as new attributable events/);
  assert.match(html, /Logout/);
});

test("server-renders the protected credential renewal monitoring center", async () => {
  const lockedResponse = await render("/credentials/expiration");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/credentials/expiration", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Credential Expiration Register/);
  assert.match(html, /Credential Monitoring Center/);
  assert.match(html, /Credential renewal monitoring matrix/);
  assert.match(html, /Renewal review/);
  assert.match(html, /Elevated authority/);
  assert.match(html, /Notary credentials/);
  assert.match(html, /Client authority/);
  assert.match(html, /Dec 31 2026/);
  assert.match(html, /Expired credentials must block affected services/);
  assert.match(html, /CRD-2607-0001/);
  assert.match(html, /Notary commission/);
  assert.match(html, /E&amp;O insurance/);
  assert.match(html, /RON digital certificate/);
  assert.match(html, /Client billing authorization/);
  assert.match(html, /Renewal due/);
  assert.match(html, /Elevated review/);
  assert.match(html, /Restricted/);
  assert.match(html, /First reminder scheduled for Oct 02 2026 at 9:00 AM ET/);
  assert.match(html, /NTF-2607-0006/);
  assert.match(html, /Loan signing assignment eligibility is blocked if coverage expires/);
  assert.match(html, /RON assignment eligibility restricted until renewed certificate is verified/);
  assert.match(html, /Administrator or Super Admin/);
  assert.match(html, /href="\/evidence\/EV-NOTARY-COMMISSION-CERTIFICATE"/);
  assert.match(html, /href="\/evidence\/EV-EO-INSURANCE-DECLARATION"/);
  assert.match(html, /href="\/evidence\/EV-RON-DIGITAL-CERTIFICATE"/);
  assert.match(html, /href="\/evidence\/EV-CLIENT-BILLING-AUTH"/);
  assert.match(html, /Send Renewal Reminder/);
  assert.match(html, /Request Replacement Evidence/);
  assert.match(html, /Escalate Restriction/);
  assert.match(html, /Logout/);
});

test("server-renders the protected financial reporting and ledger center", async () => {
  const lockedResponse = await render("/staff/financial-reports");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/staff/financial-reports", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Financial Reporting And Payment Ledger Center/);
  assert.match(html, /Financial Reporting/);
  assert.match(html, /Payment Ledger Controls/);
  assert.match(html, /Financial ledger reporting matrix/);
  assert.match(html, /Ledger locks/);
  assert.match(html, /Super Admin items/);
  assert.match(html, /Invoice posture/);
  assert.match(html, /Evidence linkage/);
  assert.match(html, /LED-2607-0001/);
  assert.match(html, /LED-2607-0004/);
  assert.match(html, /Client invoice/);
  assert.match(html, /Notary payable/);
  assert.match(html, /Payable Restricted/);
  assert.match(html, /Billing Locked/);
  assert.match(html, /Correction Locked/);
  assert.match(html, /NSN pending approval/);
  assert.match(html, /NSC pending approval/);
  assert.match(html, /href="\/evidence\/EV-W9-FORM"/);
  assert.match(html, /href="\/evidence\/EV-CLIENT-BILLING-AUTH"/);
  assert.match(html, /href="\/evidence\/DOC-2607-0001"/);
  assert.match(html, /Export Ledger Report/);
  assert.match(html, /Hold Payment Release/);
  assert.match(html, /Escalate Ledger Correction/);
  assert.match(html, /href="\/staff\/audit-reports"/);
  assert.match(html, /Logout/);
});

test("server-renders the protected communications center", async () => {
  const lockedResponse = await render("/notifications");
  assert.equal(lockedResponse.status, 307);
  assert.match(lockedResponse.headers.get("location") ?? "", /signin-with-chatgpt/);

  const response = await render("/notifications", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Notification Delivery Log/);
  assert.match(html, /Communications Center/);
  assert.match(html, /Email, phone, and staff alert controls/);
  assert.match(html, /Delivery failures/);
  assert.match(html, /Consent holds/);
  assert.match(html, /Phone and SMS notices require recorded consent/);
  assert.match(html, /NTF-2607-0005/);
  assert.match(html, /Failed/);
  assert.match(html, /Requires recorded consent/);
  assert.match(html, /Retry Failed Delivery/);
  assert.match(html, /Record Consent/);
  assert.match(html, /Suppress Notice/);
  assert.match(html, /Elevated approval ready/);
  assert.match(html, /Credential expiration reminder/);
  assert.match(html, /Owner \/ next action/);
  assert.match(html, /Send after profile activation is persisted/);
  assert.match(html, /Retry delivery and escalate if failure repeats/);
  assert.match(html, /href="\/staff\/financial-controls"/);
  assert.match(html, /Logout/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
});

test("protects staff-only assignment operations", async () => {
  const lockedResponse = await render("/staff/orders/ORD-2607-0001/assignment");
  assert.equal(lockedResponse.status, 307);

  const response = await render("/staff/orders/ORD-2607-0001/assignment", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Notary Assignment Review/);
  assert.match(html, /Assignment control matrix/);
  assert.match(html, /Queue Assignment/);
  assert.match(html, /Confirm Acceptance/);
  assert.match(html, /Request Credential Review/);
  assert.match(html, /Keep Order On Hold/);
  assert.match(html, /Staff identity required/);
});

test("enforces protected workflow transitions", async () => {
  const lockedResponse = await requestRoute("/staff/workflow/NSR-1004", {
    method: "POST",
    body: JSON.stringify({ action: "grant-final-approval", role: "Admin" }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  assert.equal(lockedResponse.status, 307);

  const blockedGenAdminResponse = await requestRoute("/staff/workflow/NSR-1001", {
    method: "POST",
    body: JSON.stringify({
      action: "complete-genadmin-verification",
      role: "GenAdmin",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(blockedGenAdminResponse.status, 409);
  const blockedGenAdmin = await blockedGenAdminResponse.json();
  assert.equal(blockedGenAdmin.allowed, false);
  assert.equal(blockedGenAdmin.nextStatus, "Pending Review");
  assert.match(
    blockedGenAdmin.blockedReason,
    /Every required verification item must be verified/,
  );

  const sectionResponse = await requestRoute(
    "/staff/workflow/NSR-1001/section/Identity",
    {
      method: "POST",
      body: JSON.stringify({
        action: "mark-section-verified",
        reviewer: "GenAdmin001",
      }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "oai-authenticated-user-email": "staff@example.com",
      },
    },
  );
  assert.equal(sectionResponse.status, 200);
  const sectionTransition = await sectionResponse.json();
  assert.equal(sectionTransition.allowed, true);
  assert.equal(sectionTransition.section, "Identity");
  assert.equal(sectionTransition.nextStatus, "Verified");
  assert.equal(sectionTransition.persisted, true);
  assert.equal(sectionTransition.storedRequest.sectionStatus, "Verified");
  assert.match(sectionTransition.auditEvent, /GenAdmin001 changed NSR-1001 Identity/);

  const sectionStateResponse = await requestRoute("/staff/workflow/NSR-1001", {
    headers: {
      accept: "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(sectionStateResponse.status, 200);
  const sectionState = await sectionStateResponse.json();
  assert.equal(
    sectionState.verificationItems.find((item) => item.section === "Identity").status,
    "Verified",
  );
  assert.ok(sectionState.auditEvents.length >= 3);

  const finalApprovalResponse = await requestRoute("/staff/workflow/NSR-1004", {
    method: "POST",
    body: JSON.stringify({ action: "grant-final-approval", role: "Admin" }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
    },
  });
  assert.equal(finalApprovalResponse.status, 200);
  const finalApproval = await finalApprovalResponse.json();
  assert.equal(finalApproval.allowed, true);
  assert.equal(finalApproval.persisted, true);
  assert.equal(finalApproval.currentStatus, "Ready for Elevated Approval");
  assert.equal(finalApproval.nextStatus, "Active");
  assert.equal(finalApproval.generatedProfileNumber, "NSC-NC-2607-0001");
  assert.equal(finalApproval.storedRequest.status, "Active");
  assert.equal(finalApproval.storedRequest.profileNumber, "NSC-NC-2607-0001");
  assert.match(finalApproval.auditEvent, /Admin granted final approval/);
  assert.deepEqual(
    finalApproval.notifications.map((notification) => notification.channel),
    ["Email", "Phone"],
  );
  assert.match(
    finalApproval.requiredAuditFields.join(" "),
    /Assigned NSN or NSC number/,
  );

  const finalStateResponse = await requestRoute("/staff/workflow/NSR-1004", {
    headers: {
      accept: "application/json",
      "oai-authenticated-user-email": "admin@example.com",
    },
  });
  assert.equal(finalStateResponse.status, 200);
  const finalState = await finalStateResponse.json();
  assert.equal(finalState.status, "Active");
  assert.equal(finalState.profileNumber, "NSC-NC-2607-0001");
  assert.equal(finalState.notifications.length, 2);
});

test("persists command center workflow actions", async () => {
  const lockedResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({ action: "retry-failed-notification" }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  assert.equal(lockedResponse.status, 307);

  const retryResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "retry-failed-notification",
      targetId: "NTF-2607-0005",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(retryResponse.status, 200);
  const retryTransition = await retryResponse.json();
  assert.equal(retryTransition.allowed, true);
  assert.equal(retryTransition.persisted, true);
  assert.equal(retryTransition.targetType, "Notification");
  assert.equal(retryTransition.currentStatus, "Failed");
  assert.equal(retryTransition.nextStatus, "Retry Queued");
  assert.equal(retryTransition.receipt.persistence.target.id, "NTF-2607-0005");
  assert.equal(retryTransition.receipt.persistence.target.status, "Retry Queued");
  assert.equal(retryTransition.receipt.persistence.event.receiptId, retryTransition.receiptId);
  assert.equal(retryTransition.receipt.persistence.event.allowed, true);
  assert.equal(retryTransition.receipt.persistence.receipt.retainedForAudit, true);
  assert.match(retryTransition.receipt.persistence.event.createdAtUtc, /2026-07-18T21:00:00.000Z/);
  assert.match(retryTransition.auditEvent, /retried failed notification delivery/);
  assert.match(retryTransition.event.id, /CMD-2607-/);

  const blockedSuppressResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "suppress-notice",
      targetId: "NTF-2607-0005",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(blockedSuppressResponse.status, 409);
  const blockedSuppress = await blockedSuppressResponse.json();
  assert.equal(blockedSuppress.allowed, false);
  assert.equal(blockedSuppress.persisted, true);
  assert.equal(blockedSuppress.event.id, blockedSuppress.receiptId);
  assert.equal(blockedSuppress.receipt.persistence.event.outcome, "Blocked");
  assert.equal(blockedSuppress.receipt.persistence.event.allowed, false);
  assert.equal(blockedSuppress.receipt.persistence.receipt.retainedForAudit, true);
  assert.match(
    blockedSuppress.blockedReason,
    /Administrator or Super Admin authority is required/,
  );

  const ledgerHoldResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "hold-payment-release",
      targetId: "LED-2607-0002",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(ledgerHoldResponse.status, 200);
  const ledgerHold = await ledgerHoldResponse.json();
  assert.equal(ledgerHold.targetType, "Ledger");
  assert.equal(ledgerHold.nextStatus, "Payment Hold Recorded");
  assert.match(ledgerHold.auditEvent, /placed payment release hold/);

  const retentionHoldResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "place-retention-hold",
      targetId: "AUD-2607-0006",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "superadmin@example.com",
      "x-notarix-staff-role": "SuperAdmin",
    },
  });
  assert.equal(retentionHoldResponse.status, 200);
  const retentionHold = await retentionHoldResponse.json();
  assert.equal(retentionHold.targetType, "Audit");
  assert.equal(retentionHold.nextStatus, "Retention Hold");
  assert.equal(retentionHold.receiptId, retentionHold.event.id);
  assert.match(retentionHold.auditEvent, /placed restricted audit retention hold/);

  const renewalReminderResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "send-renewal-reminder",
      targetId: "CRD-2607-0002",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(renewalReminderResponse.status, 200);
  const renewalReminder = await renewalReminderResponse.json();
  assert.equal(renewalReminder.targetType, "Credential");
  assert.equal(renewalReminder.nextStatus, "Reminder Queued");
  assert.match(renewalReminder.auditEvent, /queued credential renewal reminder/);

  const validationReleaseResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "release-validated-evidence",
      targetId: "DOC-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(validationReleaseResponse.status, 200);
  const validationRelease = await validationReleaseResponse.json();
  assert.equal(validationRelease.targetType, "Evidence");
  assert.equal(validationRelease.nextStatus, "Released");
  assert.match(validationRelease.auditEvent, /released validated evidence/);

  const retentionPolicyResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "place-record-retention-hold",
      targetId: "RET-2607-0002",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "superadmin@example.com",
      "x-notarix-staff-role": "SuperAdmin",
    },
  });
  assert.equal(retentionPolicyResponse.status, 200);
  const retentionPolicy = await retentionPolicyResponse.json();
  assert.equal(retentionPolicy.targetType, "Retention");
  assert.equal(retentionPolicy.nextStatus, "Retention Hold");
  assert.match(retentionPolicy.auditEvent, /placed record retention hold/);

  const systemHealthResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "verify-backup-recovery",
      targetId: "SYS-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(systemHealthResponse.status, 200);
  const systemHealth = await systemHealthResponse.json();
  assert.equal(systemHealth.targetType, "System");
  assert.equal(systemHealth.nextStatus, "Recovery Verified");
  assert.match(systemHealth.auditEvent, /verified backup and recovery posture/);

  const accessControlResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "require-mfa-passkey-reset",
      targetId: "IAM-2607-0002",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(accessControlResponse.status, 200);
  const accessControl = await accessControlResponse.json();
  assert.equal(accessControl.targetType, "Access");
  assert.equal(accessControl.nextStatus, "MFA Reset Required");
  assert.match(accessControl.auditEvent, /required MFA and passkey reset/);

  const integrationResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "verify-provider-integration",
      targetId: "INT-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(integrationResponse.status, 200);
  const integration = await integrationResponse.json();
  assert.equal(integration.targetType, "Integration");
  assert.equal(integration.nextStatus, "Integration Verified");
  assert.match(integration.auditEvent, /verified provider integration readiness/);

  const orderAssignmentResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "assign-notary",
      targetId: "ORD-2607-0002",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(orderAssignmentResponse.status, 200);
  const orderAssignment = await orderAssignmentResponse.json();
  assert.equal(orderAssignment.targetType, "Order");
  assert.equal(orderAssignment.nextStatus, "Assignment Queued");
  assert.match(orderAssignment.auditEvent, /queued notary assignment review/);

  const appointmentResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "confirm-order-appointment",
      targetId: "ORD-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(appointmentResponse.status, 200);
  const appointment = await appointmentResponse.json();
  assert.equal(appointment.targetType, "Order");
  assert.equal(appointment.nextStatus, "Appointment Confirmed");
  assert.match(appointment.auditEvent, /confirmed order appointment/);

  const signerFeedbackResponse = await render("/staff/signers", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(signerFeedbackResponse.status, 200);
  const signerFeedbackHtml = await signerFeedbackResponse.text();
  assert.match(signerFeedbackHtml, /Latest command result/);
  assert.match(signerFeedbackHtml, /Appointment Confirmed/);
  assert.match(signerFeedbackHtml, /confirm-order-appointment[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const appointmentFeedbackResponse = await render("/staff/appointments", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(appointmentFeedbackResponse.status, 200);
  const appointmentFeedbackHtml = await appointmentFeedbackResponse.text();
  assert.match(appointmentFeedbackHtml, /Latest command result/);
  assert.match(appointmentFeedbackHtml, /Appointment Confirmed/);
  assert.match(appointmentFeedbackHtml, /confirm-order-appointment[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const clientUploadResponse = await requestRoute("/client/order-actions", {
    method: "POST",
    body: JSON.stringify({
      action: "client-upload-order-documents",
      targetId: "ORD-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  assert.equal(clientUploadResponse.status, 200);
  const clientUpload = await clientUploadResponse.json();
  assert.equal(clientUpload.targetType, "Order");
  assert.equal(clientUpload.nextStatus, "Client Documents Submitted");
  assert.equal(clientUpload.receipt.role, "Client");
  assert.match(clientUpload.auditEvent, /submitted order document upload/);

  const clientFeedbackResponse = await render("/client/orders");
  assert.equal(clientFeedbackResponse.status, 200);
  const clientFeedbackHtml = await clientFeedbackResponse.text();
  assert.match(clientFeedbackHtml, /Latest command result/);
  assert.match(clientFeedbackHtml, /Client Documents Submitted/);
  assert.match(clientFeedbackHtml, /client-upload-order-documents[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const notaryAcceptResponse = await requestRoute("/notary/assignment-actions", {
    method: "POST",
    body: JSON.stringify({
      action: "notary-accept-assignment",
      targetId: "ORD-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  assert.equal(notaryAcceptResponse.status, 200);
  const notaryAccept = await notaryAcceptResponse.json();
  assert.equal(notaryAccept.targetType, "Order");
  assert.equal(notaryAccept.nextStatus, "Assignment Accepted");
  assert.equal(notaryAccept.receipt.role, "Notary");
  assert.match(notaryAccept.auditEvent, /accepted notary assignment/);

  const notaryFeedbackResponse = await render("/notary/assignments");
  assert.equal(notaryFeedbackResponse.status, 200);
  const notaryFeedbackHtml = await notaryFeedbackResponse.text();
  assert.match(notaryFeedbackHtml, /Latest command result/);
  assert.match(notaryFeedbackHtml, /Assignment Accepted/);
  assert.match(notaryFeedbackHtml, /notary-accept-assignment[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const orderIntakeFeedbackResponse = await render("/staff/order-intake", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(orderIntakeFeedbackResponse.status, 200);
  const orderIntakeFeedbackHtml = await orderIntakeFeedbackResponse.text();
  assert.match(orderIntakeFeedbackHtml, /Latest command result/);
  assert.match(orderIntakeFeedbackHtml, /Assignment Accepted/);
  assert.match(orderIntakeFeedbackHtml, /notary-accept-assignment[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const notaryCompletionUploadResponse = await requestRoute("/notary/assignment-actions", {
    method: "POST",
    body: JSON.stringify({
      action: "notary-upload-completion-package",
      targetId: "ORD-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  assert.equal(notaryCompletionUploadResponse.status, 200);
  const notaryCompletionUpload = await notaryCompletionUploadResponse.json();
  assert.equal(notaryCompletionUpload.targetType, "Order");
  assert.equal(notaryCompletionUpload.nextStatus, "Completion Package Uploaded");
  assert.equal(notaryCompletionUpload.receipt.role, "Notary");
  assert.match(notaryCompletionUpload.auditEvent, /uploaded order completion package/);

  const notaryCompletionFeedbackResponse = await render("/notary/assignments/ORD-2607-0001/completion");
  assert.equal(notaryCompletionFeedbackResponse.status, 200);
  const notaryCompletionFeedbackHtml = await notaryCompletionFeedbackResponse.text();
  assert.match(notaryCompletionFeedbackHtml, /Latest command result/);
  assert.match(notaryCompletionFeedbackHtml, /Completion Package Uploaded/);
  assert.match(notaryCompletionFeedbackHtml, /notary-upload-completion-package[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const closeOrderResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: JSON.stringify({
      action: "close-order",
      targetId: "ORD-2607-0001",
    }),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "oai-authenticated-user-email": "admin@example.com",
      "x-notarix-staff-role": "Admin",
    },
  });
  assert.equal(closeOrderResponse.status, 200);
  const closeOrder = await closeOrderResponse.json();
  assert.equal(closeOrder.targetType, "Order");
  assert.equal(closeOrder.nextStatus, "Closed");
  assert.match(closeOrder.auditEvent, /closed order case file/);

  const orderCloseoutFeedbackResponse = await render("/staff/order-closeout", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(orderCloseoutFeedbackResponse.status, 200);
  const orderCloseoutFeedbackHtml = await orderCloseoutFeedbackResponse.text();
  assert.match(orderCloseoutFeedbackHtml, /Latest command result/);
  assert.match(orderCloseoutFeedbackHtml, /Closed/);
  assert.match(orderCloseoutFeedbackHtml, /close-order[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const clientCompletionFeedbackResponse = await render("/client/orders/ORD-2607-0001/completion");
  assert.equal(clientCompletionFeedbackResponse.status, 200);
  const clientCompletionFeedbackHtml = await clientCompletionFeedbackResponse.text();
  assert.match(clientCompletionFeedbackHtml, /Latest command result/);
  assert.match(clientCompletionFeedbackHtml, /Closed/);
  assert.match(clientCompletionFeedbackHtml, /close-order[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const formReceiptResponse = await requestRoute("/staff/command-center", {
    method: "POST",
    body: new URLSearchParams({
      action: "record-phone-consent",
      targetId: "NTF-2607-0002",
    }).toString(),
    headers: {
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
      "oai-authenticated-user-email": "staff@example.com",
    },
  });
  assert.equal(formReceiptResponse.status, 303);
  assert.match(
    formReceiptResponse.headers.get("location") ?? "",
    /\/staff\/command-center\/receipt\/CMD-2607-/,
  );

  const formReceiptLocation = formReceiptResponse.headers.get("location") ?? "";
  const receiptPath = new URL(formReceiptLocation, "http://localhost").pathname;
  const receiptResponse = await render(
    receiptPath || "/staff/command-center/receipt/missing",
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(receiptResponse.status, 200);
  const receiptHtml = await receiptResponse.text();
  assert.match(receiptHtml, /Operational Action Receipt/);
  assert.match(receiptHtml, /Command Center Receipt/);
  assert.match(receiptHtml, /Outcome/);
  assert.match(receiptHtml, /Completed/);
  assert.match(receiptHtml, /Previous status/);
  assert.match(receiptHtml, /Requires recorded consent/);
  assert.match(receiptHtml, /New status/);
  assert.match(receiptHtml, /Consent Recorded/);
  assert.match(receiptHtml, /NTF-2607-0002/);
  assert.match(receiptHtml, /record-phone-consent/);
  assert.match(receiptHtml, /recorded phone or SMS communication consent/);
  assert.match(receiptHtml, /Proceed with phone or SMS delivery only for the consented notification purpose/);
  assert.match(receiptHtml, /Return To Console/);
  assert.match(receiptHtml, /href="\/notifications"/);
  assert.match(receiptHtml, /href="\/staff\/command-center\/activity"/);

  const blockedReceiptResponse = await render(
    `/staff/command-center/receipt/${blockedSuppress.receiptId}`,
    {
      "oai-authenticated-user-email": "staff@example.com",
    },
  );
  assert.equal(blockedReceiptResponse.status, 200);
  const blockedReceiptHtml = await blockedReceiptResponse.text();
  assert.match(blockedReceiptHtml, /Blocked/);
  assert.match(blockedReceiptHtml, /Blocked reason:/);
  assert.match(blockedReceiptHtml, /Administrator or Super Admin authority is required/);
  assert.match(blockedReceiptHtml, /Review role authority, target record, and required approval level/);

  const lockedActivityResponse = await render("/staff/command-center/activity");
  assert.equal(lockedActivityResponse.status, 307);

  const genAdminActivityResponse = await render("/staff/command-center/activity", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(genAdminActivityResponse.status, 404);

  const activityResponse = await render("/staff/command-center/activity", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(activityResponse.status, 200);
  const activityHtml = await activityResponse.text();
  assert.match(activityHtml, /Command Center Activity Log/);
  assert.match(activityHtml, /Operational command activity matrix/);
  assert.match(activityHtml, /Completed commands/);
  assert.match(activityHtml, /Blocked attempts/);
  assert.match(activityHtml, /Persistence posture/);
  assert.match(activityHtml, /D1 ready/);
  assert.match(activityHtml, /CMD-2607-/);
  assert.match(activityHtml, /retry-failed-notification/);
  assert.match(activityHtml, /suppress-notice/);
  assert.match(activityHtml, /hold-payment-release/);
  assert.match(activityHtml, /place-retention-hold/);
  assert.match(activityHtml, /record-phone-consent/);
  assert.match(activityHtml, /release-validated-evidence/);
  assert.match(activityHtml, /place-record-retention-hold/);
  assert.match(activityHtml, /verify-backup-recovery/);
  assert.match(activityHtml, /require-mfa-passkey-reset/);
  assert.match(activityHtml, /verify-provider-integration/);
  assert.match(activityHtml, /assign-notary/);
  assert.match(activityHtml, /confirm-order-appointment/);
  assert.match(activityHtml, /Administrator or Super Admin authority is required/);
  assert.match(activityHtml, /href="\/staff\/command-center\/receipt\/CMD-2607-/);
  assert.match(activityHtml, /Production command activity should be retained in append-only audit storage/);

  const communicationsFeedbackResponse = await render("/notifications", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(communicationsFeedbackResponse.status, 200);
  const communicationsFeedbackHtml = await communicationsFeedbackResponse.text();
  assert.match(communicationsFeedbackHtml, /Latest command result/);
  assert.match(communicationsFeedbackHtml, /Completed · CMD-2607-/);
  assert.match(communicationsFeedbackHtml, /record-phone-consent[\s\S]*updated[\s\S]*NTF-2607-0002/);
  assert.match(communicationsFeedbackHtml, /Open Receipt/);
  assert.match(communicationsFeedbackHtml, /href="\/staff\/command-center\/activity"/);

  const financialFeedbackResponse = await render("/staff/financial-reports", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(financialFeedbackResponse.status, 200);
  const financialFeedbackHtml = await financialFeedbackResponse.text();
  assert.match(financialFeedbackHtml, /Latest command result/);
  assert.match(financialFeedbackHtml, /Payment Hold Recorded/);
  assert.match(financialFeedbackHtml, /hold-payment-release[\s\S]*updated[\s\S]*LED-2607-0002/);

  const credentialFeedbackResponse = await render("/credentials/expiration", {
    "oai-authenticated-user-email": "staff@example.com",
  });
  assert.equal(credentialFeedbackResponse.status, 200);
  const credentialFeedbackHtml = await credentialFeedbackResponse.text();
  assert.match(credentialFeedbackHtml, /Latest command result/);
  assert.match(credentialFeedbackHtml, /Reminder Queued/);
  assert.match(credentialFeedbackHtml, /send-renewal-reminder[\s\S]*updated[\s\S]*CRD-2607-0002/);

  const validationFeedbackResponse = await render("/staff/document-validation", {
    "oai-authenticated-user-email": "admin@example.com",
  });
  assert.equal(validationFeedbackResponse.status, 200);
  const validationFeedbackHtml = await validationFeedbackResponse.text();
  assert.match(validationFeedbackHtml, /Latest command result/);
  assert.match(validationFeedbackHtml, /Released/);
  assert.match(validationFeedbackHtml, /release-validated-evidence[\s\S]*updated[\s\S]*DOC-2607-0001/);

  const retentionFeedbackResponse = await render("/staff/retention", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(retentionFeedbackResponse.status, 200);
  const retentionFeedbackHtml = await retentionFeedbackResponse.text();
  assert.match(retentionFeedbackHtml, /Latest command result/);
  assert.match(retentionFeedbackHtml, /Retention Hold/);
  assert.match(retentionFeedbackHtml, /place-record-retention-hold[\s\S]*updated[\s\S]*RET-2607-0002/);

  const systemHealthFeedbackResponse = await render("/staff/system-health", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(systemHealthFeedbackResponse.status, 200);
  const systemHealthFeedbackHtml = await systemHealthFeedbackResponse.text();
  assert.match(systemHealthFeedbackHtml, /Latest command result/);
  assert.match(systemHealthFeedbackHtml, /Recovery Verified/);
  assert.match(systemHealthFeedbackHtml, /verify-backup-recovery[\s\S]*updated[\s\S]*SYS-2607-0001/);

  const accessControlFeedbackResponse = await render("/staff/access-control", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(accessControlFeedbackResponse.status, 200);
  const accessControlFeedbackHtml = await accessControlFeedbackResponse.text();
  assert.match(accessControlFeedbackHtml, /Latest command result/);
  assert.match(accessControlFeedbackHtml, /MFA Reset Required/);
  assert.match(accessControlFeedbackHtml, /require-mfa-passkey-reset[\s\S]*updated[\s\S]*IAM-2607-0002/);

  const integrationFeedbackResponse = await render("/staff/integrations", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(integrationFeedbackResponse.status, 200);
  const integrationFeedbackHtml = await integrationFeedbackResponse.text();
  assert.match(integrationFeedbackHtml, /Latest command result/);
  assert.match(integrationFeedbackHtml, /Integration Verified/);
  assert.match(integrationFeedbackHtml, /verify-provider-integration[\s\S]*updated[\s\S]*INT-2607-0001/);

  const platformFeedbackResponse = await render("/staff/platform", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(platformFeedbackResponse.status, 200);
  const platformFeedbackHtml = await platformFeedbackResponse.text();
  assert.match(platformFeedbackHtml, /Latest command result/);
  assert.match(platformFeedbackHtml, /Integration Verified/);
  assert.match(platformFeedbackHtml, /verify-provider-integration[\s\S]*updated[\s\S]*INT-2607-0001/);

  const orderFeedbackResponse = await render("/staff/orders", {
    "oai-authenticated-user-email": "admin@example.com",
    "x-notarix-staff-role": "Admin",
  });
  assert.equal(orderFeedbackResponse.status, 200);
  const orderFeedbackHtml = await orderFeedbackResponse.text();
  assert.match(orderFeedbackHtml, /Latest command result/);
  assert.match(orderFeedbackHtml, /Closed/);
  assert.match(orderFeedbackHtml, /close-order[\s\S]*updated[\s\S]*ORD-2607-0001/);

  const auditFeedbackResponse = await render("/staff/audit-reports", {
    "oai-authenticated-user-email": "superadmin@example.com",
    "x-notarix-staff-role": "SuperAdmin",
  });
  assert.equal(auditFeedbackResponse.status, 200);
  const auditFeedbackHtml = await auditFeedbackResponse.text();
  assert.match(auditFeedbackHtml, /Latest command result/);
  assert.match(auditFeedbackHtml, /Retention Hold/);
  assert.match(auditFeedbackHtml, /place-retention-hold[\s\S]*updated[\s\S]*AUD-2607-0006/);

  const stateResponse = await requestRoute("/staff/command-center", {
    headers: {
      accept: "application/json",
      "oai-authenticated-user-email": "superadmin@example.com",
    },
  });
  assert.equal(stateResponse.status, 200);
  const commandState = await stateResponse.json();
  assert.match(commandState.workflowContract, /persist operational actions/);
  assert.match(commandState.persistenceContract, /D1 target, event, and receipt tables/);
  assert.deepEqual(commandState.persistenceTables, [
    "command_center_targets",
    "command_center_events",
    "command_center_receipts",
  ]);
  assert.ok(commandState.commandEvents.length >= 15);
  assert.ok(commandState.commandReceipts.length >= 15);
  assert.deepEqual(
    commandState.commandEvents.slice(-3).map((event) => event.nextStatus),
    ["Completion Package Uploaded", "Closed", "Consent Recorded"],
  );
});

test("keeps product rules in the local governance file", async () => {
  const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const orderRepository = await readFile(
    new URL("../app/order-repository.ts", import.meta.url),
    "utf8",
  );
  const commandMigration = await readFile(
    new URL("../drizzle/0001_watery_doorman.sql", import.meta.url),
    "utf8",
  );
  const orderMigration = await readFile(
    new URL("../drizzle/0002_magical_thena.sql", import.meta.url),
    "utf8",
  );
  const packageJson = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(agents, /Notarix Signings/);
  assert.match(agents, /Dec 31 2026/);
  assert.match(agents, /6:00 PM ET/);
  assert.match(agents, /###-###-####/);
  assert.match(agents, /NSR/);
  assert.match(agents, /NSN-NC-2607-0001/);
  assert.match(agents, /NSC-NC-2607-0001/);
  assert.match(agents, /Passkey/);
  assert.match(agents, /W-9/);
  assert.match(agents, /GenAdmin001/);
  assert.match(agents, /RON access must be restricted/);
  assert.match(agents, /Profile Invitation Sent/);
  assert.match(agents, /Ready for Elevated Approval/);
  assert.match(agents, /General Admin staff verify profile data/);
  assert.match(agents, /communication consent is recorded/);
  assert.match(page, /Notarial Services Made Simple/);
  assert.match(layout, /Notarix Signings Portal/);
  assert.match(schema, /commandCenterTargets/);
  assert.match(schema, /commandCenterEvents/);
  assert.match(schema, /commandCenterReceipts/);
  assert.match(schema, /orderOperationalRecords/);
  assert.match(schema, /orderLifecycleStages/);
  assert.match(schema, /orderSignerReadiness/);
  assert.match(schema, /orderAppointments/);
  assert.match(schema, /orderCloseoutControls/);
  assert.match(schema, /orderDeliveryReceipts/);
  assert.match(schema, /notaryCompletionReceipts/);
  assert.match(commandMigration, /CREATE TABLE `command_center_targets`/);
  assert.match(commandMigration, /CREATE TABLE `command_center_events`/);
  assert.match(commandMigration, /CREATE TABLE `command_center_receipts`/);
  assert.match(orderMigration, /CREATE TABLE `order_operational_records`/);
  assert.match(orderMigration, /CREATE TABLE `order_lifecycle_stages`/);
  assert.match(orderMigration, /CREATE TABLE `order_signer_readiness`/);
  assert.match(orderMigration, /CREATE TABLE `order_appointments`/);
  assert.match(orderMigration, /CREATE TABLE `order_closeout_controls`/);
  assert.match(orderMigration, /CREATE TABLE `order_delivery_receipts`/);
  assert.match(orderMigration, /CREATE TABLE `notary_completion_receipts`/);
  assert.match(orderRepository, /orderRepositoryPersistenceContract/);
  assert.match(orderRepository, /listOrderOperations/);
  assert.match(orderRepository, /listSignerReadiness/);
  assert.match(orderRepository, /listAppointmentConfirmations/);
  assert.match(css, /request-card:nth-child\(even\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
