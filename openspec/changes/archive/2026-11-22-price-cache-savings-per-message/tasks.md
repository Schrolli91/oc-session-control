# Tasks

## 1. Per-call savings estimation

- [x] 1.1 Replace the session-level single-model guard in `aggregateUsage` with a per-session pass that prices every cache-read-bearing assistant call using that call's own model, returning a coverage summary `{ total, known, missing }`; verify with a `src/usage.test.mjs` case where one session's history holds two priced models and the result is a finite total instead of `undefined`
- [x] 1.2 Keep a session with zero cache reads contributing `known` at `0`, and a session with an unusable cache counter or no usable message list contributing `missing`; verify with tests for both a zero-cache family (total `0`, no missing) and a message-less session (`missing > 0`)
- [x] 1.3 Downgrade a completed compaction to `missing` for that session only; verify with a family test where one session is compacted and another still yields a priced total with `missing > 0`
- [x] 1.4 Mark a session `missing` when a cache-read-bearing call resolves to no model or to a model without an input or cache-read price, and `known` when all its calls price; verify both cases in `src/usage.test.mjs`
- [x] 1.5 Rewrite the existing `leaves lifetime cache savings unavailable ...` tests (multi-model, missing pricing, malformed history, compaction) to the new expectations and verify `npm test` passes for `src/usage.test.mjs`
- [x] 1.6 Mark a session `missing` when the lifetime counter books cache reads but no retained assistant call reports any, since such a total would be false rather than a lower bound; verify with a `src/usage.test.mjs` case whose session reports 1M lifetime reads while its only call reports `cache.read: 0`

## 2. Render the estimate row through formatTotal

- [x] 2.1 Change `buildSessionCostRows` to take the coverage summary and render `~${formatTotal(...)}` for it; verify in `src/costs.test.mjs` that `known === 0` still yields `unavailable`, a full family yields `~$0.0000`/`~$1.2345`, and a partial family yields `~$1.2345 (partial)`
- [x] 2.2 Pass the new summary from `usage()?.saved` in `src/dashboard.tsx` and verify the row keeps its label `Saved (est.):` and its position after `Subagents:` and before `Session Total` (assert via the existing cost-rows test and a type check)

## 3. Integration checks

- [x] 3.1 Run the full `npm test` suite and verify no test outside this change regressed
- [x] 3.2 Run `npm run check` and verify the TypeScript build reports no errors
