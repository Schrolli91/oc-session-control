# Proposal

## Why

Two of the dashboard's displayed values are computed from messages, and both read only the newest page the client fetches by default (`messagePageLimit = 20`): the "Saved (est.)" cache-savings estimate and the loaded-skill markers. Everything else already reads host lifetime counters (`session.tokens`, `session.cost`) and is therefore already the session's real data.

Reading only the newest page produces three wrong answers today: a long session prices its lifetime cache reads under the *newest* model because the older model switch is outside the page (~3× off), a compacted session reports `$0` instead of the calls it can still see, and every usage refresh discards messages that were loaded earlier — so skill-load markers outside the newest page vanish again immediately.

## What Changes

- The dashboard loads **every message page a session still offers**, instead of stopping at the client's newest-20 page (`session.message.loadMore(id, { all: true })` while `more(id)` is true).
- A usage refresh no longer discards already-loaded older messages, so backfilled history survives step-by-step updates.
- The cache-savings estimate prices lifetime cache reads from the **whole transcript**, each call under its own model, instead of failing open on a page-aligned window.
- When the host genuinely no longer serves the calls behind some cache reads (compaction, dropped messages), the estimate reports the priced part plus `(partial)` instead of dropping the session to `$0`.
- An assistant call that reports no cache-read tokens is skipped rather than voiding the whole session's estimate.
- Lifetime cache reads that exceed the sum of the visible calls' reads are reported as `(partial)` instead of presenting a lower bound as a complete figure.

**Out of scope** (unrelated to session data): `formatPercentage` truncation vs. rounding (F5), and the cosmetic items in F7 (`— tok` vs `—`, negative-estimate clamp, context price tiers, `variant` in `sameModel`).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `oc-session-control`: Adds a requirement that the dashboard read the full message transcript rather than only the default newest page, and keeps it across usage refreshes. Extends "Estimate cache savings" with scenarios for page-truncated sessions, calls without cache-read counts, and unattributable lifetime reads.

## Impact

- `src/session-tracker.ts` — `refreshSession` gains the transcript backfill and stops replacing messages on usage updates.
- `src/usage.mjs` — `sessionSavings` return shape (`known`/`missing`/`total`) and `aggregateUsage`'s saved counters.
- `src/costs.mjs` — only if the saved-row rendering needs to distinguish "no number" from "incomplete number".
- Tests: `src/usage.test.mjs`, `src/session-tracker.test.mjs`.
- Host/API: no change; uses the `more`/`loadMore`/`loading` methods already exposed on `@opencode/client`'s session-message store.
- Cost: one full transcript backfill per session (pages of 200), then no repeated backfill as long as nothing re-trims the list.
