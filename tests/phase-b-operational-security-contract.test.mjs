import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifestUrl = new URL(
  "../infrastructure/phase-b-operational-security/operational-security-manifest.yaml",
  import.meta.url,
);

const manifest = await readFile(manifestUrl, "utf8");

test("Track F manifest remains design-only and Production fail-closed", () => {
  assert.match(manifest, /status: DESIGNED_NOT_DEPLOYED/);
  assert.match(manifest, /deployable: false/);
  assert.match(manifest, /productionChangesAuthorized: false/);
  assert.match(manifest, /AWS-resource-creation/);
  assert.match(manifest, /production-parameter-group-change/);
});

test("named administration prohibits shared and static credentials", () => {
  assert.match(manifest, /provider: AWS-IAM-Identity-Center/);
  assert.match(manifest, /sharedAccounts: prohibited/);
  assert.match(manifest, /rootUse: break-glass-only/);
  assert.match(manifest, /mfa: required/);
  assert.match(manifest, /staticAccessKeys: prohibited/);
});

test("logging contract requires redaction and successful connection attribution", () => {
  for (const required of [
    "rds-postgresql-log-export",
    "log_connections: true",
    "log_disconnections: true",
    "log_statement: none",
    "application_name: notarix-environment-and-service",
    "authorization-header",
    "database-credentials",
    "identity-document-data",
  ]) {
    assert.ok(manifest.includes(required), `missing logging control: ${required}`);
  }
});

test("authentication and control-plane alert classes are specified", () => {
  for (const required of [
    "authenticationFailures:",
    "successfulConnectionAnomaly:",
    "security-group-world-ingress",
    "rds-public-access-change",
    "cloudtrail-stop-or-delete",
    "backup-retention-change",
  ]) {
    assert.ok(manifest.includes(required), `missing alert: ${required}`);
  }
});

test("audit is append-only and independently integrity checked", () => {
  assert.match(manifest, /appendOnly: true/);
  assert.match(manifest, /writerPrivileges: \[INSERT\]/);
  assert.match(manifest, /prohibitedWriterPrivileges: \[UPDATE, DELETE, TRUNCATE, ALTER, DROP\]/);
  assert.match(manifest, /sameTransactionAsBusinessMutation: required/);
  assert.match(manifest, /objectLock: compliance-or-governance-mode-owner-decision/);
  assert.match(manifest, /digest-mismatch/);
});

test("restore contract is isolated and recovery objectives remain owner-gated", () => {
  assert.match(manifest, /proposedObjectivesPendingOwnerApproval:/);
  assert.match(manifest, /pointInTimeRecovery: required/);
  assert.match(manifest, /destination: isolated-nonproduction-resource/);
  assert.match(manifest, /productionNetworkAttachment: prohibited/);
  assert.match(manifest, /productionCredentials: prohibited/);
  assert.match(manifest, /restore-completes-within-rto/);
  assert.match(manifest, /selected-recovery-point-meets-rpo/);
});

test("manifest contains no obvious secret or deployable account identifiers", () => {
  assert.doesNotMatch(manifest, /postgres(?:ql)?:\/\//i);
  assert.doesNotMatch(manifest, /AKIA[0-9A-Z]{16}/);
  assert.doesNotMatch(manifest, /-----BEGIN [A-Z ]*PRIVATE KEY-----/);
  assert.doesNotMatch(manifest, /\b\d{12}\b/);
});
