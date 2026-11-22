# Design

## Context

`buildDashboardRows` (src/view-model.mjs) derives one model reference from `usage?.model ?? session.model` and uses it for three things at once: the `Model:` label, the model-details dialog, and the context limit in `contextFillForModel`. Because assistant usage wins, the row keeps reporting the previous model after `/model` even though the host patches `session.model` on `session.model.selected` right away.

The context percentage must not follow that change blindly: its denominator only makes sense next to the token counts it divides, and those counts come from the latest assistant call.

## Goals / Non-Goals

**Goals:**
- The `Model:` row reflects what the session is on as soon as the host publishes it.
- The context percentage keeps using the model that produced its tokens.
- No layout, color, or click-behavior change.

**Non-Goals:**
- Showing both the previous and the new model in one row.
- Changing what the model-details dialog prints for a given model.
- Refreshing on `session.model.selected` (the host client already updates the session store the row reads).
- Any change to cost, savings, or token aggregation.

## Decisions

**1. Split the single `modelRef` into a displayed ref and a usage ref.**
`modelRef = session.model ?? usage.model` drives `modelName` and the dialog; `usageModelRef = usage.model` drives `contextFillForModel`.
*Why:* two different questions ("which model am I on" vs. "how full was the last call's window") with two different sources. *Alternative considered:* keep one ref and show the selection only when there is no usage — that is the current stale behavior. *Alternative considered:* keep one ref but recompute the fill from the selected model's limit — rejected, it divides one model's tokens by another model's limit and is the only way this change could produce a percentage above 100%.

**2. Resolve the two refs against the same model list.**
Both go through `findModel` against `modelsForSession(sessionID)`; the lookup is skipped when the refs are equal so the common case does not scan the catalog twice.

**3. Keep the fallback direction explicit in the row data.**
`modelName` stays `"unavailable"` when neither source yields a ref, preserving the existing behavior for sessions with no selection and no usage.

## Risks / Trade-offs

- [After a switch the dialog can show the new model's prices while the Context row still describes the previous model's call] → Accepted and pinned by the added `Bind context usage to the model that reported it` requirement; the two rows answer different questions and are labelled accordingly.
- [The `Model:` row can change without any assistant call, so it now moves at selection time] → Intended; the host store updates on `session.model.selected` and the row already reads through `session.get`.
- [A session whose selected model is not in the catalog shows the raw model id instead of a friendly name] → Pre-existing fallback (`modelInfo?.name ?? modelRef.id`), unchanged.
- [Two `findModel` scans per row per render] → Linear over a small catalog, inside an already memoized builder; negligible next to the message list it already walks.

## Migration Plan

None. Presentation-only change behind the existing row; no persisted state, no host API, no dependency change. Rollback is a revert.

## Open Questions

None.
