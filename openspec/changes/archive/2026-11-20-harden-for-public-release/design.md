# Design

## Context

See `proposal.md` for motivation and `specs/oc-session-control/spec.md` for the user-visible contract. The plugin currently has a clean dependency direction among helper modules, but `tui.tsx` is 613 lines combining registration, 15 event subscriptions, refresh logic, data composition, an 85-line native-picker flow, and dashboard JSX. `agents.mjs` also contains theme helpers; `usage.mjs` combines aggregation, formatting, and bar math. One 701-line test file covers six modules, while the TSX has no CI check or tests. The baseline is 49/49 Node tests passing and `openspec validate --all` passing.

Current OpenCode V2 documentation describes plugin directories under project `.opencode/plugins/` and the global plugins directory, plus configured TUI packages with a `./tui` export. The local binary is 2.3.2, but the live dashboard has not been verified there. The current README's count and cache-savings label are inaccurate. The working tree contains pre-existing staged additions and the active change is untracked; planning and implementation must preserve that state and must not commit, push, or discard files.

## Goals / Non-Goals

**Goals:**

- Keep implementation and focused tests in a conventional `src/` tree while preserving project-local auto-load through a thin `.opencode/plugins/oc-session-control/tui.tsx` shim.
- Make dashboard data derivation, host lifecycle, interaction, and rendering easy to find and test.
- Keep neutral text colors integrated with the host theme; make status and context accents stable through explicit light/dark RGB palettes.
- Keep dashboard sections, subagents, models, and skills mouse-only; leave normal prompt keyboard behavior untouched.
- Preserve the existing single-mouse-click native skill picker and renderer frame gate. Only start the flow when an OpenCode prompt editor is already focused; otherwise silently no-op immediately. Retain route/catalog checks and timeout/cancel cleanup, and document the internal host interaction as unsupported and unverified.
- Make the current plugin directory work as a project-local install and provide a package export and copy/config installation guidance for other projects.
- Make the TSX compile against declared host types and keep tests, type checking, and documentation synchronized in CI.

**Non-Goals:**

- Publishing to npm, changing the plugin id, redesigning the dashboard, or adding runtime dependencies.
- Replacing single-click skill insertion with a two-step picker flow.
- Extracting skill insertion into a new module or removing the existing renderer frame gate in this scope.
- Claiming OpenCode compatibility or closing manual release checks without live TUI evidence.
- Committing, pushing, tagging, or cleaning up existing staged/untracked work.

## Decisions

1. **Keep a thin local loader; move source into `src/`.** Treat `src/` as the implementation and test source of truth. Keep `.opencode/plugins/oc-session-control/tui.tsx` as a small relative re-export so this repository still auto-loads during development; point the package `./tui` export directly to `src/tui.tsx`. Local project installation by copied package root or configured package path must include `src/` and its `package.json`. Move dashboard composition into `src/dashboard.tsx`; keep session lifecycle in `src/session-tracker.ts`; keep the existing skill interaction in the plugin entry rather than requiring a new `skill-insert.ts`; keep pure view-model/theme and domain helpers under `src/`. Keep `dashboard-components.tsx` presentational and avoid one-file wrappers beyond the two required entrypoints. Alternatives: keep implementation under `.opencode/` (preserves the current but unconventional source layout) or duplicate code into both locations (risks drift).

2. **Preserve stable snapshots and session identity.** Key derived agent rows by `sessionID`, resolve each model once, and use a `Map` for row lookup. Avoid clearing cached UI data before replacement data is ready; coalesce redundant refresh events per session, refresh only the affected data where practical, and prune execution state when sessions leave or finish. Keep timers and event cleanup owned by the component/tracker that creates them, register disposers incrementally, and clean already-registered handlers if setup fails. Alternatives: rebuild every row on every event (known identity/flicker risk) or suppress all updates (hides real status changes).

3. **Preserve the existing single-click skill picker and frame gate as an explicitly unsupported dependency.** Keep the route and catalog identity checks, native picker dispatch, timeout, and cleanup in the current plugin entry; do not require a new `skill-insert.ts` module or remove the renderer frame gate. Start only when an OpenCode prompt editor is already the current focused editor. If no such prompt is focused at click time, silently no-op immediately without a toast, delayed insertion, or prompt change; do not ask the user to change focus manually. Picker cancellation remains a silent no-insert outcome with cleanup. Stale route/catalog and timeout failures leave input unsent and retain their existing warnings. The internal picker/frame-gate interaction is unsupported and unverified, so neither the design nor README claims compatibility or support; live TUI checks remain explicitly unverified.

4. **Keep dashboard interactions mouse-only.** Preserve mouse actions for sections, subagents, models, and skills. Remove dashboard keyboard binding layers and focus integration; leave normal prompt keyboard behavior untouched. Do not add keyboard navigation or activation. A mouse-triggered skill insertion may dispatch native picker commands programmatically, without binding or intercepting user keyboard input.

