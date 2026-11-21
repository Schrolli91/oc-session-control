# Proposal

## Why

The project is being prepared for release under the title `oc-session-control`, but its plugin identity, directory, documentation, tests, and current specification still use `session-usage-dashboard`. Aligning these names avoids stale references and gives the release one consistent identity.

## What Changes

- Rename the project-local plugin directory and OpenCode plugin ID to `oc-session-control`.
- Update active documentation and CI test paths to use the new name.
- Rename and retitle the current capability specification as `oc-session-control`, preserving its final requirements as a clean baseline rather than preserving intermediate iterations.
- Remove the existing archived OpenSpec change records before release; retain the normal OpenSpec workflow for this rename.
- Preserve plugin behavior and APIs; this is a naming and release-cleanup change only.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The current capability's identity and specification location change, but its requirements and observable behavior do not.

This change sets `skip_specs: true` because it does not change spec-level behavior. The implementation must rename the existing baseline specification and keep its current requirements intact.

## Impact

- `.opencode/plugins/session-usage-dashboard/` and its plugin ID in `tui.tsx`.
- `README.md` and `.github/workflows/test.yml`.
- `openspec/specs/session-usage-dashboard/spec.md`.
- Existing contents of `openspec/changes/archive/`, which are to be removed before release.
