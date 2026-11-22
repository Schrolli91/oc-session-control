# Design

## Context

`buildSessionCostRows(mainCost, subagentCosts, subagentCount, saved)` in `src/costs.mjs` always returns three rows, fabricating `$0.0000` for the Subagents row when `subagentCount === 0`. `src/dashboard.tsx` renders the returned array with `<For>`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Omit the “Subagents:” row when the family has no subagent, without touching Mainagent or Saved (est.) rows.

**Non-Goals:**
- Changing the “Session usage” heading total, the per-agent list, or any other cost row.
- Hiding the row when subagents exist but cost `$0.0000` — visibility follows subagent count, not price.

## Decisions

- **Filter inside `buildSessionCostRows`, not in the JSX.** The row list is already data-driven and unit-tested there (`src/costs.test.mjs`); the dashboard keeps rendering whatever rows it gets. Alternative rejected: a conditional in `dashboard.tsx` would split one behavior across two files and need a render test.
- **Decide on `subagentCount === 0`, not on price.** A subagent at `$0.0000` is real information (something ran, nothing billed); hiding it would mask that. Alternative rejected: `subagentCosts.total > 0` hides live subagents.

## Risks / Trade-offs

- Heading no longer equals a visible row sum when only Mainagent shows → the heading still equals the sum of *visible* rows, since hidden rows contribute zero.
- Tests asserting the `$0.0000` row without subagents must be updated, not deleted.
