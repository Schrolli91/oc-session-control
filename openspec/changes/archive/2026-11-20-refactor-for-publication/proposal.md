# Proposal

## Why

The dashboard works locally, but the repository is not ready for public review: its main UI and helper module mix several concerns, most documentation is German, and the project has no documented compatibility or release checks. Review also found cases where the implementation hides or misstates data that the existing specification already promises.

## What Changes

- Restructure the plugin into focused UI, lifecycle, and domain-helper modules without changing its documented dashboard behavior.
- Fix existing contract gaps: show available agent costs without token counters, use each session's location for form and model data, keep the dashboard bound to the active session, and avoid presenting lifetime cache savings as reliable when model usage cannot be attributed.
- Reject invalid negative context-token counts and add regression coverage for these data edge cases.
- Translate repository documentation and OpenSpec history into English while preserving meaning; audit unchecked archived tasks and change their status only when verification provides evidence.
- Add public-repository release basics: supported OpenCode/Node versions, test and TUI verification instructions, CI for the existing Node test command, a suitable `.gitignore`, and a maintainer-selected license.
- Keep delivery as a public source repository; do not add npm packaging or new dependencies without a separate decision.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The code fixes restore behavior already required by the existing dashboard specification; documentation and release tooling do not change the product contract.

## Impact

- Plugin code and tests under `.opencode/plugins/session-usage-dashboard/`.
- `README.md` and the existing OpenSpec specifications and archived change documents.
- Repository-level CI, ignore rules, and MIT license metadata using the maintainer-confirmed copyright holder.
- No public API, runtime dependency, or package format changes are planned.

## Assumptions

- “Publication” means publishing this source repository, not distributing a packaged plugin.
- Existing visible dashboard behavior remains stable except where the implementation currently violates its documented contract or reports an estimate without sufficient attribution.
