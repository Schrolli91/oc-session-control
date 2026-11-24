# Proposal

## Why

The Cache breakdown currently spends two lines per agent on `Last call` and `TTL`, even though both describe the same latest assistant call. Combining them will make the section more compact while keeping the live age and cache-call statistics visible at a glance.

## What Changes

- Remove the separate `TTL` row for every Cache agent.
- Label the row `Last Hit` and show the colored age dot and elapsed timer in parentheses after it, without a colon (for example, `Last Hit (● 1m 0s)`).
- Keep the latest-call change and rate on the right, right-aligned as they are today.
- Preserve the existing timer colors, thresholds, unavailable behavior, and live updates.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Change the per-agent Cache detail layout by merging the live TTL indicator into the `Last call` row and removing the standalone TTL row.

## Impact

- `src/dashboard.tsx` Cache agent rows and `src/dashboard.test.mjs` render coverage.
- The `oc-session-control` Cache display requirements and scenarios.
