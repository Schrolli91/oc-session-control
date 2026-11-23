# oc-session-control Specification

## Purpose

This dashboard makes the costs and context usage of an OpenCode session understandable, including the contributions and usage of individual subagents.

## Requirements

### Requirement: Show the project-local plugin in the sidebar by default
The dashboard MUST load from this repository's project-local OpenCode plugin directory without global configuration, and MUST also support installation as a local plugin directory or a configured TUI package in another project or the global plugin directory. It MUST display in the sidebar by default during an active session.

#### Scenario: Dashboard appears in the project sidebar
- **WHEN** the user starts OpenCode with this project as the project directory and opens a session
- **THEN** the session overview and agent values appear directly in the sidebar, without a slash command, global installation, or publication

#### Scenario: Dashboard appears from another project
- **WHEN** the user installs the plugin directory under another project's `.opencode/plugins/` directory or configures its TUI package through OpenCode's supported plugin settings
- **THEN** the session overview and agent values appear in that project's sidebar without changing dashboard behavior

#### Scenario: Dashboard appears from the global plugin directory
- **WHEN** the user installs the plugin under OpenCode's global plugin directory and opens a session
- **THEN** the session overview and agent values appear in the sidebar

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

### Requirement: Bind context usage to the model that reported it
The dashboard MUST compute the context percentage and the used/total token row from the model of the agent’s latest assistant usage, independently of the model selected on the session.

#### Scenario: Selection changed but no new usage arrived
- **WHEN** the session’s selected model differs from the model of the agent’s latest assistant usage
- **THEN** the context percentage and the used/total tokens keep using the latest assistant usage’s token counts and that model’s context limit

#### Scenario: No assistant usage yet
- **WHEN** an agent has a selected model but no assistant usage reporting token counts
- **THEN** its context usage is shown as unavailable rather than as a percentage derived from the selected model alone

### Requirement: Show each agent’s model name
The dashboard MUST show a gray row directly below each agent title, with “Model:” on the left and the model name on the right. The row MUST report the model selected on the session, and fall back to the model of the agent’s latest assistant usage only when the session has no selected model.

#### Scenario: Selected model differs from the last used model
- **WHEN** the session has a selected model that differs from the model of its latest assistant usage
- **THEN** the agent entry shows the selected model’s name right-aligned

#### Scenario: Determine the model name from usage data
- **WHEN** the session has no selected model and a model is known from an agent’s latest assistant usage
- **THEN** the agent entry shows that model’s name right-aligned

#### Scenario: Neither a selection nor usage is available
- **WHEN** the session has no selected model and no assistant usage reports a model
- **THEN** the agent entry shows `unavailable` for its model name

### Requirement: Open model details
The dashboard MUST open OpenCode’s native alert dialog with model, provider, limit, and pricing information when the user left-clicks the model name. The model name MUST be underlined when it can open that dialog, for both the main session and subagents; a model label that cannot open the dialog MUST NOT be underlined.

#### Scenario: View model details
- **WHEN** the user clicks an agent’s model name
- **THEN** the native dialog remains open and shows the model name and ID, provider, token limits, and input, cache, and output prices, including any context price tiers; OK or Esc closes it

#### Scenario: Identify a clickable model name
- **WHEN** an agent has a model that can open model details
- **THEN** its model name is underlined in the main session and subagent rows

#### Scenario: Model details are unavailable
- **WHEN** an agent has no model reference that can open model details
- **THEN** its model label is not underlined

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
- **THEN** the main session remains first; subagents appear in that order and retain their existing order within each status group

### Requirement: Keep subagent rows stable during unrelated session updates
The sidebar MUST keep each subagent row visible without flicker when updates to another session leave that subagent’s displayed values unchanged.

#### Scenario: Main-session updates while subagents are idle
- **WHEN** the main session updates while one or more idle subagents’ displayed values remain unchanged
- **THEN** each idle subagent row remains visible without flicker

#### Scenario: Subagent rows reorder after a status change
- **WHEN** a subagent status changes and the list reorders by status priority
- **THEN** each row remains associated with its session, and its displayed status and actions target that session

