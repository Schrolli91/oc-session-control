# Spec Delta

## MODIFIED Requirements

### Requirement: Collapse unloaded skills
The main session’s skill list MUST start collapsed. Clicking its heading MUST toggle unloaded skill rows; loaded skills remain visible when collapsed.

#### Scenario: Show the skill list collapsed by default
- **WHEN** the sidebar first renders with visible skills
- **THEN** unloaded skills are hidden and loaded skills are visible

#### Scenario: Hide unloaded skills
- **WHEN** the user clicks the expanded skill heading
- **THEN** unloaded skills disappear while loaded skills remain visible

#### Scenario: Expand the skill list again
- **WHEN** the user clicks the collapsed skill heading again
- **THEN** all visible skills appear again

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A subtle divider labeled “Subagents” MUST separate the main session and its skills from subagent entries.

#### Scenario: Compact agent list
- **WHEN** a session is active and the sidebar is visible
- **THEN** each entry shows the name in white and cost right-aligned in gray; below, the context percentage and token counts appear in gray. Used tokens use one decimal place with k/M suffixes (for example, “60.1k”), while the context limit remains compact and whole-numbered (for example, “1M”). The context row starts under the name, and the status icon sits alone at the left edge. The title is limited to the available single-line width before the cost and shortened with an ellipsis when needed.

#### Scenario: Open a subagent with a click
- **WHEN** the user left-clicks a subagent entry
- **THEN** its session opens in the main window

#### Scenario: Separate the main session from subagent sessions
- **WHEN** a main session and at least one subagent are displayed
- **THEN** after a blank line, a subtle solid divider with centered “Subagents” separates the main session and its skills from subagent entries, without an additional group heading; subagent entries have no blank lines between them

### Requirement: Show agent status
The dashboard MUST show a status icon for the main session and each subagent, prioritizing pending user input, active execution, the latest result, then idle. Pending input uses a yellow question mark; active execution uses a rotating blue spinner. Results remain visible until the next execution starts: success as a green check, abort as a yellow dot, and failure as a red `×`. Idle without a known result uses a gray dot.

#### Scenario: Status priority for the main session and subagents
- **WHEN** an agent is waiting for input, running, idle, or has a latest result
- **THEN** the dashboard shows the icon before its name according to the defined priority; pending input and active execution take precedence over a stored result

#### Scenario: Show execution results
- **WHEN** an execution succeeds, fails, or is interrupted, and no input is pending or execution is active
- **THEN** the dashboard shows a green check, red `×`, or yellow dot until the next execution starts

#### Scenario: Idle without a known result
- **WHEN** an agent is idle and has no known execution result
- **THEN** the dashboard shows a gray dot instead of a success icon

#### Scenario: Prioritize subagents by status
- **WHEN** the agent family contains subagents waiting for input, running, failed, successful, aborted, and idle
- **THEN** subagents appear in that order; their existing order is preserved within each status group

### Requirement: Use colors from the active theme
The dashboard MUST obtain all text, status, and bar colors from a centralized palette for the active OpenCode theme. If a hue is missing, it MUST use theme text colors; for orange, it MAY use OpenTUI’s named `orange` color as a fallback.

#### Scenario: Theme does not define every hue color
- **WHEN** the active theme does not define some hue colors
- **THEN** the dashboard uses theme text colors as replacements, and uses OpenTUI’s named `orange` color for orange

#### Scenario: Context usage can be measured
- **WHEN** an agent’s latest reported context token count and model context limit are known
- **THEN** the dashboard shows the percentage on the left and used/total tokens on the right of the context row

#### Scenario: Context data is unavailable
- **WHEN** an agent’s token count or context limit cannot be determined
- **THEN** the dashboard marks its context usage as unavailable and does not show an invented percentage

### Requirement: Show total session costs
The dashboard MUST show the combined costs of the main session and all known subagents in the “Session usage” heading. The cost section MUST be expandable and collapsible, and start expanded.

#### Scenario: Total includes the agent family
- **WHEN** cost data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of all sessions in the agent family on the right of “Session usage” and the individual or partial totals in indented gray rows

#### Scenario: Cost data is partially unavailable
- **WHEN** cost data is unavailable for at least one agent in the family
- **THEN** the dashboard shows available totals and marks them incomplete or unavailable rather than treating missing values as zero

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

### Requirement: Estimate cache savings
The dashboard MUST calculate “Total saved:” from cache-read tokens and the corresponding model prices, and show it as an indented gray row. If required model prices are missing, the estimate MUST be marked unavailable.

#### Scenario: Cache savings have no model prices
- **WHEN** input or cache-read prices are unavailable for a model’s cache reads
- **THEN** the dashboard marks “Total saved:” as unavailable instead of inventing a savings value

#### Scenario: Show Total saved as the third row
- **WHEN** usage data is available for the session overview
- **THEN** the dashboard shows the indented gray “Total saved:” row after “Mainagent:” and “Subagents:” and before Session total

### Requirement: Show cache hit rates and the latest call
The dashboard MUST show the agent family’s cache hit rate and the latest assistant call’s hit rate and change from the previous call. The “Cache” section MUST be clickable, expanded by default, and show “Last call” and “TTL” as indented rows. A subtle divider labeled “Mainagent” MUST separate Cache from the main entry.

