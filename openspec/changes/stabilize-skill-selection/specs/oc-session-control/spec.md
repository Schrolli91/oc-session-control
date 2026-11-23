# Spec Delta

## MODIFIED Requirements

### Requirement: Keep dashboard controls mouse-only
Dashboard sections, subagents, and models MUST be operated with the mouse only. The dashboard MUST NOT add keyboard bindings or focus integration, or intercept user keyboard input. Skill rows are informational and MUST NOT invoke an action when clicked.

#### Scenario: Use dashboard controls with the mouse
- **WHEN** the user clicks a section heading, subagent, or model name
- **THEN** the matching dashboard action occurs without changing normal prompt keyboard behavior

#### Scenario: No OpenCode prompt is focused at click time
- **WHEN** the user clicks a skill row while the current focused editor is not an OpenCode prompt
- **THEN** the row remains informational: no picker opens, no prompt is changed, and no toast is shown

#### Scenario: Native picker is cancelled
- **WHEN** the user cancels a native skill picker opened independently of the dashboard
- **THEN** the dashboard does not intercept the cancellation or change the prompt

#### Scenario: Skill insertion cannot complete safely
- **WHEN** the user clicks a skill row while the session or skill catalog is changing
- **THEN** the row remains informational and the dashboard does not open a picker, change the prompt, or show a warning

#### Scenario: Click an informational skill row
- **WHEN** the user clicks a skill row while an OpenCode prompt is focused
- **THEN** the dashboard does not open a picker, change the prompt, or show a message implying that insertion occurred

#### Scenario: Invoke a listed skill manually
- **WHEN** the user wants to invoke a listed skill
- **THEN** the user can enter `@<skill-id>` in the prompt; the dashboard does not claim to insert it

## REMOVED Requirements

### Requirement: Insert a skill into chat input with a click
**Reason**: The implementation depends on private native-picker command IDs, picker ordering, and renderer/editor behavior for which the pinned public TUI API provides no supported targeted-picker or prompt-insertion operation. The assumptions can select the wrong skill and cannot support a reliable insertion guarantee.
**Migration**: Skill rows remain visible but non-actionable. Users can invoke a skill by entering `@<skill-id>` in the prompt, as documented by OpenCode; no dashboard click-to-insert behavior is promised.
