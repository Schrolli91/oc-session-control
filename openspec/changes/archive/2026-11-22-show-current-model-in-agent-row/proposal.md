# Proposal

## Why

After `/model` the `Model:` row keeps showing the previously used model until the next assistant call lands, because the row prefers the latest assistant usage over the session's selected model. The host already publishes the new selection immediately, so the dashboard shows a model the session is no longer on.

## What Changes

- The `Model:` row and the model-details dialog prefer the model selected on the session, falling back to the latest assistant usage only when the session has no selection.
- The context percentage and its used/total tokens stay bound to the model that produced the reported tokens, so the denominator of the percentage does not change when the selection does.
- The `Show each agent's model name` requirement defines the selected session model as the source of truth, with assistant usage as the fallback.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `oc-session-control`: The `Show each agent's model name` requirement changes which model the row reports and when the fallback applies.

## Impact

- `src/view-model.mjs` — `buildDashboardRows` splits the single `modelRef` into a displayed ref (selection first) and a usage ref (latest assistant usage) used for the context fill.
- `src/dashboard-components.tsx` — only if the row/dialog wiring needs the split fields.
- `src/view-model.test.mjs` — new expectations for selection-vs-usage precedence.
- No host API, dependency, or packaging changes. Row layout and colors are unchanged.
