# Spec Delta

## ADDED Requirements

### Requirement: Truncate sidebar labels by terminal-cell width
Sidebar labels MUST fit their allocated terminal-cell width, including any trailing ellipsis, and truncation MUST preserve grapheme clusters.

#### Scenario: Wide CJK label is shortened to available cells
- **WHEN** `界界` is allocated three cells
- **THEN** the label is shortened to `界…` and occupies exactly three cells

#### Scenario: Combining marks stay with their base character
- **WHEN** `é界` is allocated two cells
- **THEN** the result is `é…` without separating the combining mark from `e`

#### Scenario: Emoji sequence stays intact
- **WHEN** `👩‍💻xy` is allocated three cells
- **THEN** the result is `👩‍💻…` without splitting the emoji sequence

#### Scenario: ASCII labels preserve exact-fit and truncation behavior
- **WHEN** `main` is allocated four cells and `long subagent title` is allocated seven cells
- **THEN** `main` remains unchanged and `long s…` fits the shorter allocation

#### Scenario: Invalid or zero width
- **WHEN** a label has an invalid or zero-cell allocation
- **THEN** the truncation result is an empty string

#### Scenario: Apply consistent width semantics to every label
- **WHEN** agent, cache, or skill labels are displayed beside other content
- **THEN** their available widths and truncation use terminal-cell semantics and preserve the reserved space for adjacent content