5. **Keep missing and invalid host data unavailable.** Normalize optional arrays and objects at the host boundary, validate finite non-negative counters and costs, and ensure pure helpers return unavailable values for malformed shapes. Resolve model metadata once per row. Correct the billion-token formatter, percentage truncation, cache-rate overflow and missing-timestamp ordering, all-invalid usage handling, and skill chronology when timestamps are mixed. Remove the unreachable negative-remainder branch. Add regression tests before or with each behavioral correction. Alternatives: broad try/catch around the whole renderer (hides the source and can discard all sections) or coercing malformed values to zero (misleads users).

6. **Keep distribution source-first and package-ready.** Add a root `package.json` with the public name `oc-session-control`, a `./tui` export pointing to `src/tui.tsx`, repository/license metadata, and a files allowlist that includes `src/`, the local auto-load shim, and the license. Use dev-only type-check dependencies; the running plugin continues to use OpenCode's host-provided APIs. Document project-local use, copying the package root to another project's `.opencode/plugins/`, and OpenCode's configured/global TUI installation paths. Do not publish the package or add a runtime bundle in this change. The package root itself is the configured TUI package path.

7. **Split tests by responsibility and make CI discover them all.** Keep `node:test` and plain Node tests for domain helpers and `view-model.mjs`; use a recursive/default test command rather than pinning a single test file. Add `tsc --noEmit` for TS/TSX with Solid JSX settings and the exact host package types. Pin dev dependency versions and commit a lockfile; run the test and type-check scripts on Node 26.4.0 in Linux and Windows CI. Do not add a UI framework solely for tests; retain a manual TUI checklist for mouse interactions, picker, refresh stability, narrow layout, and timer cleanup.

8. **Document verified facts, not aspirations.** Correct README labels and installation examples against code and official OpenCode V2 documentation. Record OpenCode 2.3.2 as supported only if the manual checklist is completed successfully; otherwise prominently label runtime compatibility unverified/experimental. Add a brief file map and keep code comments for non-obvious lifecycle/API constraints, not self-explanatory code.

9. **Use a plugin-owned light/dark accent palette.** Read neutral base, muted, and faint text from the active host theme when valid. Define every status and context accent as an explicit `#RRGGBB` value in complete dark and light maps; select the map from the host mode and use fixed neutral fallbacks only when host text colors are invalid. Do not query host hue tokens for plugin accents. Alternatives: infer palette roles from OpenCode's semantic feedback tokens (custom themes may map them differently) or read raw hue names (the resolved V2 theme does not expose them).

## Risks / Trade-offs

- [Host picker selection and renderer frame-gate behavior are unsupported or not publicly inspectable] → Preserve the current one-click flow, route/catalog checks, and timeout/cancel cleanup; silently no-op if no OpenCode prompt editor is focused at click time, and keep the dependency and live checks explicitly unverified without claiming support.
- [Splitting Solid components changes ownership and cleanup] → Move in small steps, keep signals/timers with their owner, and run tests plus the manual TUI checklist after each lifecycle/UI extraction.
- [A manifest can suggest npm support before publication] → State clearly that npm publication is out of scope and test the package export locally without publishing.
- [Type-checking current host types may expose API/version mismatches] → Pin a verified compatible type package, keep runtime dependencies unchanged, and do not claim support until a live TUI check passes.
- [The local shim may not resolve source imports from outside its plugin directory] → Verify the relative entrypoint and package export against OpenCode 2.3.2 before documenting the copied-package path.
- [Existing Git index differs from the working tree] → Preserve the originally staged additions and untracked implementation/change files; report their disposition without staging or discarding them. No commit/push/tag is part of this plan.

## Migration Plan

1. Record the current test/validation baseline and inspect the staged, unstaged, and untracked state without changing it.
2. Add focused regression tests for data and formatting bugs, then extract pure view-model and theme helpers.
3. Extract presentation components and the session tracker; preserve row keys, keep-last-value rendering during refresh, scoped subscriptions, and deterministic cleanup.
4. Move implementation and tests into `src/`, leave the thin project-local shim, and verify local auto-load and the package `./tui` export.
5. Apply the plugin-owned light/dark accent maps and test every status/context role while retaining valid host neutral text colors.
6. Preserve the existing single-click native-picker flow and renderer frame gate, including route/catalog checks and timeout/cancel cleanup. Require an already-focused OpenCode prompt editor for a click to start the flow; without one, silently no-op immediately. Keep this internal host dependency and live checks explicitly unverified. Keep dashboard interactions mouse-only and leave prompt keyboard behavior untouched.
7. Update package metadata, TypeScript configuration, reproducible dev dependencies, recursive test discovery, Windows/Linux CI, and installation/release documentation for the `src/` layout.
8. Run all tests, type checks, and OpenSpec validation. Complete the documented OpenCode 2.3.2 TUI checklist if the environment permits; otherwise state that compatibility remains unverified.
9. Review the final diff and Git index/worktree. Do not commit, push, tag, or discard existing files as part of implementation.
