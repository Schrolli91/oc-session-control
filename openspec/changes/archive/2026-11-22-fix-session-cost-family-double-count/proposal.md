# Proposal

## Why

The host's `session.cost(id)` already rolls the whole agent family into the root session, but the dashboard summed that rollup across every family ID again. Subagent costs were therefore counted twice: the "Session usage" heading showed `main + 2 × subagents`, and the "Mainagent:" row showed the whole family instead of the main session's own spend. Users saw the main agent's cost climb while it was idle because subagents were billing against it. The specification already demands a single family sum in the heading and per-agent totals in the rows; the implementation did not meet it.

## What Changes

- The dashboard reads the per-session cost record instead of the host's family rollup for every cost value it renders: the "Mainagent:" row, each agent entry in the list, the "Subagents:" row, and the "Session usage" heading.
- The heading becomes the exact sum of the main session and its subagents once each, so `Mainagent + Subagents = heading`.
- "Mainagent:" and the main agent entry show only the main session's own cost.
- Missing cost data becomes observable again: the host rollup returns `0` for an unloaded session, which made `unavailable` and `(partial)` unreachable; the raw record is `undefined` until loaded, so partial families are marked incomplete as specified.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `oc-session-control`: "Show total session costs" gains an explicit single-counting requirement — each session's cost appears exactly once, the "Mainagent:" row carries only the main session's own spend, and the heading is the sum of the indented rows.

## Impact

- Code: `src/dashboard.tsx` (cost source for rows, heading, and subagent total).
- Not affected: `src/costs.mjs`, `src/agents.mjs`, `src/view-model.mjs` (already take the cost as an input), token aggregation, cache logic.
- Host contract: relies on `SessionInfo.cost` being the per-session record and on `session.family()` listing every descendant once. No API, dependency, or data-format change.
- Tests: `npm test` (80 tests) and `npx tsc --noEmit` must stay green; the cost value itself is supplied by the host, so existing unit tests keep passing unchanged.
