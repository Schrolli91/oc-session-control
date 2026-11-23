# Spec Delta

## MODIFIED Requirements

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A subtle divider labeled “↳ Subagents (n)” MUST separate the main session and its skills from subagent entries and show the number of subagents in parentheses.

#### Scenario: Compact agent list
- **WHEN** a session is active and the sidebar is visible
- **THEN** each entry shows the name in white and its known cost in the plugin's blue accent; below, the context percentage and token counts appear in gray. Used tokens use one decimal place with k/M suffixes (for example, “60.1k”), while the context limit remains compact and whole-numbered (for example, “1M”). The context row starts under the name, and the status icon sits alone at the left edge. The title is limited to the available single-line width before the cost and shortened with an ellipsis when needed.

#### Scenario: Unavailable cost stays muted
- **WHEN** an agent’s cost cannot be determined
- **THEN** its entry shows `unavailable` in gray instead of the blue cost color

#### Scenario: Open a subagent with a click
- **WHEN** the user presses and releases the left mouse button on a subagent entry
- **THEN** its session opens in the main window

#### Scenario: Cancel subagent navigation after pointer movement
- **WHEN** the user presses the left mouse button on a subagent entry, moves the pointer, and releases it
- **THEN** its session does not open

#### Scenario: Cancel subagent navigation by dragging away
- **WHEN** the user presses the left mouse button on a subagent entry and releases it outside that entry
- **THEN** its session does not open

#### Scenario: Ignore non-left buttons on a subagent entry
- **WHEN** the user presses or releases a non-left mouse button on a subagent entry
- **THEN** its session does not open

#### Scenario: Open model details without navigating to the subagent
- **WHEN** the user completes a left click on a subagent’s model name
- **THEN** model details open and the subagent session does not open

#### Scenario: Separate the main session from subagent sessions
- **WHEN** a main session and at least one subagent are displayed
- **THEN** after a blank line, a subtle solid horizontal divider labeled “↳ Subagents (n)” separates the main session and its skills from the subagent entries, where n is the displayed subagent count. No additional group heading or group total appears, and subagent entries have no blank lines between them.

#### Scenario: Show the main entry's own cost
- **WHEN** the main session and its subagents are listed and all costs are known
- **THEN** the main entry shows the main session's own cost, which is lower than the family total shown in the “Session usage” heading whenever subagents have spent anything
