# Spec Delta

## ADDED Requirements

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
