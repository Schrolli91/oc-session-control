# Proposal

## Why

`createSessionTracker()` prevents new refreshes after disposal, but an in-flight refresh can continue after an awaited sync settles and start further host API calls or form updates. Disposal should stop that pending lifecycle while allowing already-started promises to settle safely.

## What Changes

- Stop pending refresh continuations from starting additional sync, invalidation, or form work after tracker disposal.
- Preserve idempotent disposal, listener cleanup, and safe settlement of pending refresh promises.
- Add coverage for disposing while a refresh sync is pending.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: require pending session refresh work to stop after tracker disposal.

## Impact

- Affected code: `src/session-tracker.ts` and `src/session-tracker.test.mjs`.
- Affected spec: `openspec/specs/oc-session-control/spec.md` through a delta spec.
- No public API or dependency changes are intended.
