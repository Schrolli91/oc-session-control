# Spec Delta

## ADDED Requirements

### Requirement: Check for updates without delaying the dashboard
The plugin MUST perform its update check asynchronously so plugin setup and dashboard rendering do not wait for GitHub. A failed or timed-out check MUST NOT prevent normal dashboard use.

#### Scenario: Registry check is still pending
- **WHEN** the dashboard is rendered before GitHub responds
- **THEN** the dashboard renders normally without waiting for the check

#### Scenario: Registry check fails or times out
- **WHEN** the GitHub Releases API request fails or times out
- **THEN** the dashboard remains usable and no update notice is shown

### Requirement: Show an update notice when a newer release exists
The dashboard MUST show a blue `↑` icon followed by underlined white “Update available” text at the top-left and right-align the white running and latest versions at the right when the latest stable GitHub Release is newer than the running plugin version. Only the words “Update available” MUST be underlined, not adjacent spacing; only the separating version arrow MUST be gray. A blank line MUST follow the notice only while it is visible.

#### Scenario: A newer stable version is available
- **WHEN** the asynchronous check confirms the latest GitHub Release is newer than the running plugin version
- **THEN** the blue `↑` icon and underlined white “Update available” text appear at the top-left, white `1.0.0` and `1.0.1` versions appear right-aligned with a gray `→` between them, and a blank line follows the notice

#### Scenario: No newer stable version is available
- **WHEN** the latest GitHub Release version is equal to or older than the running plugin version
- **THEN** the dashboard does not show the update notice or its following blank line

### Requirement: Open the GitHub releases page from the update notice
The update notice MUST open the GitHub Releases page when the user left-clicks it.

#### Scenario: Open the release changelog
- **WHEN** the user left-clicks the visible update notice
- **THEN** the system browser opens the GitHub Releases page with current and previous releases

### Requirement: Keep the session overview divider visible
The dashboard MUST always show the “Session Overview” divider above “Session usage”, regardless of update-check state.

#### Scenario: Update is not available
- **WHEN** the dashboard is rendered and no update notice is shown
- **THEN** the “Session Overview” divider remains visible above “Session usage”
