# Tasks

## 1. Render per-agent costs in blue

- [x] 1.1 Add a `cost` blue to both palettes in `src/theme.mjs`, update the palette assertions in `src/agents.test.mjs`, and update `AgentEntry` (`src/dashboard-components.tsx`) to use `colors().cost` for known values while keeping `unavailable` on `colors().text.muted`; verify with `npm run check`.
- [x] 1.2 Run `npm test` and confirm the palette, cost, and agent row tests still pass.
- [x] 1.3 Run `npm run build` and confirm the plugin compiles without errors.
- [ ] 1.4 In a running OpenCode session, confirm the Mainagent and Subagents cost values are blue in dark and light mode, `unavailable` stays gray, and the indented Mainagent/Subagents rows under Session usage stay gray.

## Workflow follow-up

- Archive the change after the verification above passes.
