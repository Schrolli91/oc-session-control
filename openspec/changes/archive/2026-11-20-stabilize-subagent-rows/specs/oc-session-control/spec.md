# Spec Delta

## ADDED Requirements

### Requirement: Keep subagent rows stable during unrelated session updates
The sidebar MUST keep each subagent row visible without flicker when updates to another session leave that subagent’s displayed values unchanged.

#### Scenario: Main-session updates while subagents are idle
- **WHEN** the main session updates while one or more idle subagents’ displayed values remain unchanged
- **THEN** each idle subagent row remains visible without flicker

#### Scenario: Subagent rows reorder after a status change
- **WHEN** a subagent status changes and the list reorders by status priority
- **THEN** each row remains associated with its session, and its displayed status and actions target that session
