# Proposal

## Why

Sidebar layout widths use terminal cells, but `truncateAgentTitle()` currently counts Unicode code points. Wide characters, combining marks, and emoji sequences can therefore overflow their allocation or be split before the ellipsis.

## What Changes

- Truncate agent, cache, and skill labels by terminal-cell width, including the cell reserved for the ellipsis.
- Keep label width calculations consistent with terminal layout and avoid splitting grapheme sequences where practical.
- Cover wide CJK characters, combining marks, emoji sequences, and exact-fit/truncated ASCII labels in tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Require consistent terminal-cell-aware truncation for sidebar labels.

## Impact

- `src/agents.mjs`, its label call sites in `src/dashboard.tsx` and `src/dashboard-components.tsx`, and related tests.
- Use a suitable terminal-width helper already present in OpenTUI's dependency graph where possible; avoid unrelated API changes.
