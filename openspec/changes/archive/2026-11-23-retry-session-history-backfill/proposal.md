# Proposal

## Why

Session refresh can skip whole-history backfill when a paginated message load is already active. The in-flight load has no queued retry, so transcript-derived dashboard values can remain incomplete.

## What Changes

- Wait for an active message load to settle, then backfill all remaining history if more pages remain.
- Preserve lightweight status and execution refreshes when history is already loaded.
- Add deterministic coverage for the active-load race and its completion.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: ensure whole-transcript backfill proceeds after a concurrent page load settles.

## Impact

- Affected code: `src/session-tracker.ts` and `src/session-tracker.test.mjs`.
- Update the existing `oc-session-control` transcript-reading requirement and scenarios.
- No public API or dependency changes.
