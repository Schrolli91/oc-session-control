# Proposal

## Why

The dashboard works and its 49 unit tests pass, but the repository is not ready for a public audience: the plugin entry file also contains the whole UI, the session lifecycle, and an 85-line native-picker state machine; nothing type-checks the JSX; there is no package metadata and no installation path for anyone who is not already sitting inside this repository. A first-time visitor cannot navigate, install, or verify the code, and a reviewer cannot tell which parts are tested.

## What Changes

- Move plugin implementation and focused tests into the repository's `src/` tree. Keep `.opencode/plugins/oc-session-control/tui.tsx` as a thin project-local auto-load shim, and keep the `./tui` package export working.
- Split the plugin into an entry module, a dashboard component, a session tracker, a pure view-model module, and focused domain helpers.
- Keep neutral text colors from the active host theme, and use an explicit plugin-owned RGB palette for status and context accents in light and dark modes.
- Make the dashboard fail safe. A missing, partial, or unexpected host shape MUST render an unavailable value instead of throwing and taking down the sidebar; context metrics use consistent unavailable copy.
- Align visible output with the published specification: include the subagent count in the `Subagents` divider, correct the cache-savings label, and remove unreachable bar-layout code.
- Keep dashboard sections, subagents, models, and skills mouse-only; leave normal prompt keyboard behavior untouched.
- Preserve the existing single-mouse-click native skill picker and renderer frame gate. A click silently does nothing when an OpenCode prompt is not already focused; retain route/catalog checks and timeout/cancel cleanup. Document the internal picker/frame-gate dependency as unsupported and unverified, without claiming support or requiring a new picker module.
- Add public-repository tooling: `package.json` with a `./tui` export to `src/tui.tsx`, TypeScript configuration, a `check` script that type-checks the TSX sources, line-ending/ignore hygiene, and CI that runs both tests and the type check.
- Document installation for users outside this repository (copy the package root into `.opencode/plugins/`, the global plugins directory, or configure its package path in the global `cli.json`), while keeping the thin project-local auto-load shim for development.
- Use `oc-session-control` as the public name everywhere; the repository folder name `oc-sess-cost` is historical.
- Split the test suite per module, run test discovery recursively in CI, and add coverage for the extracted view model and the currently untested branches.
- Document the architecture, a verified OpenCode version or an explicit unverified/experimental status, and a live TUI verification checklist.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: installation and distribution is no longer limited to a project-local plugin; dashboard sections, subagents, models, and skills are mouse-only, with normal prompt keyboard behavior untouched; the dashboard degrades to unavailable values instead of failing; visible labels and unavailable states become consistent; accent colors use a stable plugin palette for both theme modes.

## Impact

- Plugin source and focused tests under `src/`, with `.opencode/plugins/oc-session-control/tui.tsx` as a thin auto-load shim.
- Root `package.json` exports `./tui` from `src/tui.tsx`; package allowlist includes `src/` and the shim.
- Repository root: new `package.json`, `package-lock.json`, `tsconfig.json`, `.gitattributes`, updated `.gitignore` and `.github/workflows/test.yml`, expanded `README.md`.
- OpenSpec: `openspec/specs/oc-session-control/spec.md` gains the changed requirements.
- No new runtime dependencies. Dev-only dependencies (TypeScript and the host packages used for type resolution) are added for the type check. No npm publication in this change.

## Assumptions

- "Public release" means a usable public source repository with a documented install path, not an npm release.
- Existing dashboard behavior is preserved except for the label, unavailable-state, divider, mouse-only dashboard interaction, source-layout, and plugin-owned light/dark accent-palette changes listed above.
- Live TUI verification remains a manual checklist item; the code cannot claim a supported OpenCode version before it has been run.
- The native picker and renderer frame-gate interaction relies on unsupported, unverified host behavior; preserving it does not establish compatibility or support.
