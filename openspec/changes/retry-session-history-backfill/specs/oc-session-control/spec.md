# Spec Delta

## MODIFIED Requirements

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

#### Scenario: Backfill waits for an active page load
- **WHEN** a history refresh finds more pages while an ordinary page load is in progress
- **THEN** the dashboard waits for that load to settle, then loads all remaining pages if any remain, without starting conflicting loads

#### Scenario: Active page load exhausts history
- **WHEN** an ordinary page load finishes and no older pages remain
- **THEN** the dashboard does not start a redundant full-history backfill
