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
- Assign `NSC` only to approved client profiles, using the format `NSC-NC-2607-0001`.
- Approved profile numbers are permanent, database-generated, never reused, and should not be assigned before activation.

## Visual Direction

- Use Inter or a close system sans-serif stack.
- Prefer weights 400, 500, and 600.
- Use 700 sparingly.
- Keep composition restrained, precise, modern, and operational.
- Avoid generic legal-office imagery, excessive gradients, heavy shadows, and crowded dashboard patterns.

## Security Baseline

Plan every feature around MFA, RBAC, least privilege, audit logging, signed document access, upload validation, malware scanning, encryption, secure sessions, environment separation, secrets management, dependency scanning, backups, and data retention.

RON access must be restricted to notaries validated as authorized for the applicable jurisdiction and service type.

Do not place secrets, API keys, passwords, certificates, or production credentials in source files.
