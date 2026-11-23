# Proposal

## Why

Ordinary execution lifecycle events currently refresh message history as well as session data, which can trigger a full transcript backfill even though the new step messages are already appended in place. Avoiding that redundant work will reduce refresh cost while keeping explicit history-changing events, especially compaction, able to reload messages.

## What Changes

- Treat ordinary execution lifecycle events as lightweight session refreshes that do not invalidate or sync messages when history is already loaded.
- Preserve the fallback message load for sessions with no loaded history and preserve full history refreshes for compaction and other explicit history-changing events.
- Specify and test that the lightweight path does not lose a history-changing refresh that overlaps it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: distinguish ordinary execution refreshes from history-changing updates while retaining complete transcript and compaction behavior.

## Impact

- Affected code: `src/session-tracker.ts` and `src/session-tracker.test.mjs`.
- The existing `oc-session-control` transcript-reading and live-update requirements will gain scenarios for lightweight execution refreshes and retained history updates.
- No public API or dependency changes are intended.
