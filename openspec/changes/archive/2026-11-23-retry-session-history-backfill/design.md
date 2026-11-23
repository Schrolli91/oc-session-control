# Design

## Context

See proposal.md - Why. The host exposes `message.loading(id)` as reactive state, but it does not expose a promise for a page load started elsewhere. `message.loadMore(id, { all: true })` returns early while that state is true.

## Goals / Non-Goals

**Goals:**
- Resume the backfill when an external page load clears its loading state.
- Keep lightweight refreshes unchanged and stop waiting safely on tracker disposal.

**Non-Goals:**
- Change host pagination or initiate duplicate page loads.
- Reload history during status or execution refreshes when history is already loaded.

## Decisions

- Observe `message.loading(id)` with a Solid effect and resolve a waiter when it becomes false. This uses the host's reactive state without polling; wrapping `loadMore` cannot observe calls the host starts outside the tracker.
- After waking, recheck `more(id)` and `loading(id)` before calling `loadMore(id, { all: true })`. This handles a page load that exhausts history or another load that starts before the backfill resumes.
- Track active waiters and resolve them during disposal. This prevents refresh promises from remaining pending after the tracker is disposed.
- Test with Solid signals so the active-load completion and exhausted-history cases are deterministic. Do not add timers or dependencies.

## Risks / Trade-offs

- [Host loading state is not reactive] → The current host API exposes it as Solid-backed state; tests exercise the same reactive contract.
- [Tracker disposal occurs while waiting] → Resolve and dispose each waiter during tracker cleanup.

## Migration Plan

No migration. The change is internal to the session tracker.
