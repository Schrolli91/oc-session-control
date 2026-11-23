# Tasks

## 1. Per-session cache statistics

- [x] 1.1 Add per-session cache hit-rate and latest-call calculations while preserving the weighted family rate; add usage tests for distinct agent counters, same-session call-to-call changes, and unavailable values, then verify with `npm test`.

## 2. Per-agent Cache display and TTL

- [x] 2.1 Render the family Cache heading and one-level-indented `◆ Mainagent`/Subagent rows (hiding the duplicate main rate without subagents) with white Cache icons, alignment, truncation, one-cell gap, and foreground/muted colors; reuse the icons in cost rows and dividers without changing their colors; add dashboard rendering tests for the family total and each agent's own values, then verify with `npm test`.
- [x] 2.2 Drive each agent's TTL from its own latest assistant-call timestamp using one shared live timer; add tests for independent ages, missing timestamps, and color thresholds, then verify with `npm test`.

## 3. Refresh and integration verification

- [x] 3.1 Verify usage and execution events refresh the affected main or subagent values; add or update session-tracker coverage where needed and verify the focused tests pass.
- [x] 3.2 Run `npm test`, `npm run check`, and `npm run build`; verify the dashboard renders the family rate plus per-agent cache details without changing the existing top-level Cache toggle.
