# Spec Delta

## MODIFIED Requirements

### Requirement: Keep usage data up to date
The dashboard MUST update totals and agent values as soon as new session or usage data becomes available for the displayed agent family.

#### Scenario: New usage data arrives
- **WHEN** OpenCode provides updated cost or token usage data for an agent
- **THEN** the dashboard shows the updated values for that agent and any affected totals

#### Scenario: Compaction updates context
- **WHEN** OpenCode completes compaction of a displayed session
- **THEN** the dashboard reloads its messages, shows context from post-compaction assistant usage when available, and otherwise marks context unavailable instead of retaining pre-compaction usage or using compaction-request tokens

#### Scenario: Main-agent compaction updates context
- **WHEN** OpenCode completes compaction of the displayed main session and provides post-compaction assistant usage
- **THEN** the dashboard reloads the main session's messages and updates its context row and derived bar from the latest available assistant usage

#### Scenario: Subagent compaction updates its context
- **WHEN** OpenCode completes compaction of a displayed subagent and provides post-compaction assistant usage
- **THEN** the dashboard reloads that subagent's messages and updates its context row without changing the main agent's context bar or unrelated subagent rows

#### Scenario: Compaction has no usable context usage
- **WHEN** OpenCode completes compaction of a displayed session and no post-compaction assistant usage is available
- **THEN** that session's context row is shown as unavailable and its context bar is omitted when it is the main session; compaction-request tokens and pre-compaction assistant usage are not shown as current context

#### Scenario: New assistant usage arrives after compaction
- **WHEN** OpenCode reports assistant usage for a displayed session after compaction
- **THEN** the dashboard immediately shows context derived from that usage and its model's context limit
