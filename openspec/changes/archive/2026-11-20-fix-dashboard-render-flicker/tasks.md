# Tasks

## 1. Make context-bar rendering responsive and stable

- [x] 1.1 Replace the fixed-width diagnostic context bar with a full-width proportional renderer that measures the parent once and does not measure each segment; verify segment widths sum to the available cell width using `usageBarWidths` tests.
- [x] 1.2 Run `node --test .opencode/plugins/session-usage-dashboard/usage.test.mjs` and verify existing usage-bar distribution and invalid-data cases still pass.

## 2. Restore normal dashboard behavior

- [x] 2.1 Remove temporary diagnostic labels and restore the rotating spinner; verify the test-only fixed width and paused timer are no longer present and the spinner advances during active execution.

## 3. Verify in the live TUI

- [x] 3.1 With an active session, verify all proportional bars use the full available width, the spinner rotates, context values remain correct, and context bars and session headings do not flicker in the available layout; repeat at other widths if the host permits.
- [x] 3.2 If any bar or heading still flickers, record which element and whether its values change, investigate the remaining data/layout/render path, apply a focused correction, and repeat the live checks until all acceptance criteria pass; if none remain, record that no further investigation was needed.
