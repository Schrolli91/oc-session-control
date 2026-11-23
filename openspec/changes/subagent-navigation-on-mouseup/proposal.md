# Proposal

## Why

Subagent rows currently navigate on mouse-down, so a press that becomes a drag or text selection can open a session unintentionally. Aligning navigation with a completed left click makes row interaction predictable while preserving nested model actions.

## What Changes

- Trigger subagent navigation on left-button release rather than press.
- Keep nested model clicks isolated from row navigation.
- Add an interaction test for completed clicks and canceled press/drag behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Define completed left-click behavior for subagent navigation and preserve nested model interactions.

## Impact

- `src/dashboard-components.tsx` row mouse handlers.
- `src/dashboard.test.mjs` headless mouse interaction coverage.
- `openspec/specs/oc-session-control/spec.md` subagent interaction requirement.
