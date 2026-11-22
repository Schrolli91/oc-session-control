# Proposal

## Why

`Saved (est.):` becomes `unavailable` as soon as one session in the agent family has more than one model in its message history — which happens the moment the user picks a different model, even before a single token is billed on it. Because the unpriced flag is family-wide, one subagent switching models or compacting hides the estimate for every session.

## What Changes

- Cache savings are priced per assistant message: each call's cache-read tokens use that call's own model's input and cache-read prices, instead of pricing the session's lifetime cache counter against a single model.
- A model switch no longer invalidates the estimate, and selecting a new model before the first call on it no longer blanks the row.
- Coverage gaps are reported per session and surfaced as `(partial)` on the estimate row, matching how the cost rows already degrade, instead of collapsing the whole family to `unavailable`.
- `unavailable` is reserved for the case where nothing in the family could be priced while cache reads exist.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `oc-session-control`: The `Estimate cache savings` requirement prices savings per assistant message, defines when a session's estimate is incomplete, and replaces the family-wide all-or-nothing `unavailable` rule with the existing `(partial)` degradation.

## Impact

- `src/usage.mjs` — `aggregateUsage` savings path; returns a coverage summary instead of a single family flag.
- `src/costs.mjs` — `buildSessionCostRows` renders the estimate row from a coverage summary.
- `src/dashboard.tsx` — passes the new summary to the cost rows.
- `src/usage.test.mjs`, `src/costs.test.mjs` — replace the multi-model and compaction `unavailable` expectations with the new coverage behavior.
- No host API, dependency, or packaging changes.
