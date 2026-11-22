# Spec Delta

## MODIFIED Requirements

### Requirement: Show cache hit rates and the latest call
The dashboard MUST show the agent family’s cache hit rate and the latest assistant call’s hit rate and change from the previous call. The “Cache” section MUST be clickable, expanded by default, and show “Last call” and “TTL” as indented rows. A subtle divider labeled “Mainagent” MUST separate Cache from the main entry.

#### Scenario: Show agent-family cache rates
- **WHEN** cumulative token counters and at least one assistant call are available
- **THEN** “Cache” shows the total rate `Cache-Reads / (Input + Cache-Reads + Cache-Writes)`, and “Last call” shows the latest rate and its directional change from the previous rate. Rates are truncated to two decimal places; the change is rounded to one decimal place and appears before the latest rate.

#### Scenario: Cache writes are not hits
- **WHEN** the agent family reports cache writes greater than zero
- **THEN** the cache writes are counted in the denominator of the total rate so that they neither raise nor hide the hit rate

#### Scenario: Cache details are expanded by default
- **WHEN** the Cache overview is first displayed
- **THEN** “Last call” and “TTL” are visible as indented rows under “Cache”

#### Scenario: Collapse and expand Cache details
- **WHEN** the user clicks “Cache”
- **THEN** “Last call” and “TTL” are hidden or shown again while the Cache heading and total hit rate remain visible

#### Scenario: Visually separate Cache from the main agent
- **WHEN** the Cache section and main entry are displayed one after the other
- **THEN** a blank line and a subtle solid horizontal divider labeled “Mainagent” separate the sections

#### Scenario: Show the divider in a narrow sidebar
- **WHEN** the sidebar is narrower than a divider label and its surrounding spaces
- **THEN** the divider shows a solid line without a truncated label

### Requirement: Estimate cache savings
The dashboard MUST estimate cache savings by pricing each assistant call’s cache-read tokens with that call’s own model’s applicable prices — the context price tier when the call’s window exceeds it, minus the cache-write premium, clamped at zero — then label the indented gray estimate row “Saved (est.):”. When part of the family’s cache reads cannot be priced, the row MUST report that as `(partial)`; when no cache read can be priced, it MUST be marked unavailable.

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

#### Scenario: Price above the context tier
- **WHEN** an assistant call’s context window exceeds the model’s context price tier threshold
- **THEN** that call’s cache-read tokens are priced with the context tier’s input and cache-read prices instead of the model’s base prices

#### Scenario: Subtract cache-write costs
- **WHEN** an assistant call reports cache-write tokens
- **THEN** the estimate subtracts that call’s cache-write premium (cache-write price minus input price) for those tokens from the call’s savings

#### Scenario: Savings are never negative
- **WHEN** a call’s cache-write premium exceeds its cache-read savings
- **THEN** that call contributes zero to the estimate instead of a negative amount
