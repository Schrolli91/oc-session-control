# Tasks

## 1. Locally visible plugin foundation

- [x] 1.1 Add the local plugin entry point and show the dashboard in the project sidebar by default without a slash command; verify local discovery and document how to start it in the README.

## 2. Current session costs

- [x] 2.1 Show the main session’s costs directly in the sidebar; verify the cost value and “unavailable” state with tests.

## 3. Total costs including subagents

- [x] 3.1 Show the agent-family total costs in the sidebar and mark incomplete totals; verify aggregation and labeling with tests.

## 4. Agent-family usage overview

- [x] 4.1 Show summed Input, Cache Read, Cache Write, Output, and Reasoning tokens for the entire agent family, plus estimated cache savings, total hit rate, last-call rate, and live TTL; omit “Last prompt” and verify calculations with tests.

## 5. Context usage per agent

- [x] 5.1 Show the indented context-usage bar and color legend in the main entry. For each agent, show a status icon, dynamically shortened title, model row with native alert dialog, and context values; show a conditional “Subagents (n)” heading with the total. Make subagent entries clickable and verify formatting with tests.

## 6. Live updates

- [x] 6.1 Update visible totals and agent values in the sidebar when new usage data arrives; verify with an event test.

## 7. Maintainability

- [x] 7.1 Use `findModel` in `getContextFill` as well; move the pure model-details construction out of `tui.tsx` into a testable function and add tests without changing visible behavior.

## 8. Agent status and results

- [x] 8.1 Show status for the main session and subagents with priority input > running > latest result > idle; sort waiting subagents before running and other subagents, use the defined result icons, and verify status priority and sorting with tests.

## 9. End-to-end verification

- [ ] 9.1 Start OpenCode in the project directory and check the full workflow in the actual TUI: view the dashboard without a slash command, inspect usage statistics and costs, click a subagent and verify session switching, and observe status changes and live usage updates.
