# Proposal

## Why

Long agent names in the Cache section use OpenTUI's native truncation, which places an ellipsis in the middle. Other dashboard rows use a trailing ellipsis, so long names are inconsistent and harder to scan.

## What Changes

- Match Cache agent-name shortening to the dashboard's trailing-ellipsis style.
- Keep the cache rate visible and separated from the shortened name.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Require cache agent names to use the same trailing-ellipsis shortening style as other dashboard titles.

## Impact

- `src/dashboard.tsx` Cache agent rows and their render test in `src/dashboard.test.mjs`.
- No API or dependency changes.
