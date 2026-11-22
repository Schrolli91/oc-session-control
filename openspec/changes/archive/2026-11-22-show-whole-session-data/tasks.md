# Tasks

## 1. Read the whole session transcript

- [x] 1.1 Backfill every remaining message page in `refreshSession` (`src/session-tracker.ts`): after the existing syncs, call `session.message.loadMore(id, { all: true })` while `more(id)` is true and `loading(id)` is false — verify with a new `session-tracker.test.mjs` case whose fake message store reports `more() === true`, records the `loadMore(all: true)` call, then reports `more() === false`
- [x] 1.2 Keep loaded history across usage refreshes: add a `messages` flag to `refreshSession`, pass it as `false` from `session.usage.updated` and `session.status`, and fall back to a message sync only when the message list is empty — verify with a `session-tracker.test.mjs` case asserting `usage.updated` does not call `message.invalidate`/`message.sync` on a non-empty list, does call them on an empty list, and that `session.compaction.ended` still syncs unconditionally
- [x] 1.3 Do not let a history-changing refresh be swallowed by a lighter one already in flight: when `refreshSession` is called with `messages: true` while a `messages: false` refresh is running, chain the message sync behind it instead of returning the in-flight promise — verify with a `session-tracker.test.mjs` case that starts a light refresh, then a history-changing one, and asserts `message.sync` runs exactly once

## 2. Price the whole session

- [x] 2.1 Return `{ total, known, missing }` from `sessionSavings` and accumulate `saved.total` on `known` plus `saved.missing` on partial coverage in `aggregateUsage` (`src/usage.mjs`) — verify by replacing the existing "marks only the compacted session as unpriced" test with one asserting a compacted session contributes its priced calls and surfaces `$X (partial)`, plus a case where nothing can be priced and the row stays `unavailable`
- [x] 2.2 Skip assistant calls that report no cache-read count instead of failing the session (`if (read == null) continue`) — verify with a new `usage.test.mjs` case where one of three calls has no `tokens.cache.read` and the other two are still priced
- [x] 2.3 Report `summedRead < cacheRead` without a recorded compaction as partial (`{ known: true, missing: true }`) — verify with a new `usage.test.mjs` case whose lifetime `cacheRead` exceeds the visible calls' sum and assert `missing` is set while the priced total is still returned

## 3. Integration checks

- [x] 3.1 Run `npm test` and confirm every suite passes with the updated expectation — verify with the full test output
- [x] 3.2 Run `npx tsc --noEmit` and `openspec validate --specs` — verify both exit clean apart from the known pre-existing >500-character warning

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
