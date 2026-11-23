# Spec Delta

## MODIFIED Requirements

### Requirement: Show cache hit rates and the latest call
The dashboard MUST show the agent family's cumulative cache hit rate in the “Cache” heading and show a separate hit rate and latest-call statistics for the main session and each known subagent. The family rate MUST be calculated from the family's summed counters, not as an average of agent rates. The “Cache” section MUST remain clickable, expanded by default, and indent the whole agent breakdown once under the “Cache” heading; an agent's “Last call” and “TTL” rows MUST align with its name and rate. A subtle divider labeled “◆ Mainagent” MUST continue to separate Cache from the main entry.

#### Scenario: Show agent-family cache rates
- **WHEN** cumulative token counters and at least one assistant call are available
- **THEN** “Cache” shows the total rate `Cache-Reads / (Input + Cache-Reads + Cache-Writes)` across the family, and each agent block shows its own latest rate and change from the previous call in that session; rates are truncated to two decimal places, and changes are rounded to one decimal place and appear before the latest rate

#### Scenario: Show family and per-agent cache rates
- **WHEN** cumulative token counters are available for the family and cache data is available for one or more agents
- **THEN** the “Cache” heading shows `Cache-Reads / (Input + Cache-Reads + Cache-Writes)` across the family, and a block for the main session and each known subagent shows that session's own rate using the same formula; every displayed rate includes a `%` suffix

#### Scenario: Omit the redundant main-agent rate without subagents
- **WHEN** the main session has no known subagents
- **THEN** the Cache heading shows the main session's total rate without a duplicate `◆ Mainagent` rate row, while its “Last call” and “TTL” rows remain visible

#### Scenario: Cache writes are not hits
- **WHEN** the agent family reports cache writes greater than zero
- **THEN** the cache writes are counted in the denominator of the family rate so that they neither raise nor hide the hit rate

#### Scenario: Show each agent's latest call and change
- **WHEN** an agent has assistant calls with cache usage data
- **THEN** its “Last call” row shows the latest call's rate and its directional change from the previous call in that same session; rates are truncated to two decimal places and changes are rounded to one decimal place

#### Scenario: Keep cache text colors distinct by role
- **WHEN** the Cache section and agent details are displayed
- **THEN** the “Cache” label and family rate, `◆ Mainagent` label, and subagent arrows and names use the normal foreground (white); each agent's hit rate uses muted gray; every part of “Last call” uses muted gray; the “TTL” label and elapsed time use muted gray, with only its status dot colored

#### Scenario: Truncate long subagent labels before the cache rate
- **WHEN** a subagent label is too long to fit before its right-aligned cache rate
- **THEN** the subagent name is shortened on one line with a trailing ellipsis and leaves at least one blank character before the right-aligned rate, which retains its `%` suffix

#### Scenario: Cache details are expanded by default
- **WHEN** the Cache overview is first displayed
- **THEN** the `◆ Mainagent` row, each subagent row prefixed by a white `↳`, and their “Last call” and “TTL” rows are indented once to align under the Cache heading, with the detail rows aligned with that agent's name and rate

#### Scenario: Collapse and expand Cache details
- **WHEN** the user clicks “Cache”
- **THEN** all per-agent details are hidden or shown together while the heading and family hit rate remain visible

#### Scenario: Visually separate Cache from the main agent
- **WHEN** the Cache section and main entry are displayed one after the other
- **THEN** a blank line and a subtle solid horizontal divider labeled “◆ Mainagent” separate the sections

#### Scenario: Show the divider in a narrow sidebar
- **WHEN** the sidebar is narrower than a divider label and its surrounding spaces
- **THEN** the divider shows a solid line without a truncated label

#### Scenario: Cache data is unavailable
- **WHEN** a family or agent rate, latest-call rate, or change cannot be computed from available data
- **THEN** the dashboard shows it as unavailable instead of treating missing or invalid values as zero
