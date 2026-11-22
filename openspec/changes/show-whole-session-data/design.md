# Design

## Context

`session-tracker.ts` refreshes a family session on every usage/status/permission event by calling `session.invalidate/sync` **and** `session.message.invalidate/sync` (`src/session-tracker.ts:107-114`). The client's `message.sync` requests `message.list({ limit: 20, order: "desc" })` and publishes only that response plus still-pending outbox items, so every refresh replaces the store's message array with the newest 20. Older pages pulled in earlier through `message.loadMore` are dropped.

The client exposes what is needed to fix this without any host change: `message.more(id)` reports whether a `messageCursor` is set, `message.loadMore(id, { all: true })` walks all remaining pages in 200-message batches and stops when the cursor runs out (setting `messageCursor` back to `undefined`), and `message.loading(id)` reports an in-flight load.

On the pricing side, `sessionSavings` (`src/usage.mjs:23-61`) returns either `{ total, known: true }` or a bare `{ missing: true }`, so "cannot price anything" and "can price part of it" collapse into one answer. See proposal.md for why.

## Goals / Non-Goals

**Goals:**

- Message-derived values (cache-savings estimate, loaded-skill markers) reflect every message the host still serves.
- Loaded history survives step-by-step usage refreshes.
- A session with partial coverage contributes its priced part and is labelled `(partial)`; only genuinely unpriceable families show `unavailable`.

**Non-Goals:**

- Raising the client's default page size or changing `@opencode/client` (we only call methods it already exposes).
- Host-side changes: `session.tokens` and `session.cost` stay the source for every token and price total.
- F5 (truncation vs. rounding of cache percentages) and the F7 cosmetic items.

## Decisions

### D1 — Backfill with `loadMore(id, { all: true })` guarded by `more(id)`

Called once per family session from `refreshSession`, after the other syncs.

The guard is self-terminating and needs no bookkeeping: `message.sync` writes `messageCursor` from the newest-page response, `more()` is `cursor !== undefined`, and `loadMore({ all: true })` sets the cursor back to `undefined` when the walk finishes. So the first refresh backfills, later refreshes skip, and a later `sync` that re-introduces a cursor (compaction, revert) triggers exactly one new backfill of what the host still serves.

*Alternatives considered:* (a) raise `initialMessageLimit` — it is a `CreateDataInput` option of the client store, not something a plugin can set after creation, and it would only affect the very first read; (b) price whatever is visible without backfilling (the audit's F3 alternative) — the estimate then jumps the moment a page loads, which is worse than being wrong consistently.

### D2 — Stop replacing messages on `session.usage.updated`

That event's own client handler only patches `session.info` (cost/tokens). Assistant messages are appended and completed by `session.step.started` / `session.step.ended` / `session.text.*`, which write into the existing array in place. So our `message.invalidate + sync` on this event does not keep the tail fresher — it only trims the head.

`refreshSession(id, { messages })` gets a flag; `session.usage.updated` and `session.status` pass `messages: false`, which still syncs messages **when the list is empty** (first load) but otherwise leaves it alone. Compaction, revert, `session.created`, `session.forked`, permission and form events keep the unconditional message sync — those are the cases where the host's list genuinely changed, and revert-pruning depends on that sync (audit RB3).

*Alternative considered:* the audit's minimal fix (never sync a non-empty list) — rejected, it would leave reverted sessions stale.

### D3 — `sessionSavings` returns `{ total, known, missing }`

`known` means "a priceable number exists for this session", `missing` means "that number does not cover the whole session". `aggregateUsage` accumulates `total` whenever `known`, and increments `missing` whenever the coverage is partial; `formatTotal` already prints `unavailable` for `known === 0` and appends `(partial)` for `missing > 0`.

Branch outcomes:

| Condition | Result |
|---|---|
| lifetime `cacheRead` invalid / 0 | `{ total: 0, known: true, missing: false }` for 0; `{ known: false, missing: true }` when invalid |
| compaction recorded | `{ total: <priced>, known: total > 0, missing: true }` |
| no assistant calls visible | `{ known: false, missing: true }` |
| a call reports no cache reads | skip that call, keep going (D4) |
| model / prices unavailable | `{ known: false, missing: true }` |
| no visible call reports reads (`summedRead === 0`) | `{ known: false, missing: true }` |
| `summedRead < cacheRead` without compaction | `{ total: <priced>, known: true, missing: true }` (D5) |
| fully attributable | `{ total, known: true, missing: false }` |

This is what makes F1 fall out: a compacted session no longer returns a bare `{ missing: true }`, so it contributes its priced calls and shows `$X (partial)`; if nothing at all could be priced it still shows `unavailable`, as the spec requires.

### D4 — Skip calls that report no cache reads

`if (read == null) continue` before the finite/non-negative check. `missing` exists to mean "a cache read exists that cannot be attributed"; a call without cache reads carries none. `summedRead === 0` still catches a session where *every* call is uncovered.

### D5 — Unattributable lifetime reads are `(partial)`

`summedRead < cacheRead` with no recorded compaction → `{ known: true, missing: true }` rather than reporting the lower bound as complete. With D1 the transcript is complete, so a remaining gap really is reads no visible call explains.

## Risks / Trade-offs

- **`loadMore(all)` walks the whole transcript on a large session** → pages of 200, one pass, then the cursor guard stops. Tool-result payloads are already dropped by the client's `omitToolFileData`, so only text enters the store.
- **Concurrent refreshes start duplicate walks** → gate on `message.loading(id)` as well as `more(id)`.
- **Skipping the message sync on usage updates makes the tail stale if the client ever stops appending assistant messages from step events** → we still sync when the list is empty, and compaction/revert keep syncing. A stale tail would show up as a session whose last call never advances.
- **D5 can label a session `(partial)` for a gap that is harmless** (measured: 8 of 64 sessions, largest deviation 0.01%) → the label is the honest answer, but if the gap turns out to be systematic (e.g. host bookkeeping for title generation), drop the D5 branch and its spec scenario rather than normalising it away.
- **Backfill adds one request round per refresh while a session is not yet fully loaded** → accepted; it stops as soon as the cursor is exhausted.

## Migration Plan

None — no persisted state, config, or API change. Rolling back is a plain revert of `src/session-tracker.ts` and `src/usage.mjs`.

## Open Questions

None. Whether the host books title-generation reads into `session.tokens` is measured rather than assumed: the observed gaps (8/64 sessions) are too rare and too small to be title generation, which runs on nearly every session.
