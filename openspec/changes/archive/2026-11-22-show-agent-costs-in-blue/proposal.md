# Proposal

## Why

The cost values on the Mainagent and Subagents entries are rendered in the muted gray used for secondary labels. They recede next to the white agent name, so the price of each session is harder to scan than it should be.

## What Changes

- Render known cost values on the Mainagent entry and every Subagents entry in the plugin's blue accent color.
- Add a dedicated `cost` blue to the light and dark palettes so the color stays independent of host accent changes.
- Keep `unavailable` cost values muted so an unknown price still reads as secondary information.
- Leave the indented Mainagent/Subagents rows under Session usage unchanged; they stay gray.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: the "Break down costs and context per agent" requirement changes so per-agent cost values use the cost blue instead of gray.

## Impact

- `src/dashboard-components.tsx`: the `AgentEntry` cost text color.
- `src/theme.mjs`: a new `cost` blue in both mode palettes.
- `src/agents.test.mjs`: palette assertions include the new color.
- `openspec/specs/oc-session-control/spec.md`: updated after the change is archived.
- No API, dependency, or data-model changes.
