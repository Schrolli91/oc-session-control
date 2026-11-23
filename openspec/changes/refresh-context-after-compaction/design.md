# Design

## Context

See proposal.md - Why. `session.compaction.ended` already requests a history-changing refresh. Each agent's context row and the main context bar are derived from that session's latest assistant usage in its message list; current tracker tests verify refresh calls, not the resulting displayed values.

## Goals / Non-Goals

**Goals:**
- Make the compaction refresh observable through the data used to derive affected agent context.
- Preserve per-session context/model attribution, cumulative family counters, and unavailable handling.
- Cover main and subagent compaction, including refresh overlap where applicable.

**Non-Goals:**
- Change how context usage is calculated or how cumulative session totals survive compaction.
- Refresh unrelated agent histories or add host APIs and dependencies.

## Decisions

- Keep compaction on the existing history-changing event path. It already invalidates and syncs message history and queues behind an in-flight lightweight refresh; changing ordinary execution refresh semantics is out of scope.
- Treat a completed compaction message as a context-usage boundary: older assistant usage is no longer current, while a later assistant usage remains eligible.
- Do not use the compaction message or `session.compaction.ended` token counts as the resulting context size; those counts describe the compaction request itself.
- Test observable context rows and the main bar's source percentage for main and subagent sessions, while verifying unrelated rows remain unchanged. Preserve `unavailable` until valid post-compaction assistant usage arrives.
- Keep cumulative family totals sourced from session counters; compaction must not replace them with shortened message history.

## Risks / Trade-offs

- [The host may not expose post-compaction assistant usage] → Keep context unavailable rather than infer a value from cumulative counters or selected model alone.
- [A tracker-only test may miss stale reactive data] → Assert refreshed values through the view-model path as well as event-handler refresh effects.

## Migration Plan

No migration or rollback is needed. The change is internal to refresh and display behavior.
