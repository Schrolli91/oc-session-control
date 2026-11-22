# Design

## Context

The host exposes two different cost reads: `session.cost(id)` returns the whole family rolled up into the root session (`if (child) return own; return family.reduce(sum)`), while `SessionInfo.cost` is the per-session record from the `session_v2.cost` column. The dashboard called the rollup and then summed it again across `sessionIDsForFamily()` — see proposal.md for the visible consequences. Everything downstream (`aggregateCosts`, `buildSessionCostRows`, `buildAgentRows`) already takes the cost as a plain input, so the whole defect sits in where `dashboard.tsx` sources that number.

Measured on a real root session with three subagents: own `0.0217`, subagents `0.2112` — the "Mainagent:" row showed `0.2329` and the heading `0.4441`.

## Goals / Non-Goals

**Goals:**
- Every session's cost appears exactly once: heading = `Mainagent:` + `Subagents:`, and each agent entry shows its own spend.
- Keep the change to the cost source; no restructuring of aggregation or rendering.

**Non-Goals:**
- Token aggregation (`aggregateUsage`, `buildUsageBreakdown`) and cache pricing — audited separately, no defect found on the token path.
- The open cache and message-window issues tracked in `FINDINGS-subagent-audit.md` (compacted sessions reporting `$0`, tokenless calls, the 20-message page window).
- Making the TSX layer unit-testable.

## Decisions

**1. Source costs from `SessionInfo.cost`, not `session.cost(id)`.**
The record field is unambiguously one session's own spend under either host behaviour, so no arithmetic and no knowledge of `parentID`, `family()`, or root/child roles is needed.
*Alternatives considered:* (a) subtract the descendants' costs from the root rollup — correct only while `family()` is complete and freshly loaded, and it reintroduces float subtraction; (b) ask the host for an own-cost accessor — no such API exists and adding one is out of plugin scope.

**2. Leave `aggregateCosts` and `buildSessionCostRows` untouched.**
They already do the right thing over their input (sum, `known`/`missing`, `(partial)`). Fixing the source rather than the consumers keeps one place where the host contract is interpreted and avoids a second, divergent aggregation path.

**3. Let an unloaded session stay `undefined`.**
`session.cost()` returns `0` for a session it has not loaded, which made `missing` permanently `0`, `unavailable` unreachable for the main row, and the specified `(partial)` marking dead. The raw record is `undefined` until the host fills it, so `formatCost`/`formatTotal` recover their intended behaviour without extra code. The dashboard already syncs the whole family on mount and on every usage event.

**4. Document the host contract at the call site instead of adding a test.**
The value is supplied by the host; the plugin-side logic is a field read spread over three call sites in untested TSX, so a unit test would only assert a mock. A comment naming the rollup trap is the cheaper regression guard. *Alternative:* extract a pure `ownCosts()` helper purely to have something to test — rejected as indirection that tests only its own mock.

## Risks / Trade-offs

- [Host changes `SessionInfo.cost` to a rollup] → every row and the heading would be wrong in the same direction. Mitigation: the contract is named in the code comment and pinned by the spec scenario "Count each session's cost once"; one eyeball check of the "Mainagent:" row against the host after the change.
- [Session info not yet loaded] → "Mainagent:" briefly shows `unavailable` where it used to show `$0.0000`. Mitigation: accepted — it is honest, matches the spec's unavailable-cost scenario, and resolves on the next refresh.
- [Stale `family()`] → the heading misses a session that the host's rollup would have included. Mitigation: none needed; the heading is now built from the same ID list the rows are built from, so the two can no longer disagree.

## Migration Plan

Single-commit bug fix, no data, schema, or dependency change. Revert the commit to roll back. Ships with the next release; no configuration or migration steps.

## Open Questions

None. Scope beyond this fix is tracked in `FINDINGS-subagent-audit.md` and belongs to separate changes.
