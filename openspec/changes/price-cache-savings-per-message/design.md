# Design

## Context

`aggregateUsage` (src/usage.mjs) currently prices savings once per session: it takes the session's lifetime `tokens.cache.read` counter, requires that the whole session resolve to exactly one model, and multiplies by that model's `input − cache.read` delta. Any second model — from an assistant call on a different model *or* simply from the session's selected model — sets one family-wide `hasUnpricedCache` flag that collapses `savedCost` to `undefined`.

The raw material for a per-call estimate already exists: every assistant message carries its own model and its own `tokens.cache.read`, and `models(sessionID)` resolves pricing for each. The lifetime counter is the sum of those per-call reads, so both approaches agree when a session has one model.

Token *aggregation* (input/cacheRead/cacheWrite/output/reasoning for the usage overview) is independent of pricing and keeps using lifetime counters — see Non-Goals.

## Goals / Non-Goals

**Goals:**
- Model switches stop invalidating the estimate.
- Coverage loss is reported at the granularity it actually occurs (one session), not family-wide.
- The estimate row degrades the same way the cost rows already do, so the three rows read consistently.

**Non-Goals:**
- Changing how token totals, bars, cache rates, or costs are computed.
- Applying context-window price tiers to cache reads (still the base tier only, as today).
- Recovering savings for calls that are no longer in the message list.
- Making the estimate survive a session whose messages are unavailable.

## Decisions

**1. Price per assistant call instead of per session.**
`saved = Σ over calls: cacheRead_call × (inputRate_model(call) − cacheReadRate_model(call)) / 1e6`.
*Why:* each call already carries the model it was billed under, so the lifetime counter no longer has to be attributed to one model. *Alternative considered:* keep the lifetime counter and record per-model split counters — rejected, the host does not expose a split and the plugin cannot derive one.

**2. Return a coverage summary, not a boolean.**
`aggregateUsage` returns `saved: { total, known, missing }`, reusing the shape `aggregateCosts` already produces, and `buildSessionCostRows` renders it through the existing `formatTotal`, which already yields `unavailable` for `known === 0` and appends ` (partial)` for `missing > 0`.
*Why:* the degradation rule then exists in one place instead of two, and the three cost rows become consistent. *Alternative considered:* a `partial: boolean` flag next to `savedCost` — rejected, it duplicates `formatTotal`'s logic.

**3. A session contributes `missing` when its cache reads cannot be fully attributed, `known` otherwise.**
A session is `missing` when its cache-read counter is unusable, when it reports cache reads but has no usable message list, when its history contains a completed compaction (older calls are gone), or when any cache-read-bearing assistant call cannot be resolved to a model with both required prices. A session with zero cache reads contributes `known` at `0`, so an all-zero family still renders `~$0.0000`.

**4. Compaction downgrades to partial instead of unavailable.**
Today a compaction in any session blanks the row for everyone. Under the new rule that session is `missing` and the rest of the family's priced savings still show, with ` (partial)` attached. *Why:* the number that remains is a lower bound that is explicitly labelled as such, which is what `formatTotal` already communicates for costs.

## Risks / Trade-offs

- [The per-call sum can differ from the lifetime counter when messages are missing without a compaction marker] → Such a session is under-reported. Accepting it: the alternative (comparing the sum against the lifetime counter to detect gaps) risks flagging nearly every session, because hosts legitimately drop failed or retried calls.
- [More work per render: every assistant message is now visited for pricing] → `aggregateUsage` already walks the same messages for the compaction and model checks, and it is memoized per session family; the added pass is O(messages) with a model lookup per call.
- [A session whose model is missing from the catalog now downgrades the row where it previously might not have] → Intended: it is exactly the case the requirement calls `unavailable`/`partial` rather than a number without a price.
- [Behaviour change is visible in the sidebar] → The only visible difference is that rows which used to read `unavailable` now read a price or a price with ` (partial)`.

## Migration Plan

None. Pure display/derivation change behind the existing `Saved (est.):` row; no persisted state, no host API, no dependency change. Rollback is a revert.

## Open Questions

None.
