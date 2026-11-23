# Tasks

## 1. Repository settings

- [x] 1.1 Create `RELEASE_PLEASE_TOKEN` as a fine-grained PAT scoped to this repository with Contents and Pull requests read/write; verify it appears in `gh secret list`.

## 2. Workflows

- [x] 2.1 Keep `release.yml` passing `RELEASE_PLEASE_TOKEN || GITHUB_TOKEN` to release-please; verify release workflow validation after push.
- [ ] 2.2 Keep `test.yml` tests-only on PRs and pushes to `main`. Add job-level path detection for `src/**`, `scripts/**`, `.opencode/plugins/oc-session-control/tui.tsx`, `package.json`, `package-lock.json`, `tsconfig.json`, and `.github/workflows/test.yml`; keep the required `test` check successful when no matching paths change.
- [ ] 2.3 Make `pr.yml` run directly on `pull_request_target` for `opened`, `edited`, `reopened`, and `synchronize`. Validate the title, then label the PR from event data; grant `pull-requests: write` only to the label job and do not check out PR code.
- [x] 2.4 Create an active repository Actions policy scoped only to `.github/workflows/pr.yml` that allows `pull_request_target`; verify its saved path and event restrictions.

## 3. Documentation

- [x] 3.1 Update the README to describe the path-filtered test workflow, direct PR title/label workflow, scoped Actions event policy, configured release token, and token renewal.

## 4. Integration verification

- [ ] 4.1 Verify the current PR reports required checks and that code-path changes run tests while documentation-only changes leave the required `test` check successful without running tests.
- [ ] 4.2 After merge, verify direct title validation and labeling for same-repository and fork PRs, including a title edit.
- [ ] 4.3 On the next release-please PR, verify `test` and `pr-title` run without manual workflow approval and the PR receives its type label.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
