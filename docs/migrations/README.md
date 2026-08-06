# Notarix Signings Migration Index

| Migration/artifact | State | Execution authority |
| --- | --- | --- |
| `drizzle/0000_postgres_production_baseline.sql` | Existing journaled baseline | Historical execution evidence applies |
| `drizzle/0001_nebulous_slipstream.sql` | Journaled; Preview execution separately gated | Existing Phase 2 identity migration plan |
| `proposals/0002_normalized_order_authorization.sql` | **Proposal only; ends in ROLLBACK; not journaled or executable as committed** | No execution authorized |

Proposed 0002 depends on successful, verified 0001. It must be generated through
the approved Drizzle workflow, reviewed against the proposal, checksummed,
rehearsed using synthetic isolated Preview data, and separately approved before
it enters `drizzle/` or any migration journal.
