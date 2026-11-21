# Tasks

## 1. Rename the plugin

- [x] 1.1 Move `.opencode/plugins/session-usage-dashboard/` to `.opencode/plugins/oc-session-control/`, update the plugin ID in `tui.tsx`, and run the Node test suite from the new path.

## 2. Update active references

- [x] 2.1 Update README title, setup path, test command, and other active product-name references; verify the documented test command points to an existing test file.
- [x] 2.2 Update `.github/workflows/test.yml` to run tests from the renamed plugin directory; verify the workflow command matches the local test command.

## 3. Establish the clean capability baseline

- [x] 3.1 Move `openspec/specs/session-usage-dashboard/spec.md` to `openspec/specs/oc-session-control/spec.md`, retitle it, and preserve its final requirements; verify `openspec list --specs` reports only the new capability name and all requirements remain present.

## 4. Verify release tree

- [x] 4.1 Run the Node test suite and OpenSpec validation, then search active project files for stale plugin paths or IDs; verify no source, documentation, or CI reference still targets the old plugin directory.
- [x] 4.2 Review the final Git diff and file tree to confirm all plugin files moved intact and no plugin behavior changed.

## Workflow follow-up

- Archive this change through the normal OpenSpec workflow after review.
- Before release, remove the contents of `openspec/changes/archive/`, including the archived rename record, and verify no archived history remains in the release tree.
