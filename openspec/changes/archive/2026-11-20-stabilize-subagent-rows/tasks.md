# Tasks

## 1. Preserve subagent identity across refreshes

- [x] 1.1 Render the sorted subagent list by stable `sessionID` and resolve current row data reactively; verify status ordering and stable IDs with focused helper tests.
- [x] 1.2 Run `node --test .opencode/plugins/oc-session-control/usage.test.mjs` and verify existing status-priority and session-action behavior remains covered.

## 2. Verify live subagent behavior

- [x] 2.1 With four non-running subagents, update the main session and verify their rows do not flicker; then run a subagent and verify its spinner rotates while its row and actions stay attached to that session.
- [x] 2.2 If any row still flickers, record whether its data or width changes, investigate row identity and layout updates, apply a focused correction, and repeat the live checks until the flicker is resolved.
