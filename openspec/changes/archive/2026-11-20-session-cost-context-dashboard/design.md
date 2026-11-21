# Design

## Context

See `proposal.md` for the motivation and `specs/session-usage-dashboard/spec.md` for observable behavior. The project does not yet contain a plugin implementation. The current OpenCode TUI plugin API provides session families, session costs and messages, as well as TUI slots, panels, commands, and typed events.

## Goals / Non-Goals

**Goals:**
- Load directly from OpenCode’s project-local `.opencode/plugins/` directory and be checkable in this project’s TUI without global installation or publication.
- Consistently collect data for the main session and all known descendants.
- Show context usage as a percentage only when both reported usage and the model-specific context limit are known.

**Non-Goals:**
- Correct provider billing or configure model prices.
- Analyze historical sessions independently of the currently open session.
- Provide a server, GUI, or MCP plugin component.
- Ship the plugin as a published npm package in this change.

## Decisions

### Project-local TUI plugin with default sidebar display

Plugin files are in `.opencode/plugins/session-usage-dashboard/`, with a TUI entry point discovered by OpenCode within the project. The dashboard renders the session total, aggregated agent-family usage, agent rows, and context usage directly in the `sidebar.content` slot; no slash command or separate panel is required. The overview is therefore visible as soon as a session opens. The TUI sidebar remains controlled by OpenCode’s normal CLI setting; the plugin does not change global CLI configuration. No server component is added because the TUI API provides the required data and sidebar slot.

### Use OpenCode session data and aggregate the agent family once

The active session is used as the root. The plugin finds its family and reads costs and latest usage data for each session ID; totals are built from the individual values. Each session ID is counted exactly once to avoid duplicate costs. Updates use the TUI data/event APIs instead of continuous polling; opening the detail view synchronizes or invalidates session data as needed.

### Status priority and latest execution result

For the main session and subagents, status priority is input request, active execution, latest result, then idle without a known result. The plugin retains each session’s latest result from execution events until the next execution. Success appears as a green check, interruption as a yellow dot, and failure as a red `×`; a new idle session gets a gray dot.

### Context usage from the latest reported usage

For each agent, the latest OpenCode usage record is used as a snapshot of context usage and compared with the associated model’s context limit. The calculation uses OpenCode’s token fields according to their meaning, including separately reported cache tokens when they are part of the reported context; it does not sum tokens from all previous turns. If the model mapping, token value, or limit is missing, the UI shows “unavailable” instead of an estimate. Verify the exact field names and cache semantics in the SDK types used before implementation.

Each agent’s context is shown as a second gray text row, indented by two columns so it starts below the agent name rather than the status icon. The agent title is dynamically shortened to the available width before the right-aligned price and ends in `…` when needed to prevent the first row from wrapping. Left-clicking a subagent entry navigates to its session in the main window. Used context tokens of 1,000 or more use one decimal place with k, m, or b suffixes; the context limit remains compact and whole-numbered. Missing values show “unavailable” instead of an estimate. A “Subagents (n)” heading appears only when the family contains subagents; the count is gray immediately after the name, and the aggregate cost appears on the right. A blank line precedes the heading; none follows it or separates subagent entries.

### Usage overview and estimated cache savings

The overview sums persistent session token counters for Input, Cache Reads, Cache Writes, Output, and Reasoning across all sessions in the agent family. These OpenCode counters remain cumulative after compaction; messages are used only as a fallback for identifying the model. “Last prompt” is not shown. Estimated savings use the base price of each session model: cache-read tokens multiplied by the difference between the normal input and cache-read prices, each per million tokens. Because cumulative counters do not include per-prompt price-tier history, context-dependent price tiers are only approximate. If the model or required prices are missing, savings are shown as unavailable. The session total remains the family value reported by OpenCode in the heading.

### Cache hit rate and latest call

The total hit rate is calculated from aggregated session counters as `cache.read / (input + cache.read)`. “Last call” and the change from the previous assistant usage are derived from the two latest calls in the agent family. A running timer measures the age of the latest call; its dot changes among the theme colors green, yellow, and red at three and five minutes.

The main agent’s indented context-usage bar appears below the context row in the main entry. The used portion is proportional and colored green, yellow, orange, or red at the 30/50/70% thresholds; the unused remainder is gray. The indented color legend below shows `<30 %`, `<50 %`, `<70 %`, and `≥70 %`; the current percentage remains in the agent’s context row. The bar is omitted when context usage is unknown.

## Risks / Trade-offs

- [The TUI plugin API or its slot names change between OpenCode versions] → Develop against the documented public plugin API, specify the supported version, and test the published package against it.
- [An agent has no usage data yet or its model limit is unknown] → Treat cost and context values independently; show missing context data as “unavailable.”
- [Session data from events and cache is temporarily stale] → Use updated session events for invalidation/synchronization and do not imply precise live status when values are missing.
- [Some providers report costs, token fields, or model prices incompletely] → Mark missing values as unavailable; estimate cache savings only when model prices are available.
- [OpenCode loads the plugin only when it correctly detects the project context] → Explicitly run development and acceptance checks with OpenCode in the project directory and document expected plugin discovery.

## Migration Plan

There is no existing implementation or persistent data to migrate. OpenCode discovers the plugin in the project-local `.opencode/plugins/` directory when this project is open. To roll back, remove the plugin files from that directory; other projects and session data remain unchanged.
