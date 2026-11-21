# Proposal

## Why

The existing session token values are shown as a flat list, which makes it hard to see total context usage or the composition of Input and Output at a glance. A compact, grouped view inspired by the provided screenshot makes current agent-family usage easier to read.

## What Changes

- The sidebar usage overview becomes a hierarchical token view with a session total for Input and Output, an Input breakdown by Cache hit/miss/write, and an Output breakdown by Reasoning/Response.
- Input and Output each get a full-width bar directly above the group heading; segments show the relative shares of subcategories.
- Values cover the current session, including its subagent runs, and use only available usage data.
- Session token labels have no colons; Cache subvalues begin with capital letters. Subcategories align with their Input/Output row; Reasoning is purple and Response is blue.
- If no skills are loaded for the main agent, Estimated tokens shows only `—`.
- Subtle solid dividers have centered “Mainagent” and “Subagents” labels; no additional subagent group heading is shown.
- Subagents are sorted by status: waiting, running, failed, successful, aborted, then idle/unknown. Their existing order is preserved within each status group.
- “Session usage,” “Session Total,” and “Cache” have no colons and are clickable sections, expanded by default. Indented gray cost rows for “Mainagent:”, “Subagents:”, and “Total saved:” appear under “Session usage”; the agent-family total remains in the heading. “Last call” and “TTL” are indented under Cache. The main session’s skill list starts collapsed. Blank lines separate the sections.
- Existing cost, Cache, and agent displays remain; the new hierarchy replaces the previous flat token list.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-usage-dashboard`: Display the agent-family token overview hierarchically, with group totals and available subcategories.

## Impact

- The session usage display and its token aggregation in the local TUI plugin at `.opencode/plugins/session-usage-dashboard/` are affected.
- Existing persistent session counters and aggregation across the main session and subagents are reused; the specification and README are updated.
- No API or dependency changes are planned.
