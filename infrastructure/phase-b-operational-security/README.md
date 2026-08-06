# Phase B Track F — Operational security specification

Status: **DESIGNED / NOT DEPLOYED**

This directory defines the operational-security controls required before
Notarix Signings can progress from protected Preview to a controlled pilot or
unrestricted Production. The manifest is a review contract, not deployable IaC.
It creates no AWS resources and authorizes no Production configuration change.

## Implementation boundary

The design covers named AWS administration, security telemetry, PostgreSQL
connection attribution, authentication-failure alarms, append-only audit,
backup restoration, recovery objectives, and incident response. Each control
must be implemented first in an isolated environment and separately approved
before any Production change.

The design deliberately does not contain account IDs, role ARNs, endpoints,
credentials, connection strings, customer data, or deployable resource names.

Run the repository contract test with:

```sh
node --test tests/phase-b-operational-security-contract.test.mjs
```

Passing the contract test proves only that mandatory design clauses remain in
the repository. It does not prove that AWS, PostgreSQL, backup, alarm, or audit
controls exist or operate.