### Requirement: Use colors from the active theme
The dashboard MUST use the active host theme for neutral text and a consistent mode-specific palette for status and context accents. Missing neutral text colors MUST fall back to the next available host value before the mode palette: a missing or invalid `faint` color MUST use the host's `muted` color, and the palette gray applies only when neither is valid. Accent colors MUST remain distinct from neutral text.

#### Scenario: Theme does not define every hue color
- **WHEN** the active theme does not define some hue colors
- **THEN** neutral text uses available host values or safe fallbacks, while status and context accents remain distinct and readable for the active mode

#### Scenario: Theme defines muted but not faint
- **WHEN** the active theme provides a valid `muted` neutral text color but no usable `faint` color
- **THEN** neutral text uses the host `muted` value as `faint`, and the mode palette gray is used only when neither the host `faint` nor the host `muted` is a valid color

#### Scenario: Context usage can be measured
- **WHEN** an agent’s latest reported context token count and model context limit are known
- **THEN** the dashboard shows the percentage on the left and used/total tokens on the right of the context row

#### Scenario: Context data is unavailable
- **WHEN** an agent’s token count or context limit cannot be determined
- **THEN** the dashboard marks its context usage as unavailable and does not show an invented percentage

### Requirement: Keep the dashboard available when host data is incomplete
The dashboard MUST render a usable sidebar when optional or malformed host data is missing, and MUST identify unavailable values without throwing or replacing missing values with fabricated numbers. When context data or its model limit is unavailable, the context row MUST show “Context: unavailable” instead of mixing unavailable text with dash placeholders.

#### Scenario: Session or model details are unavailable
- **WHEN** a session, model catalog, token counter, or provider detail is missing or malformed
- **THEN** the dashboard shows the corresponding value as unavailable and keeps other available sections visible

#### Scenario: A session family changes during refresh
- **WHEN** a session disappears from the family while dashboard data is refreshing
- **THEN** the sidebar remains mounted and renders the remaining sessions without an exception

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

### Requirement: Keep usage overview bars full-width and stable during updates
Session Total Input and Output bars MUST span the full available width and remain stable when their underlying token distributions are unchanged.

#### Scenario: Preserve usage bars while unrelated session data updates
- **WHEN** session data updates while an Input or Output breakdown remains unchanged
- **THEN** the corresponding bar remains full-width with unchanged segment proportions and does not flicker or disappear

### Requirement: Read the whole session transcript
The dashboard MUST read every message page a session's host still serves, not only the newest page the client loads by default, and MUST keep already loaded pages while usage updates refresh the session. Values derived from messages MUST reflect the whole transcript whenever the host still offers it.

#### Scenario: Session is longer than the default page
- **WHEN** a session has more messages than the client's default page, and a model switch or a skill load is older than that page
- **THEN** the dashboard loads the remaining pages and derives its message-based values from the whole transcript instead of from the newest page alone

#### Scenario: Usage update refreshes a session with loaded history
- **WHEN** new usage data arrives for a session whose older message pages are already loaded
- **THEN** the loaded older messages stay loaded instead of being replaced by the newest page

#### Scenario: Host no longer serves older messages
- **WHEN** the host has compacted a session and no longer returns its older messages
- **THEN** the dashboard reads every message the host still serves and does not treat the first loaded page as the whole transcript

### Requirement: Avoid redundant history reloads during execution updates
The dashboard MUST refresh session values on ordinary execution lifecycle events without reloading an already available transcript. It MUST still load history when none is available and MUST apply explicit history-changing updates, including compaction, even when they overlap a lightweight refresh.

#### Scenario: Execution update with loaded transcript
- **WHEN** an ordinary execution lifecycle event arrives for a session with loaded messages
- **THEN** the dashboard refreshes session values without invalidating, syncing, or backfilling the message history

#### Scenario: Execution update without loaded transcript
- **WHEN** an ordinary execution lifecycle event arrives for a session with no loaded messages
- **THEN** the dashboard loads the available message history so message-derived values can be computed

#### Scenario: Compaction overlaps a lightweight refresh
- **WHEN** a compaction event requests a history update while a lightweight refresh for the same session is in progress
- **THEN** the dashboard completes a history-changing refresh and updates its message-derived values from the available transcript

