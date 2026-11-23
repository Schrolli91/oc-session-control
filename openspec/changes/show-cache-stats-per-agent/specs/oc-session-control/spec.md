# Spec Delta

## MODIFIED Requirements

### Requirement: Show total session costs
The dashboard MUST show the combined costs of the main session and all known subagents in the “Session usage” heading. The cost section MUST be expandable and collapsible, and start expanded. The “◆ Mainagent:” and “↳ Subagents:” rows MUST appear only when the family contains at least one subagent. Every session's cost MUST be counted exactly once: when those rows are shown, the heading MUST equal their sum and the “◆ Mainagent:” row MUST carry only the main session's own cost; when the family has no subagents, the heading alone carries the total.

#### Scenario: Total includes the agent family
- **WHEN** cost data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of all sessions in the agent family on the right of “Session usage” and, when the family has subagents, the individual or partial totals in indented gray rows labeled “◆ Mainagent:” and “↳ Subagents:”

#### Scenario: Cost data is partially unavailable
- **WHEN** cost data is unavailable for at least one agent in the family
- **THEN** the dashboard shows the available total and marks it as incomplete rather than treating missing values as zero

#### Scenario: Format prices consistently
- **WHEN** the dashboard shows session or agent costs
- **THEN** all prices are shown to exactly four decimal places

#### Scenario: No subagents are present
- **WHEN** the main session has no subagents
- **THEN** neither the “◆ Mainagent:” nor the “↳ Subagents:” row is shown under “Session usage”, and the heading alone shows the total

#### Scenario: Subagents present but free
- **WHEN** the main session has at least one subagent whose cost is `$0.0000`
- **THEN** the “◆ Mainagent:” and “↳ Subagents:” rows are shown, with the “↳ Subagents:” row reading `$0.0000`

#### Scenario: Cost section is expanded by default
- **WHEN** the session overview is first displayed
- **THEN** “Saved (est.):” is visible under “Session usage” as an indented gray row, and “◆ Mainagent:” and “↳ Subagents:” are visible there only when the family has at least one subagent

#### Scenario: Collapse and expand the cost section
- **WHEN** the user clicks “Session usage”
- **THEN** the cost rows are hidden or shown again while the heading and agent-family total remain visible

#### Scenario: Count each session's cost once
- **WHEN** the agent family consists of the main session and one or more subagents whose costs are all known
- **THEN** the “◆ Mainagent:” row shows only the main session's own cost, the “↳ Subagents:” row shows the sum of the subagent costs, and adding the two rows equals the “Session usage” heading exactly once

#### Scenario: Stop subagent costs from climbing the main row
- **WHEN** subagents spend while the main session itself makes no calls
- **THEN** the “◆ Mainagent:” row stays unchanged and only the “↳ Subagents:” row and the heading increase

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A subtle divider labeled “↳ Subagents (n)” MUST separate the main session and its skills from subagent entries and show the number of subagents in parentheses.

#### Scenario: Compact agent list
- **WHEN** a session is active and the sidebar is visible
- **THEN** each entry shows the name in white and its known cost in the plugin's blue accent; below, the context percentage and token counts appear in gray. Used tokens use one decimal place with k/M suffixes (for example, “60.1k”), while the context limit remains compact and whole-numbered (for example, “1M”). The context row starts under the name, and the status icon sits alone at the left edge. The title is limited to the available single-line width before the cost and shortened with an ellipsis when needed.

#### Scenario: Unavailable cost stays muted
- **WHEN** an agent’s cost cannot be determined
- **THEN** its entry shows `unavailable` in gray instead of the blue cost color

#### Scenario: Open a subagent with a click
- **WHEN** the user left-clicks a subagent entry
- **THEN** its session opens in the main window

#### Scenario: Separate the main session from subagent sessions
- **WHEN** a main session and at least one subagent are displayed
- **THEN** after a blank line, a subtle solid horizontal divider labeled “↳ Subagents (n)” separates the main session and its skills from the subagent entries, where n is the displayed subagent count. No additional group heading or group total appears, and subagent entries have no blank lines between them.

#### Scenario: Show the main entry's own cost
- **WHEN** the main session and its subagents are listed and all costs are known
- **THEN** the main entry shows the main session's own cost, which is lower than the family total shown in the “Session usage” heading whenever subagents have spent anything

### Requirement: Show cache hit rates and the latest call
The dashboard MUST show the agent family's cumulative cache hit rate in the “Cache” heading and show a separate hit rate and latest-call statistics for the main session and each known subagent. The family rate MUST be calculated from the family's summed counters, not as an average of agent rates. The “Cache” section MUST remain clickable, expanded by default, and indent the whole agent breakdown once under the “Cache” heading; an agent's “Last call” and “TTL” rows MUST align with its name and rate. A subtle divider labeled “Mainagent” MUST continue to separate Cache from the main entry.

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
- **THEN** the subagent name is shortened on one line with an ellipsis and leaves at least one blank character before the right-aligned rate, which retains its `%` suffix

#### Scenario: Cache details are expanded by default
- **WHEN** the Cache overview is first displayed
- **THEN** the `◆ Mainagent` row, each subagent row prefixed by a white `↳`, and their “Last call” and “TTL” rows are indented once to align under the Cache heading, with the detail rows aligned with that agent's name and rate

#### Scenario: Collapse and expand Cache details
- **WHEN** the user clicks “Cache”
- **THEN** all per-agent details are hidden or shown together while the heading and family hit rate remain visible

#### Scenario: Visually separate Cache from the main agent
- **WHEN** the Cache section and main entry are displayed one after the other
- **THEN** a blank line and a subtle solid horizontal divider labeled “Mainagent” separate the sections

#### Scenario: Show the divider in a narrow sidebar
- **WHEN** the sidebar is narrower than a divider label and its surrounding spaces
- **THEN** the divider shows a solid line without a truncated label

#### Scenario: Cache data is unavailable
- **WHEN** a family or agent rate, latest-call rate, or change cannot be computed from available data
- **THEN** the dashboard shows it as unavailable instead of treating missing or invalid values as zero

### Requirement: Show cache TTL live
The Cache section MUST show, for the main session and each known subagent, elapsed time since that session's latest assistant call as a running timer with a colored dot: green before three minutes, yellow from three to under five minutes, and red from five minutes onward. Each TTL MUST appear as an indented detail under its agent only when the Cache section is expanded.

#### Scenario: Update TTL color based on the latest call
- **WHEN** time passes after the latest assistant call in one or more sessions while the Cache section is expanded
- **THEN** each timer continues from its own session's latest call and its dot changes color at the three- and five-minute thresholds

#### Scenario: Update each agent's TTL independently
- **WHEN** time passes after the latest assistant call in one or more sessions while Cache is expanded
- **THEN** each agent's timer advances from its own latest assistant-call timestamp, and its dot changes color at the three- and five-minute thresholds

#### Scenario: Agent has no usable call timestamp
- **WHEN** an agent has no assistant call with a usable timestamp
- **THEN** its TTL displays an unavailable value and does not show a fresh, aging, or stale status color
