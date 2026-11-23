# Proposal

## Why

Issue #29 notes that users cannot tell the model name opens model details. Underlining clickable model names makes that mouse action discoverable for both the main session and subagents.

## What Changes

- Underline each model name when it can open model details; keep unavailable, non-clickable model labels unadorned.
- Preserve the existing gray row, click behavior, and native model-details dialog.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Specify the visual cue for clickable model names and its absence when no model can be opened.

## Impact

- `src/dashboard-components.tsx` — apply underline styling to the clickable model-name text.
- `src/dashboard.test.mjs` — verify the cue for main-session and subagent model names, and its absence when a model is unavailable.
- No API, dependency, or packaging changes.