### Requirement: Estimate cache savings
The dashboard MUST estimate cache savings by pricing each assistant call’s cache-read tokens with that call’s own model’s applicable prices — the context price tier when the call’s window exceeds it, minus the cache-write premium, clamped at zero — then label the indented gray estimate row “Saved (est.):”. When part of the family’s cache reads cannot be priced, the row MUST report that as `(partial)`; when no cache read can be priced, it MUST be marked unavailable.

#### Scenario: Model switch keeps the estimate
- **WHEN** a session’s assistant history contains calls on more than one model and every call’s model has an input and a cache-read price
- **THEN** the dashboard sums each call’s own savings estimate and shows the row as a price, not as unavailable

#### Scenario: Selecting a model before using it
- **WHEN** the session’s selected model differs from the models in its assistant history but no assistant call has run on the new model yet
- **THEN** the dashboard still shows the estimate for the calls that exist instead of marking the row unavailable

#### Scenario: Part of the family cannot be priced
- **WHEN** some sessions’ cache reads can be priced and another session’s cache reads cannot be priced or attributed
- **THEN** the dashboard shows the priced total followed by `(partial)` rather than hiding the whole row

#### Scenario: Compacted history shortens the estimate
- **WHEN** a session’s history no longer contains the assistant calls that produced part of its cache reads
- **THEN** the dashboard counts only the calls it can still see and reports the row as `(partial)` instead of estimating the missing part

#### Scenario: Cache savings have no model prices
- **WHEN** input or cache-read prices are unavailable for every cache read in the agent family
- **THEN** the dashboard marks “Saved (est.):” as unavailable instead of inventing a savings value

#### Scenario: No cache reads at all
- **WHEN** the agent family reports no cache reads
- **THEN** the dashboard shows the zero estimate instead of marking the row unavailable

#### Scenario: Show Total saved as the third row
- **WHEN** usage data is available for the session overview
- **THEN** the dashboard shows the indented gray “Saved (est.):” row after the visible “Mainagent:” and “Subagents:” cost rows and before Session Total, directly under the heading when no cost rows are shown

#### Scenario: Model switch older than the loaded transcript
- **WHEN** a session’s lifetime cache reads include calls made under an earlier model, and that model switch is not in the messages the client loaded by default
- **THEN** the dashboard prices those calls under their own model instead of pricing the whole lifetime counter with the newest model

#### Scenario: Assistant call reports no cache reads
- **WHEN** one assistant call in a session reports no cache-read token count while other calls in the session report cache reads with known prices
- **THEN** the dashboard skips that call and still shows the session’s priced savings instead of dropping the session’s contribution to zero

#### Scenario: Lifetime reads exceed the visible calls
- **WHEN** a session’s lifetime cache-read counter is larger than the sum of the cache reads its loaded assistant calls report, with no recorded compaction
- **THEN** the dashboard reports the priced part followed by `(partial)` instead of presenting the lower bound as a complete figure

#### Scenario: Price above the context tier
- **WHEN** an assistant call’s context window exceeds the model’s context price tier threshold
- **THEN** that call’s cache-read tokens are priced with the context tier’s input and cache-read prices instead of the model’s base prices

#### Scenario: Subtract cache-write costs
- **WHEN** an assistant call reports cache-write tokens
- **THEN** the estimate subtracts that call’s cache-write premium (cache-write price minus input price) for those tokens from the call’s savings

#### Scenario: Savings are never negative
- **WHEN** a call’s cache-write premium exceeds its cache-read savings
- **THEN** that call contributes zero to the estimate instead of a negative amount

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

### Requirement: Visualize main-agent context usage
When the main agent’s context usage is known, the dashboard MUST show an indented, thin, single-line Unicode bar below its context row spanning the full available width. The used portion is filled proportionally and colored green (<30%), yellow (<50%), orange (<70%), or red (70% or more); the unused portion MUST use the same subtle, dimmed faint color as section dividers. An indented legend below shows `<30 %`, `<50 %`, `<70 %`, and `≥70 %`.

#### Scenario: Display context usage
- **WHEN** the main agent’s context usage is known
- **THEN** the main entry shows a full-width indented bar for used context with the specified color and an unused remainder matching the subtle, dimmed section dividers; the legend below explains the color thresholds

