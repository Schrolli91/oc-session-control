# Proposal

## Why

Dashboard family refresh currently syncs the root session to discover fresh family membership, then syncs that same root again while refreshing its details. The duplicate host API work is unnecessary and can overlap with event-driven refreshes.

## What Changes

- Keep the initial root session sync before reading family membership.
- Refresh root messages, permissions, and forms without syncing its session record a second time.
- Continue refreshing each discovered subagent's session record and details.
- Preserve in-flight refresh deduplication and history-changing refresh behavior.
- Add tests for one root session sync and continued subagent refresh.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change preserves existing dashboard behavior and only removes redundant host API work.

## Impact

- `src/dashboard.tsx`: family discovery and detail refresh sequencing.
- `src/session-tracker.ts`: support detail refresh without repeating the root session sync while retaining other invalidation and sync behavior.
- `src/dashboard.test.mjs` and/or `src/session-tracker.test.mjs`: assert root sync count and family refresh behavior.
- No API, dependency, or user-facing behavior changes.
