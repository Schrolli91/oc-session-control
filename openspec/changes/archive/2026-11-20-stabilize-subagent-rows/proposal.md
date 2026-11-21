# Proposal

## Why

Idle subagent rows flicker when the main session updates, while the main-session row stays stable. The code rebuilds agent-row objects and renders subagents through a `For` list, so unstable row identity is the leading cause; the fix must preserve each row across refreshes without suppressing status updates or spinner animation.

## What Changes

- Keep each subagent row associated with its stable session ID while row data refreshes and status-priority ordering changes.
- Preserve live row values, navigation, model actions, and the active spinner.
- Test with idle subagents while the main session updates and with an actively running subagent. If any row still flickers, continue investigating and testing until the cause is isolated and fixed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: keep subagent rows stable across live updates while preserving status ordering and spinner behavior.

## Impact

- Affected code: `.opencode/plugins/oc-session-control/tui.tsx` and any focused helper/tests needed for stable row identity.
- Verification: existing Node tests and manual TUI testing; no API or dependency changes are expected.