#### Scenario: Keep the context bar stable during live updates
- **WHEN** a session is active and the main agent’s context percentage remains unchanged while other session data updates
- **THEN** the context bar remains visible and proportional without intermittent disappearance or flicker

### Requirement: Keep usage data up to date
The dashboard MUST update totals and agent values as soon as new session or usage data becomes available for the displayed agent family.

#### Scenario: New usage data arrives
- **WHEN** OpenCode provides updated cost or token usage data for an agent
- **THEN** the dashboard shows the updated values for that agent and any affected totals

#### Scenario: Compaction updates context
- **WHEN** OpenCode completes compaction of a displayed session
- **THEN** the dashboard reloads its messages and updates context values and derived bars

### Requirement: Keep dashboard section headings stable during live updates
The dashboard MUST keep eligible section headings visible while refreshing their values during active session work.

#### Scenario: Preserve headings while session values update
- **WHEN** session values update while a dashboard section remains eligible for display
- **THEN** its heading remains visible without intermittent disappearance or flicker

### Requirement: Show the main session’s skill list
The sidebar MUST list host-visible skills for the main session with their names and status icons. The indented heading MUST show the loaded and total skill counts as gray `(n/x)`. Unloaded skills MUST use a gray open circle `○`; successfully loaded skills MUST use a light-blue filled circle `●`. Loaded skills appear first in their initial successful load order; unloaded skills retain host catalog order.

#### Scenario: Distinguish available and loaded skills
- **WHEN** a main session is open and skills are available
- **THEN** the list shows all visible skills; unloaded skills have a gray `○`, and loaded skills have a light-blue `●`

#### Scenario: Count loaded skills
- **WHEN** two of five visible skills are loaded
- **THEN** the heading shows `Skills (2/5)` with `(2/5)` in gray

#### Scenario: Update the color of a loaded skill
- **WHEN** a skill loads successfully in the main session
- **THEN** its status dot changes from gray to light blue without marking other skills as loaded

#### Scenario: Sort loaded skills by load order
- **WHEN** Skill B loads successfully before Skill A and other skills remain unloaded
- **THEN** B and then A appear at the top; all unloaded skills follow in host catalog order

### Requirement: Use the same light blue for loaded skills and spinner
Loaded skill dots and names MUST use the loaded-skill color from the active plugin palette. The active execution spinner MUST use the working-status color from that same palette.

#### Scenario: Color a loaded skill row and spinner
- **WHEN** a skill is loaded and an agent is running
- **THEN** the skill dot and name use the loaded-skill color, and the spinner uses the working-status color for the active mode

#### Scenario: Theme uses other shades of blue
- **WHEN** the active theme defines different shades of blue
- **THEN** the skill dot and name, and the spinner, use their respective plugin colors for the active mode

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

### Requirement: Insert a skill into chat input with a click
A single mouse click on a skill in the main session MUST start the existing native-picker flow only when an OpenCode prompt editor is already the current focused editor. If no OpenCode prompt editor is focused at click time, the plugin MUST immediately and silently do nothing: it MUST NOT show a toast, open the picker, schedule a delayed insertion, or change the prompt. No manual focus change is required. When the prompt is focused and route/catalog identity still match, the flow MUST insert the native `@skill` reference without submitting the input and MUST NOT require a second user click or picker action. Preserve the existing renderer frame gate, route/catalog checks, and timeout/cancel cleanup. The internal picker/frame-gate dependency is unsupported and unverified; this requirement does not claim host support or verified compatibility.

#### Scenario: Insert a skill reference
- **WHEN** the user clicks a skill in the main session while its OpenCode prompt is already focused and its session and skill catalog are still current
- **THEN** its native `@skill` reference appears in the chat input and remains unsent

### Requirement: Keep dashboard controls mouse-only
Dashboard sections, subagents, models, and skills MUST be operated with the mouse only. The dashboard MUST NOT add keyboard bindings or focus integration, or intercept user keyboard input. A mouse-triggered skill insertion MAY dispatch native picker commands programmatically, but MUST NOT require user keyboard input.

