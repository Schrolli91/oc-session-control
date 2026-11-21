# Design

## Context

See `proposal.md` for the symptom and `specs/oc-session-control/spec.md` for expected behavior. `rows` currently creates new objects when session data refreshes; `subagentRows` sorts those objects and the UI passes them directly to Solid's `For`. The main row renders outside that list. Existing tests cover status ordering, but there is no automated TUI component harness.

## Goals / Non-Goals

**Goals:**

- Preserve each subagent component across unrelated session refreshes.
- Keep current status-priority ordering, live values, actions, and spinner animation.
- Verify with the four idle test agents and a running subagent.

**Non-Goals:**

- Changing session refresh logic, spinner timing, title sizing, or status priorities unless the stable-identity test shows they remain part of the issue.
- Adding a UI framework or dependency.

## Decisions

1. **Use stable session IDs as the subagent list identity.** Sort current subagent rows by existing status priority, iterate their `sessionID` values, and resolve each row's current data reactively by ID. Solid can then preserve a row when its data object is replaced and move it when priority changes. Passing freshly rebuilt row objects directly to `For` is rejected because object identity changes on refresh; index-only identity is rejected because status sorting can move a different session into an index.

2. **Leave the spinner and row layout unchanged initially.** The main row is stable while idle subagent rows flicker during main-session updates, which points first to list identity. Keep spinner updates and title sizing intact during the test so the fix addresses row replacement rather than hiding animation or layout behavior. If stable IDs do not stop the flicker, investigate title measurement and renderer updates next.

3. **Test both ordering and live rendering.** Keep or extend the helper test for status-priority order and verify stable ID selection. Then manually run the TUI with idle subagents while the main session updates, and with one working subagent to confirm its spinner rotates and its row stays associated with the right session. If flicker remains, record when it happens, inspect whether the row remounts or its width changes, apply a focused follow-up, and repeat before closing the change.

## Risks / Trade-offs

- [Reactive lookup by ID could leave a row with stale callbacks] → Verify navigation and model actions still target the matching session after refresh and reorder.
- [Status changes legitimately reorder rows] → Use session IDs, not array positions, as identity and test every status group.
- [Stable identity may not remove flicker if width measurement is also involved] → Continue with the title-size/render path only if the stable-ID test fails.

## Migration Plan

No persisted data or API migration is needed. Change the subagent list identity, run helper tests, then perform the live checks. Roll back the list-identity change if it breaks ordering or actions; do not reduce spinner animation to mask the symptom.
