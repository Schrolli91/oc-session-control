# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Estimate cache savings
The dashboard MUST estimate cache savings by pricing each assistant call’s cache-read tokens with that call’s own model’s input and cache-read prices, then label the indented gray estimate row “Saved (est.):”. When part of the family’s cache reads cannot be priced, the row MUST report that as `(partial)`; when no cache read can be priced, it MUST be marked unavailable.

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
- **THEN** the dashboard shows the indented gray “Saved (est.):” row after “Mainagent:” and “Subagents:” and before Session Total

#### Scenario: Model switch older than the loaded transcript
- **WHEN** a session’s lifetime cache reads include calls made under an earlier model, and that model switch is not in the messages the client loaded by default
- **THEN** the dashboard prices those calls under their own model instead of pricing the whole lifetime counter with the newest model

#### Scenario: Assistant call reports no cache reads
- **WHEN** one assistant call in a session reports no cache-read token count while other calls in the session report cache reads with known prices
- **THEN** the dashboard skips that call and still shows the session’s priced savings instead of dropping the session’s contribution to zero

#### Scenario: Lifetime reads exceed the visible calls
- **WHEN** a session’s lifetime cache-read counter is larger than the sum of the cache reads its loaded assistant calls report, with no recorded compaction
- **THEN** the dashboard reports the priced part followed by `(partial)` instead of presenting the lower bound as a complete figure
