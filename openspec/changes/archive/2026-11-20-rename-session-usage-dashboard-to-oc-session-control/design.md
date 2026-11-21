# Design

## Context

See `proposal.md` for motivation and scope. The current plugin lives under `.opencode/plugins/session-usage-dashboard/`; `tui.tsx` declares the same plugin ID. README and CI use the old path, and the active capability spec is stored under `openspec/specs/session-usage-dashboard/`. Historical archive entries also contain old path references.

## Goals / Non-Goals

**Goals:**
- Keep the new directory, plugin ID, active documentation, test command, and specification identity consistent.
- Preserve existing plugin behavior and the current specification requirements.
- Leave no legacy archive records in the release tree.

**Non-Goals:**
- Change plugin logic, user-visible behavior, or OpenCode APIs.
- Retain the intermediate OpenSpec history in the release tree.

## Decisions

- Rename the plugin directory instead of adding a second compatibility directory. OpenCode loads the project-local plugin from its directory, so the existing location and test paths must move together.
- Change the plugin's declared ID to `oc-session-control` and update all active references in the same change. A compatibility alias is unnecessary because the plugin is project-local and has no separate published API.
- Move and retitle the current specification without changing its requirements. This gives the release a clean baseline under the new capability name; `skip_specs: true` records that observable requirements do not change.
- Remove existing archived change records as a release-cleanup step, after this change has completed the normal OpenSpec workflow. Keeping them would preserve iteration history the release is intended to omit.

## Risks / Trade-offs

- [A stale path can break test or plugin discovery] → Search active project files for the old slug and run the test command from the renamed path.
- [Removing archives loses historical rationale] → Keep the active baseline specification and this change's OpenSpec artifacts through review and completion; remove archive contents only at the release-cleanup step.
- [A folder rename can be represented as delete/add by tooling] → Verify the final tree and Git diff show every plugin source and test file under the new directory.

## Migration Plan

1. Rename the plugin directory, plugin ID, active references, and specification directory/title together.
2. Run the existing Node test suite using its new path and validate OpenSpec artifacts.
3. Complete and archive this OpenSpec change through the normal workflow, then clear archived change records before release.

Rollback: restore the old directory, plugin ID, active references, and spec location from version control as one unit. No data migration is required.
