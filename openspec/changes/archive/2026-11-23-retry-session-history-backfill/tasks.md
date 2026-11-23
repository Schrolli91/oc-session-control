# Tasks

## 1. Queue history backfill after active loads

- [x] 1.1 Observe reactive message loading and retry whole-history backfill after it clears; verify active-load and exhausted-history tests pass.
- [x] 1.2 Verify disposal resolves pending load waiters and existing lightweight-refresh tests remain green.

## 2. Validate the change

- [x] 2.1 Run full tests, type check, build, and OpenSpec validation: 108 tests passed, 7 skipped because native OpenTUI FFI is unavailable; other checks passed.
