# Notarix Signings Portal Blueprint

## Product Direction

Notarix Signings is a security-first, enterprise-grade notarial transaction
platform for traditional notarization, electronic notarization, and remote
online notarization.

The product should feel precise, modern, trusted, and operationally strong. It
should not resemble a generic booking website or a generic dashboard template.
The central system object is the Order. Every client request, document,
appointment, notary assignment, message, fee, status update, RON session event,
audit record, and completion record should connect back to an Order.

## Standing Standards

- Brand name: Notarix Signings.
- Dates: `Dec 31 2026`.
- Times: `6:00 PM ET`.
- Available hours: `6:00 AM ET` through `9:00 PM ET`.
- Typography: Inter or close system sans-serif, using 400, 500, and 600 weights.
- Tone: polished, professional, technical, and operationally precise.

## Platform Areas

- Public Website
- Request Portal
- Client Portal
- Notary Portal
- Administrative Portal

## Security Baseline

Security is foundational. The product must account for multifactor
authentication, role-based access control, least-privilege permissions, signed
document URLs, malware scanning, upload validation, encryption, secure sessions,
audit logging, security-event logging, environment separation, secrets
management, dependency scanning, backup and recovery, administrator review, data
retention, and incident response.

Highly restricted data includes identity documents, notarized documents, RON
recordings, electronic journal data, tax forms, banking data, credential
records, authentication evidence, electronic seals, and digital certificate
records.

## RON Requirements

RON features must be unavailable to notaries unless the system has validated
jurisdiction, commission status, electronic-notary authorization, remote-notary
authorization, credential status, service type, and order eligibility.

The first implementation should allow Notarix Signings to manage intake,
eligibility, scheduling, participants, documents, permissions, messaging, status,
audit history, and post-session records. A specialized RON provider may supply
regulated identity proofing, live audiovisual notarization, credential analysis,
tamper-evident signing, electronic seal application, and session recording.

## Initial Portal Modules

- Dashboard
- Orders
- Clients
- Notaries
- RON Sessions
- Documents
- Messages
- Billing
- Notary Payments
- Reports
- Support
- Audit Logs
- Administration
- Settings
