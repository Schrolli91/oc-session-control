# Tasks

## 1. Remove the unsupported skill-click flow

- [x] 1.1 Remove the picker state machine and `insertSkill` wiring from the TUI plugin and dashboard, leaving skill rows and other dashboard controls intact; verify with a regression test that clicking a skill row does not dispatch a picker or change prompt content.
- [x] 1.2 Update the relevant dashboard/TUI test fixtures and verify the skill inventory still renders with its existing counts, status, ordering, and token estimates.

## 2. Clarify supported skill use

- [x] 2.1 Update README skill documentation to state that clicking a skill does nothing and users can manually invoke it with the exact `@<skill-id>` syntax; verify no documentation still promises click-to-insert behavior.

## 3. Verify the change

- [x] 3.1 Run `npm test`, `npm run build`, `npm run check`, and `openspec validate --all`; verify all checks pass.
- [x] 3.2 Verify the headless mouse-click regression leaves the prompt unchanged and opens no picker, and confirm README documents exact `@<skill-id>` syntax; do not require or claim live TUI or host-invocation verification.
