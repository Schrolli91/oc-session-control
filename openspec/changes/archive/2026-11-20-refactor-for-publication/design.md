# Design

## Context

See `proposal.md` for motivation. The plugin currently registers events, reads session data, owns lifecycle timers, and renders the entire sidebar in `tui.tsx`. `usage.mjs` combines cost aggregation, token calculations, formatting, status, context, theme, and event helpers. Pure helper coverage uses `node:test`; there is no UI harness or package manifest. The existing project-local plugin path and host APIs must remain usable.

## Goals / Non-Goals

**Goals:**

- Make data, lifecycle, and rendering boundaries easy to locate and test.
- Preserve existing dashboard behavior while fixing implementation gaps identified in review.
- Make a public source checkout understandable and verifiable without introducing package distribution.

**Non-Goals:**

- Redesigning the dashboard, adding features, adopting a UI framework, or adding runtime dependencies.
- Publishing an npm package or changing the project-local plugin entry point.
- Marking historical OpenSpec tasks complete without verification evidence.

## Decisions

1. **Keep the plugin entry point stable and split by responsibility.** Keep `tui.tsx` as the plugin bootstrap and data composition boundary. Extract coherent display sections into focused TSX modules and move pure helper groups from `usage.mjs` into a small number of domain modules. Keep `skills.mjs` and `model-details.mjs` where they are unless implementation reveals a direct dependency that makes the split clearer. Avoid generic component frameworks, barrel-only modules, and one-file-per-function decomposition.

2. **Resolve location per displayed session.** Keep `Dashboard`'s `sessionID` reactive so a reused sidebar component follows session switches. Use the displayed session's location for model and provider catalogs, and resolve each session's location for form list, invalidation, and sync. Fall back to the plugin setup location when a session has no location.

3. **Render cost rows from cost availability, not token availability.** Keep the cost header and its Mainagent/Subagents rows independent of `usage()`. Keep cache savings unavailable when the required usage or pricing data is unavailable. Cover the missing-token/known-cost case with a regression test.

4. **Fail closed on un-attributable cache savings and invalid context counters.** Compare model references available in assistant usage history with the session model before applying one base rate to lifetime counters. If completed compaction exists in the available history, or model data conflicts or is missing, show savings as unavailable. Retain the approximate label for supported estimates and document the history limitation. Reject negative context token counts rather than deriving a percentage from them.

5. **Keep tests dependency-free and add release checks around them.** Continue using `node --test`. Add focused helper tests for location selection, cost visibility, pricing attribution, and invalid counters. Add CI for the test command on the supported Node version. Record the supported OpenCode version only after validating the plugin in that version's TUI; keep interactive checks as a short documented release checklist.

6. **Translate docs without rewriting history.** Translate the README, active specification, and archived OpenSpec prose to English. Preserve requirement meaning, IDs, dates, code, and historical task state. Review unchecked archived tasks and close them only if verification is performed; otherwise retain them and identify them as deferred in the new release checklist.

7. **Use the maintainer-approved license.** Add the MIT license with the confirmed copyright holder, `Bastian Schroll - Schroll IT Solutions`. Do not infer package metadata for a source-only release.

## Risks / Trade-offs

- [Moving UI code can break Solid ownership or cleanup] → Keep signals and timers owned by the component that creates them; validate navigation, collapse behavior, spinner cleanup, and skill insertion in the TUI.
- [OpenCode APIs may vary by version] → Select and record a supported version after live verification; do not claim a broader range without testing it.
- [Compaction can remove model history needed for lifetime pricing] → Show cache savings as unavailable when attribution cannot be supported and document the remaining estimate limit.
- [Translating archived records can obscure historical intent] → Preserve dates, task status, technical identifiers, and meaning; review the translated archive separately from current behavior docs.

## Migration Plan

1. Capture the passing Node test baseline and source/spec behavior before moving code; verify interactive behavior against the selected OpenCode version during release checks.
2. Extract modules in small steps and keep the existing plugin entry point and import path stable.
3. Apply the data fixes with regression tests, then run all Node tests and the documented TUI checklist.
4. Translate README and OpenSpec prose, add CI and ignore rules, and record compatibility and release prerequisites.
5. Roll back by restoring the prior module layout and docs; no persistent data or user configuration migration is required.
