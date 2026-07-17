# Notarix Signings Engineering Rules

## Product Standard

Notarix Signings is a security-first notarial transaction platform for traditional notarization, electronic notarization, and remote online notarization. Treat the Order as the central system record.

## Brand And Formatting

- Use `Notarix Signings` as the brand name.
- Elevate user-provided wording into polished, professional, technical language.
- User-facing dates must display like `Dec 31 2026`.
- User-facing times must use 12-hour format with a time zone, such as `6:00 PM ET`.
- Phone numbers must be entered, displayed, and persisted as `###-###-####`, using example-safe placeholder numbers such as `555-123-4567`; do not store raw digit strings such as `19104468523`.
- Available hours are `6:00 AM ET` through `9:00 PM ET`.
- Store timestamps in UTC when backend persistence is added.
- Use `NSR` for intake requests before approval, such as `NSR-1001`.
- Assign `NSN` only to approved notary profiles, using the format `NSN-NC-2607-0001`.
- Assign `NSC` only to approved client profiles, using the format `NSC-TX-2607-1234`.
- Assign `ORD` to created Order Case Files, using the format `ORD-NC-2607-0001`.
- Permanent operating identifiers use `PREFIX-STATE-YYMM-SEQUENCE`; the compact account code omits the prefix and separators, such as `TX26071234`.
- Approved profile numbers are permanent, database-generated, never reused, and should not be assigned, reserved, or promised before activation. If `NSR-1002` is approved before `NSR-1001`, `NSR-1002` receives the next available approved profile number.
- Protected staff pages must include clear Home and Logout navigation.
- Profile workflow statuses should follow: `Contact Received`, `NSR Created`, `Profile Invitation Sent`, `Profile Submitted`, `GenAdmin Verification`, `Corrections Requested`, `Ready for Elevated Approval`, `Admin/Super Admin Review`, `Approved`, `Active`.

## Visual Direction

- Use Inter or a close system sans-serif stack.
- Prefer weights 400, 500, and 600.
- Use 700 sparingly.
- Keep composition restrained, precise, modern, and operational.
- Avoid generic legal-office imagery, excessive gradients, heavy shadows, and crowded dashboard patterns.

## Security Baseline

Plan every feature around MFA, RBAC, least privilege, audit logging, signed document access, upload validation, malware scanning, encryption, secure sessions, environment separation, secrets management, dependency scanning, backups, and data retention.

RON access must be restricted to notaries validated as authorized for the applicable jurisdiction and service type.

Passkey support should be presented as a production identity-provider capability, not as a decorative button. Staff authentication must support MFA, phishing-resistant passkeys when connected, device controls, role-based access, and audit logging.

Notary payable activation requires a W-9 form or approved tax onboarding record. General Admin staff may review completion status, but Administrator or Super Admin approval is required for payable activation, financial changes, and payment-ledger corrections.

Identity verification should be designed for an approved provider workflow that supports document analysis, camera-based selfie or face capture, liveness checks, provider result storage, and staff review before activation.

Approval audit records must identify which staff account performed the action. General Admin reviewers should be attributable as `GenAdmin001` through `GenAdmin005` until named production staff accounts are provisioned.

General Admin staff verify profile data and may mark verification complete, but they do not grant final profile approval. Final approval, profile number assignment, portal activation, billing/payable activation, and RON activation require Administrator or Super Admin review.

Approval notifications should include email delivery and phone or SMS delivery only when communication consent is recorded. Phone numbers must remain formatted as `###-###-####`.

Do not place secrets, API keys, passwords, certificates, or production credentials in source files.
