# Spec Delta

## MODIFIED Requirements

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
