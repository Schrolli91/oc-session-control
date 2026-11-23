# Design

## Context

`Dashboard.refreshFamily()` owns the initial root sync and family discovery. `refreshSession()` currently invalidates and syncs the session record along with messages, permissions, and forms. The initial sync is outside the tracker's in-flight refresh map.

## Goals / Non-Goals

**Goals:**
- Let the dashboard refresh root detail collections after family discovery without invalidating or syncing the already refreshed root session record.
- Keep normal event-driven and subagent refreshes unchanged.
- Preserve deduplication when overlapping refresh requests require different work.

**Non-Goals:**
- Change family discovery timing, displayed data, or event handling.
- Deduplicate the initial family-discovery sync with independently triggered host events.

## Decisions

- Add a `session` option to `refreshSession()`, defaulting to `true`. When false, skip only session invalidation and session sync; continue messages, permissions, and form refresh as before. This keeps the optimization local to the root detail refresh and preserves existing callers.
- Track both message-history and session-record work on each in-flight refresh. Reuse a pending refresh when it includes all requested work; otherwise chain the requested work after it settles. This extends the existing history-changing deduplication rule to the new option. An alternative was to always share a pending promise, but that could swallow a normal session refresh requested while a detail-only refresh is pending.
- After the initial root sync and family lookup, pass `session: false` only for the root and keep default refresh behavior for each subagent. Tests will check root sync count and that root detail collections and subagent refreshes still run.

## Risks / Trade-offs

- A skipped session invalidation could leave stale root data if the initial sync does not update the host cache → the initial sync already precedes family lookup and is the authoritative update for this dashboard refresh; tests verify no later invalidation occurs on the detail-only path.
- A concurrent full event refresh can still sync the root independently → this is intentionally outside dashboard-owned duplicate work, and existing in-flight deduplication remains in force for tracker-managed calls.
