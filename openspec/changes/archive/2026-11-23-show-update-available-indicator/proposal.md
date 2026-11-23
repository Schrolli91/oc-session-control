# Proposal

## Why

Users may not notice when a newer release of `oc-session-control` is available. A small, visible notice in the dashboard makes updates discoverable without interrupting the session.

## What Changes

- Start an asynchronous check of the repository's latest GitHub Release and compare its version with the version running in the plugin; plugin setup and dashboard rendering MUST NOT wait for the request.
- When a newer version is available, show a blue `↑` icon followed by underlined white “Update available” text at the top-left of the dashboard and right-align the white running and latest versions, with only the separating arrow in gray.
- Add one blank line after the update row only while that row is visible.
- Always show a “Session Overview” divider between the update notice and the dashboard sections, whether or not an update is available.
- Make the update row clickable and open the GitHub Releases page, where users can browse current and previous changelogs.
- Keep the dashboard usable when GitHub cannot be reached; do not show an update notice unless a newer version is confirmed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Add an update-availability check and a conditional dashboard notice.

## Impact

- `src/tui.tsx` and `src/dashboard.tsx` for checking and displaying update status.
- `openspec/specs/oc-session-control/spec.md` for the dashboard behavior.
- The plugin will make a request to the public GitHub Releases API and use the system browser opener for the release link; failures must not prevent dashboard use. Update the README's network behavior description accordingly.
- Tests for version comparison, conditional rendering, and click behavior.
