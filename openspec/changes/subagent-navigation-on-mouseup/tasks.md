# Tasks

## 1. Gate subagent row navigation

- [x] 1.1 Navigate only for an uninterrupted left-button press and release on a subagent row; preserve nested model handling and verify `npm run check` passes.
- [x] 1.2 Add headless interaction tests for completed clicks, pointer movement, non-left buttons, and nested model clicks; verify `node --conditions=browser --experimental-ffi --test src/dashboard.test.mjs` passes on Node 26.4+.

## 2. Validate the change

- [x] 2.1 Build the dashboard and run the complete test suite; verify `npm run build`, `node --conditions=browser --experimental-ffi --test "src/**/*.test.mjs"`, `npm run check`, and `openspec validate subagent-navigation-on-mouseup` pass.
