# Notary Assignment Offer Process

This process governs how Notarix Signings presents order opportunities to
approved notaries before assignment acceptance and how document access changes
after assignment confirmation.

## Core Principle

The Order Case File is the central document and assignment record. Clients,
Notarix staff, and assigned notaries should upload, download, review, and
complete documents through the order record rather than sending notarial
documents as email or SMS attachments.

## Before Acceptance

Before a notary accepts or is confirmed for an assignment, the offer page should
show only the information needed to evaluate availability and eligibility:

- Client company name
- Date and time of assignment
- City and ZIP code, not the full signing address when privacy-sensitive
- Signing type
- Approximate page count
- Scanbacks required: yes or no
- Return deadline
- Fee
- Required credentials

Primary response buttons:

- `I'm Interested`
- `Not Available`

## Not Available Reasons

If the notary selects `Not Available`, the page should collect one or more
structured reasons:

- I am not available at that time.
- Location is too far away.
- Fee is too low.
- I no longer do mobile signings.
- I do not want to work with this client.
- Other.

If the reason is fee-related, the page may collect an acceptable fee amount. The
portal should avoid the phrase "counter offer" in the notary-facing experience.
Use wording such as:

- `Fee I can accept`
- `Available with fee adjustment`
- `Available with adjustment`

The staff-facing order record should treat this as an assignment exception
requiring review, not as a confirmed assignment.

## After Assignment Confirmation

After staff confirms assignment acceptance or the order is otherwise assigned to
the notary, the notary may receive expanded order access:

- Full signing address
- Borrower or signer details as permitted
- Secure document download link
- Order instructions
- Scanback upload controls
- Completion package upload controls
- Mark appointment complete control

Document access remains controlled by order status, document validation,
credential eligibility, assignment status, and audit logging.

## Notification Channel Policy

Assignment announcements should be mobile-first but not mobile-only.

Required profile fields:

- Verified mobile phone number
- Verified email address
- Notification preference: SMS, email, or both
- SMS consent timestamp and consent source when SMS is enabled

Default assignment announcement recommendation:

- Send both SMS and email when the notary consents to both.
- SMS carries a short assignment offer and secure response link.
- Email carries fuller assignment context and serves as a delivery backup.

## SMS Offer Shape

```text
Notarix Signing Offer
Client: Coleman Title Group
When: Jul 17 2026 at 4:00 PM ET
Area: Elizabethtown, NC 28337
Fee: $100
Respond: [secure link]
```

## Audit And Workflow Requirements

- Each offer notification must be tied to the order.
- Each notary response must create a retained event.
- Not available reasons must be retained for staff review and notary coverage analytics.
- Fee adjustment requests must create an assignment exception.
- Full document access must not be granted until assignment and document-release controls permit it.
