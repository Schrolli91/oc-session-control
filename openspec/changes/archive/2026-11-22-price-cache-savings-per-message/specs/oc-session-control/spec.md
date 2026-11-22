# Spec Delta

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
