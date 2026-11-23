# Design

## Context

`refreshSession()` starts session, message, and permission syncs together, then may backfill transcript pages and refresh form state. `dispose()` sets a lifecycle flag, removes listeners, clears caches, and drops the refresh registry, but currently does not gate the async continuation.

## Goals / Non-Goals

**Goals:**
- Treat disposal as a boundary after which pending refreshes start no more host operations.
- Preserve existing promise rejection behavior for failures that occurred before disposal.
- Keep disposal idempotent and let in-flight operations settle normally.

**Non-Goals:**
- Cancel host calls that have already started.
- Change event routing or refresh coalescing behavior.

## Decisions

- Check the disposed flag after awaited sync groups and transcript backfill, and before starting form operations. This is the smallest change and uses the existing lifecycle state instead of introducing an abort mechanism that host APIs do not expose.
- Keep `Promise.all` and existing rejection handling unchanged. Disposal does not reject pending work; already-started operations settle, while event-driven refreshes retain their existing catch handler.
- Test a held sync across disposal and assert that transcript loading and form invalidation/sync do not start after release.

## Risks / Trade-offs

- A host operation already started before disposal can still mutate host-owned state. It cannot be canceled here; gating continuations prevents further plugin-initiated work.
