# Proposal

## Why

Sessions without subagents still show a “Subagents:” row with `$0.0000` under “Session usage”, and a “Mainagent:” row that only repeats the heading total. Both rows carry no information when no subagent exists.

## What Changes

- The “Mainagent:” and “Subagents:” rows under “Session usage” are only rendered when the session family has at least one subagent (`subagentCount > 0`). Without subagents, the heading alone carries the total and only “Saved (est.):” is listed.
- When subagents exist but have spent nothing, both rows stay visible and “Subagents:” reads `$0.0000` (visibility is decided by subagent count, never by price).

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `oc-session-control`: “Show total session costs” changes — the “Subagents:” row is hidden instead of showing `$0.0000` when no subagents are present, and the expanded-by-default scenario no longer promises a “Subagents:” row without subagents.

## Impact

- `src/costs.mjs` — `buildSessionCostRows` drops the Mainagent and Subagents rows when `subagentCount === 0`.
- `src/costs.test.mjs`, `src/dashboard.test.mjs` — tests asserting the rows without subagents.
- `openspec/specs/oc-session-control/spec.md` — “Show total session costs” (row visibility, single-counting wording) and the “Saved (est.)” row-ordering scenario.
- No API, dependency, or data changes.
