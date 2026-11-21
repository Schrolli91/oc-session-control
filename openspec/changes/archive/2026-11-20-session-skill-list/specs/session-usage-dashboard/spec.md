# Spec Delta

## ADDED Requirements

### Requirement: Show the main session’s skill list
The sidebar MUST list all skills visible to the main session from the host, with their names and status icons. The indented heading MUST show the loaded and total skill counts as gray `(n/x)`. The entire list MUST be indented by two columns, like the content rows above. Unloaded skills MUST use a gray open circle `○`; successfully loaded skills MUST use a light-blue filled circle `●`. Loaded skills MUST appear before unloaded skills in the order of their first successful load; unloaded skills retain host catalog order.

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
Loaded skill dots and names, and the active execution spinner, MUST use the same bright blue `#58A6FF`.

#### Scenario: Color a loaded skill row and spinner
- **WHEN** a skill is loaded and an agent is running
- **THEN** the skill dot, skill name, and spinner use the same blue `#58A6FF`

#### Scenario: Theme uses other shades of blue
- **WHEN** the active theme defines different shades of blue
- **THEN** the skill dot, skill name, and spinner still use the shared blue `#58A6FF`

### Requirement: Show skill token estimates
The main list MUST show a right-aligned token estimate for each skill. The heading MUST show the right-aligned gray sum for loaded visible skills. Estimates MUST use `ceil(UTF-8-Bytes of skill content / 4)`.

#### Scenario: Show an individual skill size
- **WHEN** a visible skill’s content is 5,600 UTF-8 bytes
- **THEN** its row shows `~1.4k tok` right-aligned

#### Scenario: Sum loaded skill token estimates
- **WHEN** two visible loaded skills are estimated at 1k and 400 tok
- **THEN** the heading shows `~1.4k tok` right-aligned in gray

#### Scenario: Skill content is missing
- **WHEN** a skill’s content is unavailable
- **THEN** its row shows `— tok`; if content is missing for a loaded skill, the total is also unavailable

#### Scenario: Long skill name with token count
- **WHEN** a skill name is longer than the space available before the token count
- **THEN** the row shortens the name with `…` and leaves at least one space before the right-aligned token count

### Requirement: Collapse unloaded skills
Clicking the skill heading MUST toggle unloaded skill rows. Loaded skills MUST remain visible when collapsed.

#### Scenario: Hide unloaded skills
- **WHEN** the user clicks the expanded skill heading
- **THEN** unloaded skills disappear while loaded skills remain visible

#### Scenario: Expand the skill list again
- **WHEN** the user clicks the collapsed skill heading again
- **THEN** all visible skills appear again

### Requirement: Insert a skill into chat input with a click
A click on a skill in the main session MUST insert its native `@skill` reference into the current chat input and MUST NOT submit the input.

#### Scenario: Insert a skill reference
- **WHEN** the user clicks a skill in the main session
- **THEN** its native `@skill` reference appears in the chat input and remains unsent

### Requirement: Show loaded skills per subagent
The sidebar MUST show only skills successfully loaded in each subagent’s own session. If at least one skill is loaded, it MUST show an indented, non-clickable `Skills: skillA, SkillB` row in load order. Unloaded skills MUST NOT appear there.

#### Scenario: Subagent has loaded skills
- **WHEN** a subagent has successfully loaded one or more skills
- **THEN** its entry shows `Skills: ` followed by those skills in load order as a comma-separated, non-clickable text block

#### Scenario: Subagent has no loaded skills
- **WHEN** a subagent has not successfully loaded any skills
- **THEN** its entry shows no skill list and no unloaded skills
