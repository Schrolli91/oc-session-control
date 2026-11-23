# Spec Delta

## ADDED Requirements

### Requirement: Stop pending session refresh work after disposal
Disposal MUST prevent pending refresh work from starting additional host sync, invalidation, or form operations. Operations already started may finish, and their promises MUST settle without unhandled rejections.

#### Scenario: Dispose while a session sync is pending
- **WHEN** a refresh is waiting for a session, message, or permission sync and the tracker is disposed
- **THEN** after the pending sync settles, the refresh starts no further sync, invalidation, transcript loading, or form operation

#### Scenario: Pending refresh promises settle after disposal
- **WHEN** the tracker is disposed while refresh operations are pending
- **THEN** those refresh promises settle safely and disposal remains idempotent with listener cleanup preserved
