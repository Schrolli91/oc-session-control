# Proposal

## Why

Clicking a skill currently calls private picker command IDs and assumes the picker order still matches the cached catalog. If either assumption changes, the wrong skill could be chosen; the flow also depends on undocumented host-renderer behavior. The public TUI API in the pinned `@opencode/plugin` 2.3.2 exposes dialogs and keymap dispatch, but no API to insert text into the prompt or target a skill in the native picker.

## What Changes

- Remove the unsupported skill-click-to-picker/insertion behavior rather than risk inserting a different skill or claim a supported integration that does not exist.
- Keep the skill list and its existing informational content; make its rows non-actionable and document that users can invoke a skill by entering `@<skill-id>` in the prompt.
- Preserve the mouse behavior of other dashboard controls. Do not add a custom picker, clipboard integration, keyboard binding, or host-renderer workaround.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: replace the unsupported click-insertion contract with an informational, non-clickable skill list and documented manual invocation.

## Impact

- `src/tui.tsx` and skill-row rendering in `src/dashboard.tsx`; related tests and README skill-use wording.
- No new dependency or host API. The pinned public API provides `context.ui.dialog.select` and `context.keymap.dispatch`, but neither provides prompt insertion; command IDs such as `prompt.skills` and `dialog.select.*`, editor internals, and frame-gating are not a supported route for this feature.
