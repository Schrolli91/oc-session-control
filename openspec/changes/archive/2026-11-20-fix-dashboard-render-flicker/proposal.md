# Proposal

## Why

While a session is active, the main-agent context bar visibly flickers even when its percentage and token values appear stable. Pausing the spinner did not stop it, while temporarily rendering the context bar at a fixed width without per-segment flex measurement did; the session headings were also reported to flicker and still need explicit verification.

## What Changes

- Render all proportional context and usage bars across the full available width without the per-segment flex/size-measurement behavior implicated by the diagnostic test.
- Remove temporary diagnostic UI and restore the normal animated spinner.
- Verify full-width bars, the active spinner, and session headings in the live TUI during work and resizing. If any flicker remains, continue investigating and testing until the remaining cause is isolated and addressed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-usage-dashboard`: require full-width proportional bars and stable rendering of bars and session headings, while preserving their values and the normal spinner animation.

## Impact

- Affected code: `.opencode/plugins/session-usage-dashboard/dashboard-components.tsx` and `tui.tsx`.
- Affected verification: helper tests and the live TUI checklist; no API or dependency changes are expected.
