# Proposal

## Why

The sidebar does not make it clear which skills are available to the main session or which have already been loaded. A clickable skill list makes available skills visible and lets users insert a selected skill into the chat prompt; for subagents, showing only the skills actually loaded is sufficient.

## What Changes

- A skill list for the main session shows all skills visible to it from the host with gray status dots; successfully loaded skills get blue dots and appear first in load order, followed by unloaded skills.
- Clicking a skill inserts its native `@skill` reference into the chat input without submitting the message.
- Under each subagent, only its loaded skills are shown in load order as a comma-separated, non-clickable text block.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-usage-dashboard`: Extend sidebar requirements with the skill overview and loaded skills for the main session and each subagent.

## Impact

- Affected: `.opencode/plugins/session-usage-dashboard/tui.tsx`, and possibly skill state logic in `usage.mjs` and `usage.test.mjs`.
- Uses the host’s TUI skill data and the existing sidebar extension; native prompt insertion must use the supported OpenCode TUI version.
- Assumption: `[AT]skill` refers to the skill’s native `@skill` reference/attachment. Clicking inserts it into the prompt without submitting it.
