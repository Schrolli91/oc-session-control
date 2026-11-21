# Proposal

## Why

OpenCode does not show the costs and context usage of a running agent session in one place or in a clear view of the entire agent family. Users should be able to see at a glance what the main session and its subagents cost and how much context remains for each agent.

## What Changes

- A project-local OpenCode TUI plugin at `.opencode/plugins/session-usage-dashboard/` shows the current session’s cumulative costs, including its subagents.
- By default and without a slash command, the OpenCode sidebar shows the session total, aggregated Input/Cache/Output/Reasoning tokens, estimated cache savings based on model prices, and a compact agent list.
- Each agent entry shows its name and individual cost on the first line, then context percentage and compact used/total tokens on the second; subagents appear under a heading shown only when needed.
- Context values are gray; unavailable values are clearly marked.
- The display updates with session data and remains functional when cost data is unavailable.
- OpenCode loads the plugin directly from the project directory, allowing it to be checked in this project’s TUI during development without global installation or publication.

## Capabilities

### New Capabilities
- `session-usage-dashboard`: Show session total costs and costs and context usage per agent and subagent in the OpenCode TUI.

### Modified Capabilities
- None.

## Impact

- New plugin files under `.opencode/plugins/session-usage-dashboard/`; the codebase currently has no application implementation.
- Uses OpenCode’s TUI plugin session data and UI, especially the session family, costs, messages, and sidebar slot.
- The usage overview sums assistant tokens and estimated cache savings across the main session and subagents; the session total remains the value reported by OpenCode.
- OpenCode must run with this project as its project directory to discover the local plugin automatically.
- Context usage must be derived from available token counters and the relevant model’s context window. Unknown or unavailable values must not be shown as zero or as seemingly precise percentages.
