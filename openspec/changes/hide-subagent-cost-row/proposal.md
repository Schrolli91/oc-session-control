# Proposal

## Why

Sessions without subagents still show a “Subagents:” row with `$0.0000` under “Session usage”. It is dead weight: the row carries no information when no subagent exists.

## What Changes

- The “Subagents:” row under “Session usage” is only rendered when the session family has at least one subagent (`subagentCount > 0`).
- When subagents exist but have spent nothing, the row stays visible and shows `$0.0000` (visibility is decided by subagent count, never by price).
- The “Mainagent:” and “Saved (est.):” rows are unchanged.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `oc-session-control`: “Show total session costs” changes — the “Subagents:” row is hidden instead of showing `$0.0000` when no subagents are present, and the expanded-by-default scenario no longer promises a “Subagents:” row without subagents.

## Impact

- `src/costs.mjs` — `buildSessionCostRows` drops the Subagents row when `subagentCount === 0`.
- `src/costs.test.mjs` — tests asserting the `$0.0000` row without subagents.
- `openspec/specs/oc-session-control/spec.md` — scenarios “No subagents are present” and “Cost section is expanded by default”.
- No API, dependency, or data changes.
