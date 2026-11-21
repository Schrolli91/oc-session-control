# Spec Delta

## MODIFIED Requirements

### Requirement: Show the project-local plugin in the sidebar by default
The dashboard MUST load from this repository's project-local OpenCode plugin directory without global configuration, and MUST also support installation as a local plugin directory or a configured TUI package in another project or the global plugin directory. It MUST display in the sidebar by default during an active session.

#### Scenario: Dashboard appears in the project sidebar
- **WHEN** the user starts OpenCode with this repository as the project directory and opens a session
- **THEN** the session overview and agent values appear in the sidebar without a slash command or separate installation

#### Scenario: Dashboard appears from another project
- **WHEN** the user installs the plugin directory under another project's `.opencode/plugins/` directory or configures its TUI package through OpenCode's supported plugin settings
- **THEN** the session overview and agent values appear in that project's sidebar without changing dashboard behavior

#### Scenario: Dashboard appears from the global plugin directory
- **WHEN** the user installs the plugin under OpenCode's global plugin directory and opens a session
- **THEN** the session overview and agent values appear in the sidebar

### Requirement: Break down costs and context per agent
The dashboard MUST show the main session and known subagents in a compact list. Each entry MUST show its name and cost on one line, with context percentage and compact used/total tokens on the next line. A subtle divider labeled “Subagents” MUST separate the main session and its skills from subagent entries and show the number of subagents in parentheses.

#### Scenario: Compact agent list
- **WHEN** a session is active and the sidebar is visible
- **THEN** each entry shows the name in white and cost right-aligned in gray; below, the context percentage and token counts appear in gray. Used tokens use one decimal place with compact k/M suffixes (for example, “60.1k”), while the context limit remains compact (for example, “1M”). The context row starts under the name, and the status icon sits alone at the left edge. The title is limited to the available single-line width before the cost and shortened with an ellipsis when needed.

#### Scenario: Open a subagent with a click
- **WHEN** the user left-clicks a subagent entry
- **THEN** its session opens in the main window

#### Scenario: Separate the main session from subagent sessions
- **WHEN** a main session and at least one subagent are displayed
- **THEN** after a blank line, a subtle solid divider with centered “Subagents (n)” separates the main session and its skills from the subagent entries, where n is the displayed subagent count. No additional group heading or group total appears, and subagent entries have no blank lines between them.

### Requirement: Estimate cache savings
The dashboard MUST calculate cache savings from cache-read tokens and the corresponding model prices, and label the indented gray estimate row “Saved (est.):”. If required model prices are missing, the estimate MUST be marked unavailable.

#### Scenario: Cache savings have no model prices
- **WHEN** input or cache-read prices are unavailable for a model’s cache reads
- **THEN** the dashboard marks “Saved (est.):” as unavailable instead of inventing a savings value

#### Scenario: Show Total saved as the third row
- **WHEN** usage data is available for the session overview
- **THEN** the dashboard shows the indented gray “Saved (est.):” row after “Mainagent:” and “Subagents:” and before Session Total

### Requirement: Use colors from the active theme
The dashboard MUST use the active host theme for neutral text and a consistent mode-specific palette for status and context accents. Missing neutral text colors MUST use safe fallbacks, and accent colors MUST remain distinct from neutral text.

#### Scenario: Theme does not define every hue color
- **WHEN** the active theme does not define some hue colors
- **THEN** neutral text uses available host values or safe fallbacks, while status and context accents remain distinct and readable for the active mode

#### Scenario: Context usage can be measured
- **WHEN** an agent’s latest reported context token count and model context limit are known
- **THEN** the dashboard shows the percentage on the left and used/total tokens on the right of the context row

#### Scenario: Context data is unavailable
- **WHEN** an agent’s token count or context limit cannot be determined
- **THEN** the dashboard marks its context usage as unavailable and does not show an invented percentage

### Requirement: Use the same light blue for loaded skills and spinner
Loaded skill dots and names MUST use the loaded-skill color from the active plugin palette. The active execution spinner MUST use the working-status color from that same palette.

#### Scenario: Color a loaded skill row and spinner
- **WHEN** a skill is loaded and an agent is running
- **THEN** the skill dot and name use the loaded-skill color, and the spinner uses the working-status color for the active mode

#### Scenario: Theme uses other shades of blue
- **WHEN** the active theme defines different shades of blue
- **THEN** the skill dot and name, and the spinner, use their respective plugin colors for the active mode

### Requirement: Insert a skill into chat input with a click
A single mouse click on a skill in the main session MUST start the existing native-picker flow only when an OpenCode prompt editor is already the current focused editor. If no OpenCode prompt editor is focused at click time, the plugin MUST immediately and silently do nothing: it MUST NOT show a toast, open the picker, schedule a delayed insertion, or change the prompt. No manual focus change is required. When the prompt is focused and route/catalog identity still match, the flow MUST insert the native `@skill` reference without submitting the input and MUST NOT require a second user click or picker action. Preserve the existing renderer frame gate, route/catalog checks, and timeout/cancel cleanup. The internal picker/frame-gate dependency is unsupported and unverified; this requirement does not claim host support or verified compatibility.

#### Scenario: Insert a skill reference
- **WHEN** the user clicks a skill in the main session while its OpenCode prompt is already focused and its session and skill catalog are still current
- **THEN** its native `@skill` reference appears in the chat input and remains unsent

#### Scenario: No OpenCode prompt is focused at click time
- **WHEN** the user clicks a skill while the current focused editor is not an OpenCode prompt
- **THEN** the plugin immediately returns without a toast, picker dispatch, delayed insertion, or prompt change

#### Scenario: Native picker is cancelled
- **WHEN** the user cancels the native skill picker
- **THEN** the prompt remains unchanged and unsent, and the picker listeners, frame callback, and timeout are cleaned up without a warning

#### Scenario: Skill insertion cannot complete safely
- **WHEN** the route or skill catalog becomes stale, or the native picker times out
- **THEN** the plugin leaves the prompt unsent, retains its existing warning, and cleans up the picker listeners, frame callback, and timeout

## ADDED Requirements

### Requirement: Keep dashboard controls mouse-only
Dashboard sections, subagents, models, and skills MUST be operated with the mouse only. The dashboard MUST NOT add keyboard bindings or focus integration, or intercept user keyboard input. A mouse-triggered skill insertion MAY dispatch native picker commands programmatically, but MUST NOT require user keyboard input.

#### Scenario: Use dashboard controls with the mouse
- **WHEN** the user clicks a section heading, subagent, model name, or skill
- **THEN** the matching dashboard action occurs without changing normal prompt keyboard behavior

### Requirement: Keep the dashboard available when host data is incomplete
The dashboard MUST render a usable sidebar when optional or malformed host data is missing, and MUST identify unavailable values without throwing or replacing missing values with fabricated numbers. When context data or its model limit is unavailable, the context row MUST show “Context: unavailable” instead of mixing unavailable text with dash placeholders.

#### Scenario: Session or model details are unavailable
- **WHEN** a session, model catalog, token counter, or provider detail is missing or malformed
- **THEN** the dashboard shows the corresponding value as unavailable and keeps other available sections visible

#### Scenario: A session family changes during refresh
- **WHEN** a session disappears from the family while dashboard data is refreshing
- **THEN** the sidebar remains mounted and renders the remaining sessions without an exception
