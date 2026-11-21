# Spec Delta

## Purpose

This dashboard makes the costs and context usage of an OpenCode session understandable, including the contributions and usage of individual subagents.

## ADDED Requirements

### Requirement: Show the project-local plugin in the sidebar by default
The dashboard MUST be provided as a project-local OpenCode TUI plugin that OpenCode can load from this project directory without global plugin configuration or publication and display in the sidebar by default during an active session.

#### Scenario: Dashboard appears in the project sidebar
- **WHEN** the user starts OpenCode with this project as the project directory and opens a session
- **THEN** the session overview and agent values appear directly in the sidebar, without a slash command, global installation, or publication

### Requirement: Show total session costs
The dashboard MUST combine the costs of the main session and all known subagents into a total and mark it incomplete when cost data is missing. All displayed prices MUST be rounded to exactly four decimal places.

#### Scenario: Total includes the agent family
- **WHEN** cost data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of costs for all sessions in the agent family

#### Scenario: Cost data is partially unavailable
- **WHEN** cost data is unavailable for at least one agent in the family
- **THEN** the dashboard shows the available total and marks it incomplete rather than treating missing values as zero

#### Scenario: Format prices consistently
- **WHEN** the dashboard shows session or agent costs
- **THEN** all prices are shown to exactly four decimal places

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A blank line separates the main entry from the subagent heading; subagent entries have no blank lines between them.

#### Scenario: Compact agent list
- **WHEN** a session is active and the sidebar is visible
- **THEN** each entry shows the name in white and cost right-aligned in gray; below, the context percentage and token counts appear in gray. Used tokens use one decimal place with k/M suffixes (for example, “60.1k”), while the context limit remains compact and whole-numbered (for example, “1M”). The context row starts under the name, and the status icon sits alone at the left edge. The title is limited to the available single-line width before the cost and shortened with an ellipsis when needed.

#### Scenario: Open a subagent with a click
- **WHEN** the user left-clicks a subagent entry
- **THEN** its session opens in the main window

### Requirement: Show each agent’s model name
The dashboard MUST show a gray row directly below each agent title, with “Model:” on the left and the model name on the right.

#### Scenario: Determine the model name from usage data
- **WHEN** a model is known from an agent’s latest assistant usage or session
- **THEN** the agent entry shows the corresponding model name right-aligned

### Requirement: Open model details
The dashboard MUST open OpenCode’s native alert dialog with model, provider, limit, and pricing information when the user left-clicks the model name.

#### Scenario: View model details
- **WHEN** the user clicks an agent’s model name
- **THEN** the native dialog remains open and shows the model name and ID, provider, token limits, and input, cache, and output prices, including any context price tiers; OK or Esc closes it

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
- **WHEN** the agent family contains subagents waiting for input, running, and in other states
- **THEN** the main session remains first; subagents waiting for input appear before running subagents, followed by the others, with order preserved within each group

### Requirement: Use colors from the active theme
The dashboard MUST obtain all text, status, and bar colors from a centralized palette for the active OpenCode theme. If a hue is missing, it MUST use theme text colors; for orange, it MAY use OpenTUI’s named `orange` color as a fallback.

#### Scenario: Theme does not define every hue color
- **WHEN** the active theme does not define some hue colors
- **THEN** the dashboard uses theme text colors as replacements, and uses OpenTUI’s named `orange` color for orange

#### Scenario: Show the subagent heading only when subagents exist
- **WHEN** the agent family contains at least one subagent
- **THEN** after a blank line and before their list, the dashboard shows “Subagents” with the count in gray parentheses immediately after it and the cost total right-aligned in gray. No blank lines follow the heading or separate subagent entries; otherwise, the heading and subagent total are omitted.

#### Scenario: Context usage can be measured
- **WHEN** an agent’s latest reported context token count and model context limit are known
- **THEN** the dashboard shows the percentage on the left and used/total tokens on the right of the context row

#### Scenario: Context data is unavailable
- **WHEN** an agent’s token count or context limit cannot be determined
- **THEN** the dashboard marks its context usage as unavailable and does not show an invented percentage

### Requirement: Show the agent-family usage overview
The dashboard MUST sum reported assistant tokens across all sessions in the agent family and show Input, Cached input, Cache writes, Output, and Reasoning as separate compact totals using k/M suffixes and the `tok` unit, in that order. “Last prompt” is not shown.

#### Scenario: Show agent-family usage values
- **WHEN** assistant usage data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of each token category across all sessions

#### Scenario: Preserve usage values after compaction
- **WHEN** OpenCode no longer provides older messages in the message list after compaction
- **THEN** the dashboard uses cumulative session token counters so totals are preserved

### Requirement: Estimate cache savings
The dashboard MUST calculate “Saved (est.)” from cache-read tokens and the corresponding model prices. If required model prices are missing, the estimate MUST be marked unavailable. The session total reported by OpenCode appears in the heading and is not repeated.

#### Scenario: Cache savings have no model prices
- **WHEN** input or cache-read prices are unavailable for a model’s cache reads
- **THEN** the dashboard marks “Saved (est.)” as unavailable instead of inventing a savings value

### Requirement: Show cache hit rates and the latest call
The dashboard MUST show a “Cache” section after “Session usage” with the agent family’s hit rate and the latest assistant call’s hit rate and change from the previous call. Rates are truncated to two decimal places; the change is rounded to one decimal place and appears before the latest rate.

#### Scenario: Show agent-family cache rates
- **WHEN** cumulative token counters and at least one assistant call are available
- **THEN** “Cache” shows the total rate `Cache-Reads / (Input + Cache-Reads)`, and “Last call” shows the latest rate and its directional change from the previous rate

### Requirement: Show cache TTL live
The Cache section MUST show elapsed time since the latest assistant call as a running timer with a colored dot: green before three minutes, yellow from three to under five minutes, and red from five minutes onward.

#### Scenario: Update TTL color based on the latest call
- **WHEN** time passes after the latest assistant call
- **THEN** the timer continues and the dot changes color at the three- and five-minute thresholds

### Requirement: Visualize main-agent context usage
When the main agent’s context usage is known, the dashboard MUST show an indented, thin, single-line Unicode bar below its context row. The used portion is filled proportionally and colored green (<30%), yellow (<50%), orange (<70%), or red (70% or more); the unused portion remains gray. An indented legend below shows `<30 %`, `<50 %`, `<70 %`, and `≥70 %`.

#### Scenario: Display context usage
- **WHEN** the main agent’s context usage is known
- **THEN** the main entry shows an indented bar for used context with the specified color and a gray remainder; the legend below explains the color thresholds

### Requirement: Keep usage data up to date
The dashboard MUST update totals and agent values as soon as new session or usage data becomes available for the displayed agent family.

#### Scenario: New usage data arrives
- **WHEN** OpenCode provides updated cost or token usage data for an agent
- **THEN** the dashboard shows the updated values for that agent and any affected totals

#### Scenario: Compaction updates context
- **WHEN** OpenCode completes compaction of a displayed session
- **THEN** the dashboard reloads its messages and updates context values and derived bars
