# Tasks

## 1. Refresh compacted session usage

- [x] 1.1 Stop context lookup at a completed compaction until a newer assistant usage arrives; add main/subagent tracker refresh coverage and usage tests proving compaction-request tokens are not context, then verify with `node --test src/session-tracker.test.mjs src/usage.test.mjs`.

## 2. Verify context values and bars

- [x] 2.1 Add regression coverage that post-compaction assistant usage updates the context row and main-agent bar percentage immediately, leaves unrelated agents unchanged, and reports unavailable data until then; verify with `node --test src/view-model.test.mjs` and relevant tracker tests.

## 3. Run project checks

- [x] 3.1 Run `npm test` and `npm run check`; confirm both pass.

## Workflow follow-up

- After implementation and checks, commit, push, open a PR, enable auto-merge after push, and stop once the PR is open. Do not archive before explicit approval.
- After archive approval, archive the change and run `openspec sync`.
