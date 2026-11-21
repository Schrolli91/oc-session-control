# Tasks

## 1. Establish the baseline and protect existing work

- [x] 1.1 Run `node --test .opencode/plugins/oc-session-control/usage.test.mjs` and `openspec validate --all`; record the current 49-test baseline and verify both commands still pass.
- [x] 1.2 Review `git status --short`, the staged diff, unstaged diff, and untracked files; record the current state without staging, reverting, or deleting anything.

## 2. Harden and test pure data helpers

- [x] 2.1 Split `usage.test.mjs` into focused tests for costs, agents, models, skills, usage, and model details; keep every existing assertion and verify recursive `node --test` discovers all 49 baseline cases.
- [x] 2.2 Add table-driven edge tests and harden host-data boundaries: missing theme/model arrays, malformed skill permissions/messages, absent row status, non-string titles, malformed model capabilities, and missing session-family data; verify each path degrades without throwing.
- [x] 2.3 Correct numeric and ordering defects in usage helpers (billion token formatting, percentage truncation, cache-rate overflow, timestamp ordering, and all-invalid usage); remove the unreachable negative-remainder branch and verify each fix with regression tests.
- [x] 2.4 Correct mixed-timestamp skill-load ordering and malformed content fallbacks; verify compaction reset, load order, and UTF-8 token estimates with focused skill tests.
- [x] 2.5 Extract theme resolution and pure dashboard row/view-model derivation into cohesive modules; test stable session IDs, per-session model resolution, unavailable context output, subagent count, and skill-token summaries with `node --test`.
- [x] 2.6 Replace mixed host-hue lookups with explicit plugin-owned light/dark accent maps while retaining host neutral text colors; test every status/context color in both modes and safe neutral fallbacks.

## 3. Separate UI and session lifecycle without losing live state

- [x] 3.1 Move dashboard JSX and the dashboard composition out of `tui.tsx` into `dashboard.tsx` and retain `tui.tsx` as the existing plugin entry; run the full Node test command and `openspec validate --all` after the mechanical move.
- [x] 3.2 Extract event registration, refresh coordination, execution state, and disposal into `session-tracker.ts`; coalesce duplicate refreshes, keep last-known render data until replacements arrive, and prune stale session state; verify with focused helper tests and a live session refresh.
- [x] 3.3 Preserve row/component identity by session ID, resolve each row's model once, guard transiently missing rows, and keep section headings and usage/context bars visible across unrelated refreshes; verify with the relevant unit tests and manual main-session/subagent update checks.
- [x] 3.4 Keep timers scoped to visible/eligible data and ensure all event listeners and timers are cleaned up after setup failure, plugin reload, session changes, and component disposal; verify with lifecycle tests or the manual TUI checklist and confirm no stale spinner/TTL updates remain.
- [x] 3.5 Move plugin implementation and focused tests from `.opencode/plugins/oc-session-control/` into `src/`, leave only a thin `tui.tsx` re-export shim in the auto-load directory, and remove the obsolete root test aggregator; verify recursive `npm test` discovery and the shim's relative import path.

## 4. Make dashboard interactions safe and mouse-only

- [x] 4.1 Inspect the OpenCode 2.3.2 host API/source and document the lack of a supported prompt-insertion or targeted-picker API; preserve the existing renderer frame-gate dependency as unsupported and unverified.
- [x] 4.2 Preserve the existing one-click native picker and renderer frame gate; retain route/catalog identity checks and timeout/cancel/session cleanup. A click without an already-focused OpenCode prompt silently no-ops immediately, with no toast or delayed insertion. Keep stale/timeout warnings and the prompt unsent; document the internal picker/frame-gate dependency as unsupported and unverified. Current source behavior matches this revised scope; live TUI checks remain unverified.
- [x] 4.3 Remove dashboard keyboard binding layers/focus integration and keyboard navigation or activation; preserve mouse actions and programmatic native-picker dispatch for one-click skill insertion, and leave normal prompt keyboard behavior untouched.
- [x] 4.4 Consolidate repeated collapsible headers and stable row rendering into small presentational components; verify narrow-sidebar layout, subagent divider count, mouse interactions, and no regression in existing dashboard sections.

## 5. Add reproducible package and public-repository checks

- [x] 5.1 Update package metadata so `./tui` exports `src/tui.tsx` and the files allowlist includes `src/` and the auto-load shim; preserve repository/license metadata and pinned dev dependencies, then verify `npm pack --dry-run`, `npm install`, and reproducible `npm ci`.
- [x] 5.2 Update `tsconfig.json` and package scripts for the `src/` layout with Solid JSX and host types; verify `npm run check` type-checks every source TS/TSX module without runtime dependencies.
- [x] 5.3 Update CI to run the full test discovery and type check on Node 26.4.0 for Linux and Windows; verify the workflow uses the package scripts and both jobs pass locally where available.
- [x] 5.4 Add `.gitattributes` line-ending normalization and extend `.gitignore` for common generated/editor files; verify plugin source remains included and generated files are excluded.
- [x] 5.5 Update README installation and architecture guidance for `src/` plus the `.opencode` shim, hybrid palette, corrected labels, interaction status, and privacy; retain unverified compatibility unless the live checklist passes, and verify commands/claims against implementation and OpenCode V2 documentation.

## 6. Verify the release candidate without publishing it

- [x] 6.1 After source and palette changes, run `npm test`, `npm run check`, and `openspec validate --all`; confirm the package export points to the source entry and CI runs the same checks.
- [x] 6.2 Run the OpenCode 2.3.2 manual TUI checklist for install paths, costs/usage, subagent stability, mouse interactions, single-click skill insertion, session navigation, narrow layouts, and timer cleanup; record the tested version and any remaining failures in README, or retain an explicit unverified/experimental status.
- [x] 6.3 Review the final source/docs diff and Git index/worktree after the source move, including the originally staged additions and untracked implementation/change files; report required maintainer decisions and verify existing work was not discarded and no commit, push, tag, or package publication occurred.
