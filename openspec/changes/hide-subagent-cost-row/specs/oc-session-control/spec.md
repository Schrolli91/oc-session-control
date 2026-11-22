# Spec Delta

## MODIFIED Requirements

### Requirement: Show total session costs
The dashboard MUST show the combined costs of the main session and all known subagents in the “Session usage” heading. The cost section MUST be expandable and collapsible, and start expanded. The “Mainagent:” and “Subagents:” rows MUST appear only when the family contains at least one subagent. Every session's cost MUST be counted exactly once: when those rows are shown, the heading MUST equal their sum and the “Mainagent:” row MUST carry only the main session's own cost; when the family has no subagents, the heading alone carries the total.

#### Scenario: Total includes the agent family
- **WHEN** cost data is available for the main session and its subagents
- **THEN** the dashboard shows the sum of all sessions in the agent family on the right of “Session usage” and, when the family has subagents, the individual or partial totals in indented gray rows

#### Scenario: Cost data is partially unavailable
- **WHEN** cost data is unavailable for at least one agent in the family
- **THEN** the dashboard shows the available total and marks it as incomplete rather than treating missing values as zero

#### Scenario: Format prices consistently
- **WHEN** the dashboard shows session or agent costs
- **THEN** all prices are shown to exactly four decimal places

#### Scenario: No subagents are present
- **WHEN** the main session has no subagents
- **THEN** neither the “Mainagent:” nor the “Subagents:” row is shown under “Session usage”, and the heading alone shows the total

#### Scenario: Subagents present but free
- **WHEN** the main session has at least one subagent whose cost is `$0.0000`
- **THEN** the “Mainagent:” and “Subagents:” rows are shown, with the “Subagents:” row reading `$0.0000`

#### Scenario: Cost section is expanded by default
- **WHEN** the session overview is first displayed
- **THEN** “Saved (est.):” is visible under “Session usage” as an indented gray row, and “Mainagent:” and “Subagents:” are visible there only when the family has at least one subagent

#### Scenario: Collapse and expand the cost section
- **WHEN** the user clicks “Session usage”
- **THEN** the cost rows are hidden or shown again while the heading and agent-family total remain visible

#### Scenario: Count each session's cost once
- **WHEN** the agent family consists of the main session and one or more subagents whose costs are all known
- **THEN** the “Mainagent:” row shows only the main session's own cost, the “Subagents:” row shows the sum of the subagent costs, and adding the two rows equals the “Session usage” heading exactly once

#### Scenario: Stop subagent costs from climbing the main row
- **WHEN** subagents spend while the main session itself makes no calls
- **THEN** the “Mainagent:” row stays unchanged and only the “Subagents:” row and the heading increase

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
- **THEN** the dashboard shows the indented gray “Saved (est.):” row after the visible “Mainagent:” and “Subagents:” cost rows and before Session Total, directly under the heading when no cost rows are shown

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
