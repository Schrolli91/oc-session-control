# Tasks

## 1. Make execution refreshes lightweight

- [x] 1.1 Route the ordinary execution lifecycle handlers through the existing lightweight refresh option; verify loaded-history events refresh session data without message invalidation, sync, or backfill.
- [x] 1.2 Add regression coverage for all execution lifecycle outcomes, the no-history fallback, and a compaction refresh overlapping a lightweight refresh; verify with `node --test src/session-tracker.test.mjs`.
- [x] 1.3 Run `npm test` and verify the full test suite passes without changing existing compaction or transcript-backfill behavior.
