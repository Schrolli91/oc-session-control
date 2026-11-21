# Design

## Context

See `proposal.md` for the motivation and `specs/session-usage-dashboard/spec.md` for the desired behavior. The plugin already aggregates persistent counters for Input, Cache Reads, Cache Writes, Output, and Reasoning across the deduplicated agent family. `tui.tsx` currently renders them as flat rows; `UsageStat` right-aligns labels and values. Existing Node tests cover pure helpers in `usage.mjs`.

## Goals / Non-Goals

**Goals:**
- Derive the confirmed group totals and subcategories from existing counters without adding subcategories again to the session total.
- Distinguish missing or conflicting fields from actual zero values.
- Integrate compact grouping, indentation, right-aligned numbers, and proportional full-width bars for Input and Output into the existing sidebar.

**Non-Goals:**
- Change the cache hit rate, cache TTL, cost/savings calculations, agent list, or context usage.
- Introduce a new API, dependency, or separate statistics view.

## Decisions

1. **Reuse existing persistent family aggregation.** Raw counters remain deduplicated per session and summed across the main session and known subagents. This preserves compaction resilience and avoids recomputing totals from potentially shortened message histories. Alternative: reaggregate all assistant messages; rejected because turns removed by compaction could be lost.

2. **Derive groups from aggregated raw counters.** OpenCode stores `output` as visible response output, excluding Reasoning. Input total is `input + cache.read + cache.write`; Cache miss is `input`, Cache hit is `cache.read`, and Cache write is `cache.write`. Output total is `output + reasoning`; Reasoning is `reasoning`, and Response is the reported `output`. Session total is Input total plus Output total across the agent family. Thus, displayed subcategories sum to their group and are not counted twice.

3. **Track availability per field.** The aggregator distinguishes missing or invalid counters from `0`; a group value appears only when all required fields are available across sessions with usage data. Available individual subcategories may still appear when another subcategory is missing. Alternative: treat missing fields as zero; rejected because this would invent values and understate totals.

4. **Collapsible sections and token layout.** Clicking “Session usage,” “Session Total,” or “Cache” toggles only that section’s details; all start expanded. Headings have no colons, and blank lines separate the sections. Cost rows under “Session usage” are gray and indented; Cache detail rows are indented. All content under “Session Total” is indented relative to the heading; subcategories align with Input/Output. The main session’s skill list starts collapsed while loaded skills remain visible. Token sublabels have no colons; Cache Hit/Miss/Write are capitalized. Reasoning is purple, Response blue; Input uses ↓ and Output ↑. Subcategories have colored squares with neutral labels and values. Theme-colored bars span the available width and appear directly above their group heading. Subtle solid lines with centered “Mainagent” and “Subagents” labels separate Cache from the main entry and the main session with its skills from subagent entries; each line has a preceding blank line. If a label does not fit the sidebar, omit it but keep the line solid. No extra subagent heading is shown. Session Total means cumulative Input and Output tokens across the agent family, not context-window usage. With no subagents, show their costs as `$0.0000`; with no loaded skills, show only `—` for Estimated tokens.

5. **Stable boundary for parallel implementation.** `usage.mjs` adds `buildUsageBreakdown(usage)` with `sessionTotal`, `input: { total, cacheHit, cacheMiss, cacheWrite }`, and `output: { total, reasoning, response }`; unavailable values are `undefined`. `usageBarWidths(values, width)` returns integer segment widths that sum exactly to `width`, or `undefined` for invalid, missing, or empty distributions. Existing raw counters remain unchanged. The UI can independently use this contract in `tui.tsx`; documentation changes are limited to `README.md`.

6. **Pure helper tests instead of a TUI dependency.** Breakdown and segment-width functions, plus missing and inconsistent cases, are tested in the existing `node:test` tests for `usage.mjs`; the actual sidebar layout and full-width bars are also checked manually in the TUI. No new test library is introduced.

7. **Collapse Cache; collapse skills by default.** The Cache heading toggles the indented “Last call” and “TTL” rows; its hit rate remains visible, and the timer continues while collapsed. The main session’s skill overview starts collapsed; loaded skills remain visible, and clicking the heading toggles unloaded skills.

## Risks / Trade-offs

- [The meaning of individual token fields may differ across provider/OpenCode versions] → Derive values only from existing session counters and test the agreed mappings with fixtures; do not silently estimate from alternate fields.
- [Additional indentation uses sidebar width] → Right-align values, keep labels short, and retain the existing single-line value layout.
- [Rounding segment widths may create a gap or overflow] → Distribute cell widths across the actual line width and assign any remainder deterministically to a visible segment.
- [A missing counter hides group totals] → Omit only affected totals and continue showing computable individual values rather than presenting incomplete totals as complete.

## Migration Plan

No data migration is required. The new UI replaces the flat token list; existing session counters, persisted data, and other dashboard sections remain unchanged. A rollback can restore the previous flat rows without modifying stored data.
