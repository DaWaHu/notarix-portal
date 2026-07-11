import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/", headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html", ...headers },
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
  assert.match(html, /support@notarix\.live/);
  assert.match(html, /action="mailto:support@notarix\.live"/);
  assert.match(html, /Submit onboarding information to Notarix staff/);
  assert.match(html, /555-123-4567/);
  assert.match(html, /\[0-9\]\{3\}-\[0-9\]\{3\}-\[0-9\]\{4\}/);
  assert.match(html, /Send Access Request/);
  assert.doesNotMatch(html, /Client Portal Access|Notary Portal Access/);
  assert.doesNotMatch(html, /Activation workflow|Pending Review|Invitation Sent/);
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
  assert.match(html, /Requests stay inactive until staff approval/);
  assert.match(html, /Review client and notary access requests/);
  assert.match(html, /Notarix Signings Request/);
  assert.match(html, /NSR-1001/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001"/);
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
  assert.match(html, /Send Profile Invitation/);
  assert.match(html, /href="\/staff\/requests\/NSR-1001\/invitation"/);
  assert.match(html, /Place On Hold/);
  assert.match(html, /Audit intelligence/);
  assert.match(html, /Jul 10 2026 at 9:12 AM ET/);
  assert.match(html, /555-123-4567/);
  assert.doesNotMatch(html, /\b\d{10,11}\b/);
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
  assert.match(html, /Profile Completion Pending/);
  assert.match(html, /Single recipient, staff-issued, audit logged/);
  assert.match(html, /Required profile sections/);
  assert.match(html, /Commission profile and primary jurisdiction/);
  assert.match(html, /Staff receives profile-completion notification/);
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
  assert.match(notaryHtml, /Commission expiration date/);
  assert.match(notaryHtml, /Remote online notary authorization/);
  assert.match(notaryHtml, /Approved by state/);
  assert.match(notaryHtml, /Dec 31 2026/);
  assert.match(notaryHtml, /555-123-4567/);
  assert.doesNotMatch(notaryHtml, /\b\d{10,11}\b/);

  const clientResponse = await render("/profile/complete/NSR-1002");
  assert.equal(clientResponse.status, 200);
  const clientHtml = await clientResponse.text();
  assert.match(clientHtml, /Complete your client profile/);
  assert.match(clientHtml, /Coleman Title Group/);
  assert.match(clientHtml, /Client type/);
  assert.match(clientHtml, /Billing contact email/);
  assert.match(clientHtml, /Authorized users/);
  assert.match(clientHtml, /555-234-6789/);
  assert.doesNotMatch(clientHtml, /\b\d{10,11}\b/);
});

test("keeps product rules in the local governance file", async () => {
  const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(agents, /Notarix Signings/);
  assert.match(agents, /Dec 31 2026/);
  assert.match(agents, /6:00 PM ET/);
  assert.match(agents, /###-###-####/);
  assert.match(agents, /RON access must be restricted/);
  assert.match(page, /Notarial Services Made Simple/);
  assert.match(layout, /Notarix Signings Portal/);
  assert.match(css, /request-card:nth-child\(even\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
