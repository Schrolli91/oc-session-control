# Proposal

## Why

Clickable dashboard actions currently run on mouse-up even when the press began elsewhere or became a drag. Requiring a completed, uninterrupted left click makes navigation and other actions predictable.

## What Changes

- Trigger dashboard actions only after an uninterrupted left-button press and release on the same control.
- Apply the behavior to subagent navigation, model details, the update hint, skill insertion, and collapsible headers.
- Keep nested actions isolated from their containing agent row.
- Test completed clicks, drags, and non-left clicks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Define completed left-click behavior for interactive dashboard controls and preserve nested interactions.

## Impact

- `src/dashboard-components.tsx` and `src/dashboard.tsx` mouse handlers.
- `src/dashboard.test.mjs` click-handler and dashboard interaction coverage.
- Interactive controls in the session dashboard.
