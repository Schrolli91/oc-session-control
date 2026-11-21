# Spec Delta

## MODIFIED Requirements

### Requirement: Visualize main-agent context usage
When the main agent’s context usage is known, the dashboard MUST show an indented, thin, single-line Unicode bar below its context row spanning the full available width. The used portion is filled proportionally and colored green (<30%), yellow (<50%), orange (<70%), or red (70% or more); the unused portion remains gray. An indented legend below shows `<30 %`, `<50 %`, `<70 %`, and `≥70 %`.

#### Scenario: Display context usage
- **WHEN** the main agent’s context usage is known
- **THEN** the main entry shows a full-width indented bar for used context with the specified color and a gray remainder; the legend below explains the color thresholds

#### Scenario: Keep the context bar stable during live updates
- **WHEN** a session is active and the main agent’s context percentage remains unchanged while other session data updates
- **THEN** the context bar remains visible and proportional without intermittent disappearance or flicker

## ADDED Requirements

### Requirement: Keep usage overview bars full-width and stable during updates
Session Total Input and Output bars MUST span the full available width and remain stable when their underlying token distributions are unchanged.

#### Scenario: Preserve usage bars while unrelated session data updates
- **WHEN** session data updates while an Input or Output breakdown remains unchanged
- **THEN** the corresponding bar remains full-width with unchanged segment proportions and does not flicker or disappear

### Requirement: Keep dashboard section headings stable during live updates
The dashboard MUST keep eligible section headings visible while refreshing their values during active session work.

#### Scenario: Preserve headings while session values update
- **WHEN** session values update while a dashboard section remains eligible for display
- **THEN** its heading remains visible without intermittent disappearance or flicker
