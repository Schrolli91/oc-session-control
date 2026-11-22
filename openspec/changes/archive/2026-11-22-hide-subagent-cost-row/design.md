# Design

## Context

`buildSessionCostRows(mainCost, subagentCosts, subagentCount, saved)` in `src/costs.mjs` always returns three rows, fabricating `$0.0000` for the Subagents row when `subagentCount === 0`. `src/dashboard.tsx` renders the returned array with `<For>`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Omit the “Subagents:” and “Mainagent:” rows when the family has no subagent — the heading already carries the whole total, so the Mainagent row would only repeat it. Keep “Saved (est.):” always visible.

**Non-Goals:**
- Changing the “Session usage” heading total, the per-agent list, or any other cost row.
- Hiding the rows when subagents exist but cost `$0.0000` — visibility follows subagent count, not price.

## Decisions

- **Filter inside `buildSessionCostRows`, not in the JSX.** The row list is already data-driven and unit-tested there (`src/costs.test.mjs`); the dashboard keeps rendering whatever rows it gets. Alternative rejected: a conditional in `dashboard.tsx` would split one behavior across two files and need a render test.
- **Decide on `subagentCount === 0`, not on price.** A subagent at `$0.0000` is real information (something ran, nothing billed); hiding it would mask that. Alternative rejected: `subagentCosts.total > 0` hides live subagents.

## Risks / Trade-offs

- Heading has no indented cost rows left without subagents → the spec now says the heading alone carries the total in that case, so no row sum contradicts it.
- `src/dashboard.test.mjs` renders without subagents and asserted `/Mainagent:/` → the assertion flips to the row being absent; the heading still shows `$1.2345`.
- Tests asserting the `$0.0000` row without subagents must be updated, not deleted.
