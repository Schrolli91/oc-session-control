# Tasks

## 1. Cost source

- [x] 1.1 Source every rendered cost from the per-session record in `src/dashboard.tsx` — the agent rows, the “Session usage” heading, and the “Subagents:” row — and verify no call to the family-rollup `session.cost()` remains in that file (`grep -n "session.cost" src/dashboard.tsx` returns nothing)
- [x] 1.2 Document the host rollup contract next to the new cost helper and verify the comment names why the rollup must not be used (`grep -n -A1 "rolls the whole family" src/dashboard.tsx` shows the comment above the helper)

## 2. Verification

- [x] 2.1 Run `npm test` and verify the whole suite passes (80 tests, 0 failures)
- [x] 2.2 Run `npx tsc --noEmit` and verify it reports no TypeScript errors
- [x] 2.3 Run `openspec validate "fix-session-cost-family-double-count" --strict` and verify the change reports no validation errors

## Workflow follow-up

- In a running OpenCode session with active subagents, confirm the “Mainagent:” row holds only the main session's own cost, that subagent spend moves only the “Subagents:” row and the heading, and that the two rows add up to the “Session usage” heading (spec scenarios “Count each session's cost once” and “Stop subagent costs from climbing the main row”).
- Open the pull request for this branch after the verification above is green.
- Archive the change after the project's review requirements are satisfied.
