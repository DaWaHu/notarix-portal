# Notarix Signings Authentication Containment Route Matrix

Date: Aug 5 2026

Original checkpoint branch: `codex/notarix-auth-containment`

Integrated branch: `codex/notarix-portal-checkpoint` on Sep 7 2026. The
integration preserves all later database-contract, incident-response, Order
Phase A, document-security, and operational-security work.

Production status: unchanged; the deployed Production artifact still contains
the superseded routes until a separate Production authorization is granted.

Pre-remediation audit: 142 substantive provider-specific references across 47
files after generated/vendor exclusions, including 118 runtime references. The
runtime exposed `/signin-with-chatgpt` and `/signout-with-chatgpt`; Production
returned HTTP 200 and HTTP 307 respectively before source remediation. The
remediated source runtime count is zero.

| Route | Previous guard | New guard | Permitted roles | Ownership | Policy evidence | Question | Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/credentials/expiration` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff operational register | Credential commands permit AnyStaff review/escalation; elevated actions remain separately controlled | None | Source contract + role denial |
| `/notifications` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff delivery register | Notification commands include AnyStaff operations with elevated suppression controls | None | Source contract + role denial |
| `/evidence/[evidenceId]` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff evidence record | Existing signed-access route uses the same three roles and records access receipts | Client/notary evidence ownership requires a future dedicated portal route | Source contract + anonymous denial |
| `/staff/signers` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff readiness register | Staff operations surface | None | Source contract |
| `/staff/appointments` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff appointment register | Staff operations surface; command authority remains action-specific | None | Source contract |
| `/staff/requests` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff request queue | GenAdmin verifies; final authority remains Admin/SuperAdmin | None | Source contract |
| `/staff/requests/[requestId]` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff request record | Approved profile workflow policy | None | Source contract |
| `/staff/orders` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff order register | Order is the central staff-controlled record; actions retain separate authority checks | None | Source contract |
| `/staff/orders/[orderId]/assignment` | Legacy identity only | `requireStaffRouteAccess` | Admin, SuperAdmin | Staff order assignment | Assignment changes eligibility and document access; elevated policy selected | Confirm whether GenAdmin may prepare but not finalize assignments | Source contract + cross-role denial |
| `/staff/order-intake` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff intake record | Staff operational intake with action-level authority | None | Source contract |
| `/staff/order-closeout` | Legacy identity only | `requireStaffRouteAccess` | Admin, SuperAdmin | Staff closeout record | Closeout includes financial release, payable and retention controls | Confirm whether GenAdmin may view a read-only closeout summary | Source contract + cross-role denial |
| `/staff/evidence-intake` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff evidence intake | Existing upload route uses the same three roles | None | Source contract |
| `/staff/command-center/receipt/[receiptId]` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff audit receipt | Commands are attributable and action authority is stored in the receipt | Confirm whether visibility should be limited to actor/elevated staff | Source contract |
| `/staff/requests/[requestId]/invitation` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff invitation record | GenAdmin workflow includes invitation preparation; activation remains elevated | None | Source contract |
| `/staff/requests/[requestId]/profile-verification` | Legacy identity only | `requireStaffRouteAccess` | GenAdmin, Admin, SuperAdmin | Staff verification record | GenAdmin verifies; Admin/SuperAdmin performs final approval | None | Source contract |
| `/staff/requests/[requestId]/profile-verification/decision/[decision]` | Legacy identity only | `requireStaffRouteAccess` | Admin, SuperAdmin | Staff activation decision | Final approval, activation and profile-number assignment require Admin/SuperAdmin | Whether correction-only decisions should have a separate GenAdmin route | Source contract + cross-role denial |

No client or notary access was added. Existing dedicated client and notary
surfaces require a separate ownership-enforcement review before identity cutover.
Database migration 0001 and environment configuration remain unchanged.

The `/client/order-actions` and `/notary/assignment-actions` write endpoints are
failed closed through `denyUnresolvedPortalOwnership` because their hard-coded
actors cannot establish client ownership or notary assignment. They must remain
unavailable until application sessions can resolve persisted portal users and
the owner approves the applicable record-ownership policy. Source contracts
verify both endpoints deny before parsing or applying an action.
