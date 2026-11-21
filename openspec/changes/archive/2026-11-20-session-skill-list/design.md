# Design

## Context

See `proposal.md` for the motivation and `specs/session-usage-dashboard/spec.md` for behavior. The plugin already renders in `sidebar.content` and gets colors from `getThemeColors`. The TUI provides skill data per project directory; the documented plugin API has no simple write call for directly editing the prompt editor.

## Goals / Non-Goals

**Goals:**
- Integrate the host-provided skill catalog with the existing sidebar.
- Show loaded state separately for each session (the main session and each subagent).
- Insert a native skill reference without submitting the message.

**Non-Goals:**
- Execute skills or change their availability/permissions.
- Provide skill content, previews, settings, or additional filters.

## Decisions

- **Skill catalog and visibility:** Synchronize through TUI skill data for the current session directory. The main session shows all skills visible to it from the host, following host visibility rather than maintaining separate permission logic.
- **Loaded state:** Track successful skill loads from session messages per session ID and in load order. The first successful load determines the position; reloading the same skill does not add another entry. Reconstruct existing sessions from their message history. A click alone does not load a skill or change its dot. After successful compaction, discard earlier load markers until skills are loaded again.
- **Display:** Integrate the skill section into the existing sidebar and indent the main and subagent lists by two columns, like the content rows. Clicking the heading hides only unloaded skill rows; loaded skills remain visible. The main heading shows loaded/total visible skills as gray `(n/x)` and the loaded skills’ token total on the right. Each skill row shows an estimate of `ceil(UTF-8-Bytes of skill content / 4)` on the right; missing content shows `— tok`. Shorten long names with `…` and leave a space before the token count. Show loaded skills first in their recorded order; unloaded skills follow in host catalog order. Unloaded skills use a gray `○`; loaded skills use a blue `●` and blue name. The dot, name, and spinner share `#58A6FF`. Under each subagent, show a comma-separated `Skills: ` row in load order only when skills are loaded, with no row-specific interaction.
- **Prompt insertion:** Use the host’s native skill selection/attachment rather than appending only the text `@skill`. This keeps the selection bound to the registered skill. Insert it into the composer without submitting. Since no direct composer write access is documented, verify the supported native TUI interaction against the target version before implementation; do not send a substitute message through the session API.
- **Tests:** Extend the existing Node test structure with pure tests for detecting and associating loaded skills; check visibility, dot colors, click behavior, and subagent non-interaction with UI/TUI tests.

## Risks / Trade-offs

- [Risk] Native skill selection may change between OpenCode TUI versions or lack a public insertion API → Verify the insertion path against the supported target version and do not submit the message automatically; stop implementation if no compatible method exists instead of silently falling back to plain text.
- [Risk] Large skill catalogs and additional subagent rows use sidebar space → Use compact rows and retain the existing sidebar scroll area.
- [Risk] After compaction, OpenCode may not retain all earlier load information → Conservatively reset load markers rather than incorrectly showing skills as still loaded.

## Migration Plan

No data migration or configuration change is required. Reload the plugin to activate the sidebar extension; to roll back, revert the plugin code and reload.
