# Spec Delta

## MODIFIED Requirements

### Requirement: Show total session costs
The dashboard MUST show the combined costs of the main session and all known subagents in the “Session usage” heading. The cost section MUST be expandable and collapsible, and start expanded. Every session's cost MUST be counted exactly once: the heading MUST equal the sum of the indented rows, and the “Mainagent:” row MUST carry only the main session's own cost.

#### Scenario: Total includes the agent family
- **WHEN** cost data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of all sessions in the agent family on the right of “Session usage” and the individual or partial totals in indented gray rows

#### Scenario: Cost data is partially unavailable
- **WHEN** cost data is unavailable for at least one agent in the family
- **THEN** the dashboard shows the available total and marks it as incomplete rather than treating missing values as zero

#### Scenario: Format prices consistently
- **WHEN** the dashboard shows session or agent costs
- **THEN** all prices are shown to exactly four decimal places

#### Scenario: No subagents are present
- **WHEN** the main session has no subagents
- **THEN** the “Subagents:” row shows `$0.0000`

#### Scenario: Cost section is expanded by default
- **WHEN** the session overview is first displayed
- **THEN** “Mainagent:” and “Subagents:” are visible under “Session usage” as indented gray rows

#### Scenario: Collapse and expand the cost section
- **WHEN** the user clicks “Session usage”
- **THEN** the cost rows are hidden or shown again while the heading and agent-family total remain visible

#### Scenario: Count each session's cost once
- **WHEN** the agent family consists of the main session and one or more subagents whose costs are all known
- **THEN** the “Mainagent:” row shows only the main session's own cost, the “Subagents:” row shows the sum of the subagent costs, and adding the two rows equals the “Session usage” heading exactly once

#### Scenario: Stop subagent costs from climbing the main row
- **WHEN** subagents spend while the main session itself makes no calls
- **THEN** the “Mainagent:” row stays unchanged and only the “Subagents:” row and the heading increase

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A subtle divider labeled “Subagents” MUST separate the main session and its skills from subagent entries and show the number of subagents in parentheses.

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
- **THEN** after a blank line, a subtle solid divider with centered “Subagents (n)” separates the main session and its skills from the subagent entries, where n is the displayed subagent count. No additional group heading or group total appears, and subagent entries have no blank lines between them.

#### Scenario: Show the main entry's own cost
- **WHEN** the main session and its subagents are listed and all costs are known
- **THEN** the main entry shows the main session's own cost, which is lower than the family total shown in the “Session usage” heading whenever subagents have spent anything
