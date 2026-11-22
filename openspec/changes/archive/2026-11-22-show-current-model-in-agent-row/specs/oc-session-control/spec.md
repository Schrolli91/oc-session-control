# Spec Delta

## ADDED Requirements

### Requirement: Bind context usage to the model that reported it
The dashboard MUST compute the context percentage and the used/total token row from the model of the agent’s latest assistant usage, independently of the model selected on the session.

#### Scenario: Selection changed but no new usage arrived
- **WHEN** the session’s selected model differs from the model of the agent’s latest assistant usage
- **THEN** the context percentage and the used/total tokens keep using the latest assistant usage’s token counts and that model’s context limit

#### Scenario: No assistant usage yet
- **WHEN** an agent has a selected model but no assistant usage reporting token counts
- **THEN** its context usage is shown as unavailable rather than as a percentage derived from the selected model alone

## MODIFIED Requirements

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
