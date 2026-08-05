# Notarix Signings Standard Operating Procedure Index

Status definitions: **Complete** means written, approved, exercised, and backed
by current evidence. **Incomplete** means partial instructions or modeled UI
exist but the controlled procedure is not fully approved/tested. **Not started**
means no launch-acceptable controlled procedure was found.

| SOP ID | Procedure | Status | Required owner | Required closure evidence |
| --- | --- | --- | --- | --- |
| SOP-001 | Deployment | Incomplete | Release Lead | Approved SHA, private preview, gates, production authorization, deployment record |
| SOP-002 | Rollback | Incomplete | Release Lead | Timed rollback exercise and database compatibility decision tree |
| SOP-003 | User provisioning | Incomplete | Identity Lead | Joiner workflow, identity proof, role approval, test account evidence |
| SOP-004 | Role assignment | Incomplete | Security Lead | Dual control, least privilege, expiry/review, attributable audit record |
| SOP-005 | Emergency administrator access | Not started | Project Owner | Break-glass custody, MFA, alerting, time limit, post-use review exercise |
| SOP-006 | Account suspension | Incomplete | Identity Lead | Session revocation and access-denial test |
| SOP-007 | Staff termination | Not started | Operations Lead | Timed offboarding, device/token revocation, audit checklist |
| SOP-008 | Credential expiration | Incomplete | Compliance Lead | Escalation schedule and assignment-blocking test |
| SOP-009 | Notary approval | Incomplete | Compliance Lead | GenAdmin/final-approver separation and identifier assignment test |
| SOP-010 | Client onboarding | Incomplete | Client Operations Lead | Consent, role, identifier, isolation, and activation evidence |
| SOP-011 | Document quarantine | Incomplete | Platform Lead | Clean/infected/unknown-state test and custody record |
| SOP-012 | Malware detection | Incomplete | Security Lead | Alert, isolation, callback validation, replacement, incident decision tree |
| SOP-013 | Security incident | Not started | Security Lead | Severity matrix, contacts, containment, evidence, tabletop report |
| SOP-014 | Data breach | Not started | Project Owner/Legal | Notification decision tree, counsel/regulator contacts, exercise |
| SOP-015 | Backup restoration | Not started | Database/Operations Leads | Isolated restoration report with measured RTO/RPO |
| SOP-016 | Provider outage | Not started | Integration Lead | Detection, queueing, fallback, reconciliation, communications exercise |
| SOP-017 | Payment correction | Incomplete | Finance Lead | Admin/Super Admin approval, reconciliation, immutable correction record |
| SOP-018 | Audit review | Incomplete | Compliance Lead | Review cadence, sampling, exceptions, evidence retention |
| SOP-019 | Legal hold | Incomplete | Compliance/Legal | Hold placement/release authority and deletion-prevention test |
| SOP-020 | Data-retention enforcement | Incomplete | Compliance Lead | Approved schedule, lifecycle configuration, exception and destruction evidence |

## Required SOP template

Each SOP must include purpose, scope, accountable owner, authorized roles,
prerequisites, numbered procedure, security controls, failure/escalation path,
rollback or recovery where applicable, records created, retention, test cadence,
approval date, version, and linked exercise evidence.
