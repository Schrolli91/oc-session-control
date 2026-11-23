# Proposal

## Why

Issue #30 reports that context values and the main-agent bar remain stale after OpenCode compacts a session. The existing tracker refreshes the transcript on compaction, but the displayed context is derived from each agent’s latest assistant message, so the refresh must reach the data the view model actually reads.

## What Changes

- After compaction, stop showing pre-compaction context as current; show the next real assistant-usage measurement as soon as it arrives, or `unavailable` until then.
- Apply this independently to main agents and subagents, preserve cumulative family totals, and never treat compaction-request tokens as the resulting context size.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: require context values and derived bars to use post-compaction assistant usage, never stale pre-compaction usage or compaction-request tokens.

## Impact

- Affected code: `src/usage.mjs` and tests for usage selection, compaction refresh, and context rows.
- Affected spec: `openspec/specs/oc-session-control/spec.md`.
- No API or dependency changes intended.
