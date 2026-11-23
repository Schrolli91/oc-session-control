# Design

## Context

See proposal.md for motivation and specs/oc-session-control/spec.md for the required behavior. The plugin registers the sidebar in `src/tui.tsx`; `src/dashboard.tsx` renders “Session usage” first. The package version is maintained in `package.json`, and the README documents the outbound update check.

## Goals / Non-Goals

**Goals:**
- Start one bounded update check per plugin setup without awaiting it.
- Reuse its result across dashboard renders and show the notice only after a positive result.
- Keep package metadata as the single source of the running version.

**Non-Goals:**
- Automatically installing or prompting to install an update.
- Persisting results between OpenCode runs or periodically polling during a run.

## Decisions

- Start the check in plugin setup and immediately continue registering the sidebar. Pass the same promise to the dashboard; the dashboard starts with no notice and updates only if the promise resolves with newer-version details. This avoids repeated requests when sessions change. Awaiting the check in setup or checking separately for each session was rejected because it can delay startup or multiply requests.
- Put the GitHub lookup and version comparison in a small helper. Read the running version from the package's `package.json`, rather than duplicating a version constant. Compare semantic versions, including prerelease precedence, so the notice reflects version ordering rather than string ordering.
- Use the runtime's `fetch` against GitHub's latest-release API and an `AbortController` timeout. Compare the release tag after removing its optional leading `v`. Convert non-success responses, invalid metadata, timeouts, and network errors into “no notice”; do not surface a toast or throw into plugin setup. No HTTP or versioning dependency is needed.
- Render a full-width row immediately above “Session usage”: blue `↑` and underlined white “Update available” on the left, with the separating space outside the underline; right-align the white version pair with a gray `→`. Add one blank line after this row only while it is visible.
- Open the static GitHub `/releases` URL on a left click through the directly declared `open` package. The TUI Context exposes no external-browser API; using the system opener avoids shell/platform branching. No release URL from the API payload is needed.
- Always render the existing `SectionDivider` labeled “Session Overview” between the optional update row and “Session usage”.
- Run the dashboard rendering test with Node's `browser` condition as well as OpenTUI FFI, so Solid uses its reactive build and the async result update is exercised.

## Risks / Trade-offs

- [GitHub is unavailable or slow] → Bound the request with a timeout and fail silently; dashboard rendering never waits for it.
- [The check adds an outbound request and may hit GitHub's unauthenticated API limit] → Limit it to one request per plugin setup and document the GitHub request in the README; fail silently on errors.
- [Users may miss an update published during a long OpenCode run] → Accept this trade-off; check again on the next plugin setup rather than polling.

## Migration Plan

No migration is needed. Update the README's network behavior statement to disclose the GitHub Releases API check. Rolling back the release removes the check and notice without changing user data.
