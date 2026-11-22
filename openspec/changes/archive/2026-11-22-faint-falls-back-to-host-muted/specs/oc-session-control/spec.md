# Spec Delta

## MODIFIED Requirements

### Requirement: Use colors from the active theme
The dashboard MUST use the active host theme for neutral text and a consistent mode-specific palette for status and context accents. Missing neutral text colors MUST fall back to the next available host value before the mode palette: a missing or invalid `faint` color MUST use the host's `muted` color, and the palette gray applies only when neither is valid. Accent colors MUST remain distinct from neutral text.

#### Scenario: Theme does not define every hue color
- **WHEN** the active theme does not define some hue colors
- **THEN** neutral text uses available host values or safe fallbacks, while status and context accents remain distinct and readable for the active mode

#### Scenario: Theme defines muted but not faint
- **WHEN** the active theme provides a valid `muted` neutral text color but no usable `faint` color
- **THEN** neutral text uses the host `muted` value as `faint`, and the mode palette gray is used only when neither the host `faint` nor the host `muted` is a valid color

#### Scenario: Context usage can be measured
- **WHEN** an agent’s latest reported context token count and model context limit are known
- **THEN** the dashboard shows the percentage on the left and used/total tokens on the right of the context row

#### Scenario: Context data is unavailable
- **WHEN** an agent’s token count or context limit cannot be determined
- **THEN** the dashboard marks its context usage as unavailable and does not show an invented percentage
