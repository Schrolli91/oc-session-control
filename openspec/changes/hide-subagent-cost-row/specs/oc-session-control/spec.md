# Spec Delta

## MODIFIED Requirements

### Requirement: Show total session costs
The dashboard MUST show the combined costs of the main session and all known subagents in the “Session usage” heading. The cost section MUST be expandable and collapsible, and start expanded. Every session's cost MUST be counted exactly once: the heading MUST equal the sum of the indented rows, and the “Mainagent:” row MUST carry only the main session's own cost. The “Subagents:” row MUST appear only when the family contains at least one subagent.

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
- **THEN** the “Subagents:” row is not shown under “Session usage”

#### Scenario: Subagents present but free
- **WHEN** the main session has at least one subagent whose cost is `$0.0000`
- **THEN** the “Subagents:” row is shown with `$0.0000`

#### Scenario: Cost section is expanded by default
- **WHEN** the session overview is first displayed
- **THEN** “Mainagent:” is visible under “Session usage” as an indented gray row, and “Subagents:” is visible there too only when the family has at least one subagent

#### Scenario: Collapse and expand the cost section
- **WHEN** the user clicks “Session usage”
- **THEN** the cost rows are hidden or shown again while the heading and agent-family total remain visible

#### Scenario: Count each session's cost once
- **WHEN** the agent family consists of the main session and one or more subagents whose costs are all known
- **THEN** the “Mainagent:” row shows only the main session's own cost, the “Subagents:” row shows the sum of the subagent costs, and adding the two rows equals the “Session usage” heading exactly once

#### Scenario: Stop subagent costs from climbing the main row
- **WHEN** subagents spend while the main session itself makes no calls
- **THEN** the “Mainagent:” row stays unchanged and only the “Subagents:” row and the heading increase
