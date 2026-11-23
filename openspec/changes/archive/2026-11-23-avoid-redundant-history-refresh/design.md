# Design

## Context

See proposal.md - Why. `refreshSession` already supports `messages: false` for usage and status events, including a fallback to load messages when the session has no loaded history. Compaction uses the default history-refresh path. Execution lifecycle handlers currently call the default path; the in-flight refresh logic queues a history-changing refresh behind a lighter one when necessary.

## Goals / Non-Goals

**Goals:**
- Route ordinary execution lifecycle events through the existing lightweight refresh path.
- Preserve session, permission, and form refreshes, the empty-history message fallback, and explicit history reloads.
- Keep behavior covered at the event-handler boundary, including the overlap between a lightweight refresh and compaction.

**Non-Goals:**
- Change the refresh scheduler, message pagination/backfill behavior, execution status display, or event subscriptions.
- Broaden which events are classified as history-changing or introduce a new refresh API.

## Decisions

- Pass the existing lightweight refresh option from execution lifecycle handlers rather than changing `refreshSession`. This keeps the classification local to event wiring and reuses the established fallback and in-flight upgrade behavior. An alternative was to redefine the refresh default, but that would risk silently making other events lightweight.
- Keep compaction on the full history-refresh path. This preserves current behavior for a known history-changing event instead of inferring history changes from execution results.
- Test the observable refresh effects through registered event handlers: loaded history is not invalidated/synced/backfilled for ordinary execution events; empty history still loads; and a compaction request overlapping a light refresh performs a history refresh. Retain the existing session-family coverage for root and affected subagent refreshes.

## Risks / Trade-offs

- [A history-changing host event is treated as an ordinary execution event] → Keep explicit history-changing events, especially compaction, on the full-refresh path; do not broaden the lightweight classification without confirming event semantics.
- [Message-derived values appear stale if execution events are not reflected in the loaded cache] → This approach relies on the existing tracker assumption that ordinary execution step events append messages in place; preserve the no-history fallback and verify history refreshes remain available for explicit changes.