#### Scenario: Use dashboard controls with the mouse
- **WHEN** the user clicks a section heading, subagent, model name, or skill
- **THEN** the matching dashboard action occurs without changing normal prompt keyboard behavior

#### Scenario: No OpenCode prompt is focused at click time
- **WHEN** the user clicks a skill while the current focused editor is not an OpenCode prompt
- **THEN** the plugin immediately returns without a toast, picker dispatch, delayed insertion, or prompt change

#### Scenario: Native picker is cancelled
- **WHEN** the user cancels the native skill picker
- **THEN** the prompt remains unchanged and unsent, and the picker listeners, frame callback, and timeout are cleaned up without a warning

#### Scenario: Skill insertion cannot complete safely
- **WHEN** the route or skill catalog becomes stale, or the native picker times out
- **THEN** the plugin leaves the prompt unsent, retains its existing warning, and cleans up the picker listeners, frame callback, and timeout

### Requirement: Show loaded skills per subagent
The sidebar MUST show only skills successfully loaded in each subagent’s own session. If at least one skill is loaded, it MUST show an indented, non-clickable `Skills: skillA, SkillB` row in load order. Unloaded skills MUST NOT appear there.

#### Scenario: Subagent has loaded skills
- **WHEN** a subagent has successfully loaded one or more skills
- **THEN** its entry shows `Skills: ` followed by those skills in load order as a comma-separated, non-clickable text block

#### Scenario: Subagent has no loaded skills
- **WHEN** a subagent has not successfully loaded any skills
- **THEN** its entry shows no skill list and no unloaded skills

### Requirement: Check for updates without delaying the dashboard
The plugin MUST perform its update check asynchronously so plugin setup and dashboard rendering do not wait for GitHub. A failed or timed-out check MUST NOT prevent normal dashboard use.

#### Scenario: Registry check is still pending
- **WHEN** the dashboard is rendered before GitHub responds
- **THEN** the dashboard renders normally without waiting for the check

#### Scenario: Registry check fails or times out
- **WHEN** the GitHub Releases API request fails or times out
- **THEN** the dashboard remains usable and no update notice is shown

### Requirement: Show an update notice when a newer release exists
The dashboard MUST show a blue `↑` icon followed by underlined white “Update available” text at the top-left and right-align the white running and latest versions at the right when the latest stable GitHub Release is newer than the running plugin version. Only the words “Update available” MUST be underlined, not adjacent spacing; only the separating version arrow MUST be gray. A blank line MUST follow the notice only while it is visible.

#### Scenario: A newer stable version is available
- **WHEN** the asynchronous check confirms the latest GitHub Release is newer than the running plugin version
- **THEN** the blue `↑` icon and underlined white “Update available” text appear at the top-left, white `1.0.0` and `1.0.1` versions appear right-aligned with a gray `→` between them, and a blank line follows the notice

#### Scenario: No newer stable version is available
- **WHEN** the latest GitHub Release version is equal to or older than the running plugin version
- **THEN** the dashboard does not show the update notice or its following blank line

### Requirement: Open the GitHub releases page from the update notice
The update notice MUST open the GitHub Releases page when the user left-clicks it.

#### Scenario: Open the release changelog
- **WHEN** the user left-clicks the visible update notice
- **THEN** the system browser opens the GitHub Releases page with current and previous releases

### Requirement: Keep the session overview divider visible
The dashboard MUST always show the “Session Overview” divider above “Session usage”, regardless of update-check state.

#### Scenario: Update is not available
- **WHEN** the dashboard is rendered and no update notice is shown
- **THEN** the “Session Overview” divider remains visible above “Session usage”

### Requirement: Stop pending session refresh work after disposal
Disposal MUST prevent pending refresh work from starting additional host sync, invalidation, or form operations. Operations already started may finish, and their promises MUST settle without unhandled rejections.

#### Scenario: Dispose while a session sync is pending
- **WHEN** a refresh is waiting for a session, message, or permission sync and the tracker is disposed
- **THEN** after the pending sync settles, the refresh starts no further sync, invalidation, transcript loading, or form operation

#### Scenario: Pending refresh promises settle after disposal
- **WHEN** the tracker is disposed while refresh operations are pending
- **THEN** those refresh promises settle safely and disposal remains idempotent with listener cleanup preserved
