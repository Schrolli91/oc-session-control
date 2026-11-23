# Design

## Context

See `proposal.md` for motivation and `specs/oc-session-control/spec.md` for the user-visible contract. In `src/tui.tsx`, `insertSkill` checks the current route and skill catalog, then dispatches `prompt.skills` and navigates the native dialog with `dialog.select.home`, repeated `dialog.select.next`, and `dialog.select.submit`. The catalog index is not an identity-bound selection in that picker. `src/dashboard.tsx` routes skill-row mouse-up events into this flow.

The dependency is pinned to `@opencode/plugin` 2.3.2. Its published TUI context types and TUI plugin documentation expose dialogs, keymap commands, data APIs, and slots, but no prompt text mutation or targeted native skill-picker API. The public skill documentation describes manually invoking a skill by entering `@skill-id`. Host editor structure is explicitly not part of the plugin API.

## Goals / Non-Goals

**Goals:**
- Remove the path by which a click can select a different catalog item or appear to insert a skill.
- Keep the dashboard's skill inventory, counts, status, ordering, and token estimates unchanged.
- Keep the user-facing boundary clear: skill invocation is manual, not a dashboard insertion feature.

**Non-Goals:**
- Create a replacement picker, clipboard feature, keyboard command, or prompt-editor integration.
- Change skill discovery, loaded-state derivation, or subagent skill display.
- Depend on undocumented host renderables or internal keymap command IDs.

## Decisions

1. **Make skill rows informational, not actionable.** Remove the `insertSkill` callback path from the plugin entry and dashboard rendering. Keep mouse handlers only where needed for propagation/other controls; a skill-row click must not dispatch a picker, mutate the prompt, or show an insertion-success message. This is safer than trying to translate catalog index to picker navigation because the public API does not expose a stable skill-targeted picker operation.

2. **Do not substitute `ui.dialog.select`.** It is a public selection dialog, but selecting an option would still not provide a supported way to insert its ID into the focused prompt. Adding it would create another selection interaction without delivering the former click-to-insert outcome.

3. **Document manual invocation by exact skill ID.** OpenCode's skill documentation states that a skill can be invoked by mentioning `@skill-id` in the prompt and that IDs are exact and case-sensitive. Update the README to remove the click-to-insert claim and state the limitation and manual path. Do not promise that clicking copies or inserts anything.

4. **Remove picker-specific lifecycle machinery.** With no picker dispatch, the renderer event listener, frame gate, timeout, catalog-index snapshot, and their cancellation/cleanup are unnecessary. Leave route, session, and catalog handling used by the dashboard itself untouched.

## Risks / Trade-offs

- [Risk] Users lose one-click insertion. → Keep the skill list visible and document the supported manual `@<skill-id>` invocation instead of silently degrading or risking a wrong selection.
- [Risk] A future OpenCode release may add supported prompt insertion. → Treat that as a separate follow-up; only restore a clickable action after the public API is present and tested against its identifier semantics.
- [Risk] The manual syntax may be unfamiliar. → Use the exact ID (not the display name) in README wording and keep the distinction explicit.

## Migration Plan

No data or configuration migration is required. In the same release, remove the click behavior and update README wording. Verify the skill-row click with the headless OpenTUI regression test, including unchanged prompt state, and check that README documents the exact `@<skill-id>` syntax. That syntax follows OpenCode's public documentation; this change does not claim a live host invocation test. Rollback, if needed, is a release-level rollback; do not restore the unsupported index-based picker path.
