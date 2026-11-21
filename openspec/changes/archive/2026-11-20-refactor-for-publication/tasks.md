# Tasks

## 1. Establish the baseline

- [x] 1.1 Run `node --test .opencode/plugins/session-usage-dashboard/usage.test.mjs` and record the passing baseline plus current source/spec behavior; reserve interactive baseline and post-change checks for task 6.2.
- [x] 1.2 Review the current staged, unstaged, and untracked work before editing; record OpenCode v2.3.2 and Node v23.3.0 and preserve unrelated work.

## 2. Separate code by responsibility

- [x] 2.1 Move pure helpers from `usage.mjs` into a small set of domain modules; update all imports and verify `node --test .opencode/plugins/session-usage-dashboard/usage.test.mjs` still passes.
- [x] 2.2 Extract coherent dashboard sections from `tui.tsx` while keeping the plugin entry path stable and timers/signals owned by their creating components; inspect cleanup ownership and run the test suite. Defer live navigation and collapse checks to task 6.2.
- [x] 2.3 Use the active session's location for model/provider catalogs and each session's location for form list, invalidation, and sync; keep the `sessionID` prop reactive, add focused helper coverage, and reserve live workspace/session-switch verification for task 6.2.

## 3. Correct data availability and estimates

- [x] 3.1 Render Mainagent and Subagents cost rows whenever their cost data is available, even when token usage is missing; add a regression test and verify cache savings remains unavailable without its required usage data.
- [x] 3.2 Mark estimated cache savings unavailable after completed compaction or when model data conflicts or cannot support attribution to one base rate; test single-model, compacted, conflicting-model, and missing-model cases, and document the estimate's limitation.
- [x] 3.3 Reject negative context token counters in `getContextFill`; add tests for negative, missing, and valid zero counters and verify invalid values produce no percentage or fill.

## 4. Make repository documentation English

- [x] 4.1 Rewrite `README.md` in concise English with project-local setup, compatibility status, the exact test command, data-handling notes, and a manual TUI release checklist; review it with `@humanizer` and verify every documented command and claim against the code.
- [x] 4.2 Translate the active OpenSpec spec and archived OpenSpec prose into English while preserving behavior, identifiers, dates, and task status; move long requirement edge cases into scenarios to clear validation warnings, run `openspec validate --all`, and review unchecked archived tasks, closing only those verified by evidence.
- [x] 4.3 Keep code identifiers and comments in English; add comments only for non-obvious constraints such as cache-estimate limits, then run the test suite.

## 5. Add source-repository release hygiene

- [x] 5.1 Add a minimal `.gitignore` for generated files without ignoring the project-local `.opencode/plugins/` source; verify the plugin remains tracked and generated artifacts are excluded.
- [x] 5.2 Add CI that runs the existing Node test command on Node 24; verify the workflow uses that exact command and the local suite passes without new dependencies. Do not claim a remote CI run in this no-push session.
- [x] 5.3 Add the maintainer-approved MIT license with the confirmed copyright holder; verify the standard license text and attribution.

## 6. Verify the release candidate

- [x] 6.1 Run the full Node test command and `openspec validate --all`; resolve all failures and verify the CI workflow uses the same test command.
- [ ] 6.2 In the selected OpenCode version, verify costs without token counters, mixed-model cache estimates, cross-workspace forms, session navigation, skill insertion, status updates, narrow-sidebar layout, and timer cleanup; record the tested version and any deferred archived checks in the README.
- [x] 6.3 Review the final diff and repository status; confirm only intentional source, documentation, release metadata, and OpenSpec changes remain before creating a public release snapshot. No commit or push was made.
