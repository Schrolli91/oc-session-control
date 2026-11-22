# Tasks

## 1. Implementation

- [x] 1.1 In `src/costs.mjs`, make `buildSessionCostRows` omit the “Subagents:” row when `subagentCount === 0`, and verify `node --test "src/**/*.test.mjs"` passes.
- [x] 1.2 In `src/costs.test.mjs`, add a test that no “Subagents:” row is returned with `subagentCount === 0` while Mainagent and Saved stay present, and that a subagent count of 1 with a `$0.0000` total still returns the row — verify with `node --test src/costs.test.mjs`.
- [x] 1.3 Fix the cache-savings test in `src/costs.test.mjs` that indexes the Saved row by position (`[2]`) so it locates the row by label instead, and verify `node --test src/costs.test.mjs` passes.

## 2. Integration checks

- [x] 2.1 Run `npm test` and `npm run check` and verify both succeed.
- [ ] 2.2 In a running OpenCode session without subagents, verify “Session usage” shows only “Mainagent:” and “Saved (est.):”; with a subagent, verify “Subagents:” reappears.
