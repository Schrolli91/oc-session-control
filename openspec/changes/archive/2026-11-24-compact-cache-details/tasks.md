# Tasks

## 1. Compact Cache agent details

- [x] 1.1 Combine each agent's `Last Hit` label, colored age dot, and elapsed timer on the left side of one row; keep the latest-call change and rate right-aligned, remove the separate `TTL` row, and update render tests to verify both the merged layout and absence of the old row.
- [x] 1.2 Verify the `Last Hit` timer remains visible for valid and unavailable timestamps, including live age updates and existing color thresholds, with the dashboard render tests.

## 2. Integration checks

- [x] 2.1 Run the repository checks in the prescribed order (`npm run build`, `node --conditions=browser --experimental-ffi --test "src/**/*.test.mjs"`, then `npm run check`) and confirm they pass.