#### Scenario: Show agent-family cache rates
- **WHEN** cumulative token counters and at least one assistant call are available
- **THEN** “Cache” shows the total rate `Cache-Reads / (Input + Cache-Reads)`, and “Last call” shows the latest rate and its directional change from the previous rate. Rates are truncated to two decimal places; the change is rounded to one decimal place and appears before the latest rate.

#### Scenario: Cache details are expanded by default
- **WHEN** the Cache overview is first displayed
- **THEN** “Last call” and “TTL” are visible as indented rows under “Cache”

#### Scenario: Collapse and expand Cache details
- **WHEN** the user clicks “Cache”
- **THEN** “Last call” and “TTL” are hidden or shown again while the Cache heading and total hit rate remain visible

#### Scenario: Visually separate Cache from the main agent
- **WHEN** the Cache section and main entry are displayed one after the other
- **THEN** a blank line and a subtle solid horizontal divider labeled “Mainagent” separate the sections

#### Scenario: Show the divider in a narrow sidebar
- **WHEN** the sidebar is narrower than a divider label and its surrounding spaces
- **THEN** the divider shows a solid line without a truncated label

### Requirement: Show cache TTL live
The Cache section MUST show elapsed time since the latest assistant call as a running timer with a colored dot: green before three minutes, yellow from three to under five minutes, and red from five minutes onward. The TTL MUST appear as an indented Cache detail only when expanded.

#### Scenario: Update TTL color based on the latest call
- **WHEN** time passes after the latest assistant call while the Cache section is expanded
- **THEN** the timer continues and the dot changes color at the three- and five-minute thresholds

### Requirement: Show skill token estimates
The main list MUST show a right-aligned token estimate for each skill. The heading MUST show the right-aligned gray sum for loaded visible skills. Estimates MUST use `ceil(UTF-8-Bytes of skill content / 4)`. If visible skills exist but none are loaded, the heading MUST show only `—`, not a `0 tok` estimate.

#### Scenario: Show an individual skill size
- **WHEN** a visible skill’s content is 5,600 UTF-8 bytes
- **THEN** its row shows `~1.4k tok` right-aligned

#### Scenario: Sum loaded skill token estimates
- **WHEN** two visible loaded skills are estimated at 1k and 400 tok
- **THEN** the heading shows `~1.4k tok` right-aligned in gray

#### Scenario: No skills are loaded
- **WHEN** visible skills exist but none have loaded
- **THEN** the heading shows only `—` instead of `0 tok`

#### Scenario: Skill content is missing
- **WHEN** a skill’s content is unavailable
- **THEN** its row shows `— tok`; if content is missing for a loaded skill, the total is also unavailable

#### Scenario: Long skill name with token count
- **WHEN** a skill name is longer than the space available before the token count
- **THEN** the row shortens the name with `…` and leaves at least one space before the right-aligned token count

### Requirement: Show the agent-family usage overview
The dashboard MUST aggregate reported assistant tokens across the agent family into a compact hierarchy of session, input, and output totals. “Session Total” MUST be clickable, expanded by default, and show cumulative input and output rather than context-window usage. The overview MUST use session counters so totals survive compaction.

#### Scenario: Show agent-family usage values
- **WHEN** assistant usage data is available for the main session and its subagents
- **THEN** the dashboard shows aggregated agent-family values in a hierarchy: Session Total, ↓ Input with Cache Hit/Miss/Write, and ↑ Output with Reasoning/Response. These labels have no colons. The block starts expanded; all content is indented under its heading, with subcategories aligned with their Input/Output row. Blank lines separate this block from the cost and Cache blocks.

#### Scenario: Calculate session and group totals
- **WHEN** all required values are available
- **THEN** the dashboard calculates Input as `input + cache hit + cache write`, with Cache miss equal to the `input` counter; Output total as `output + reasoning`; Reasoning as `reasoning`; Response as the reported visible `output`; and Session total as Input plus Output total across the agent family. Subcategories are not counted again in their group total. Cache Hit is green, Cache Miss red, Cache Write yellow, Reasoning purple, and Response blue. Each subcategory has a colored square; its label and token value remain neutral.

#### Scenario: Show only available and consistent values
- **WHEN** a value for a category is missing or a subcategory cannot be derived consistently from reported values
- **THEN** the dashboard shows only computable values. Unavailable values are not shown as zero or negative, and a group total appears only when its required values are available.

#### Scenario: Show relative proportions in full-width bars
- **WHEN** all subcategories in an Input or Output group are available and consistent, and their sum is greater than zero
- **THEN** the dashboard shows a separate full-width bar directly above that group’s heading and before its values. Segment widths represent each subcategory’s share of the group total.

#### Scenario: Omit bars for invalid distributions
- **WHEN** the group total is zero or a subcategory is missing or inconsistent
- **THEN** the dashboard omits that group’s bar instead of normalizing an incomplete breakdown or showing a zero total

#### Scenario: Session Total is expanded by default
- **WHEN** the session overview is first displayed
- **THEN** the Input and Output groups are visible under “Session Total”

#### Scenario: Collapse and expand Session Total
- **WHEN** the user clicks “Session Total”
- **THEN** Input/Output values and bars are hidden or shown again while the heading and total token count remain visible

#### Scenario: Preserve usage values after compaction
- **WHEN** OpenCode no longer provides older messages in the message list after compaction
- **THEN** the dashboard uses cumulative session token counters so totals are preserved
