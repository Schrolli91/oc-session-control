# Tasks

## 1. Repository settings (maintainer-only, GitHub UI — no file changes)

- [x] 1.1 Create the secret `RELEASE_PLEASE_TOKEN` as a fine-grained PAT scoped to this repository with Contents: read/write and Pull requests: read/write (a GitHub App installation token works too), record its expiry date, and verify `gh secret list` shows `RELEASE_PLEASE_TOKEN`.

## 2. Workflows

- [x] 2.1 Add `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}` to the `googleapis/release-please-action@v4` step in `.github/workflows/release.yml`, and verify the file still parses by checking the Actions tab reports the `Release` workflow as valid after the push.
- [x] 2.2 Split workflow ownership: keep only `test` in `.github/workflows/test.yml`, triggered on PRs and pushes to `main`; put `pr-title` on pull request events and `label` on `workflow_run` after `Tests` in `.github/workflows/pr.yml`. Preserve the required job ids `test` and `pr-title`; remove `.github/workflows/label.yml` and all `pull_request_target` triggers. Verify the three workflow files have the intended scopes and the required check names remain unchanged.
- [x] 2.3 Fix `.github/workflows/pr.yml` PR resolution: use `workflow_run.pull_requests[0].number` when present, otherwise query the REST API using the run's head repository, branch, and SHA; never use unsupported `gh run view --json pullRequests` or select a PR by branch name alone. Keep write permission limited to the label job, do not check out PR code, and preserve the type-to-label mapping. Verify same-repository lookup locally; keep live fork verification in task 4.2. Run `openspec validate --all` and confirm no `pull_request_target` trigger or checkout in `pr.yml`.

## 3. Documentation

- [x] 3.1 Update the "CI and releases" subsection in `README.md` after "Checks" to state that `test.yml` runs tests on every PR (same-repository and fork) and on pushes to `main`, while `pr.yml` validates titles on PR events and labels after the `Tests` workflow completes once `pr.yml` is on the default branch. Document that the configured `RELEASE_PLEASE_TOKEN` must be renewed before expiry and the close/reopen fallback if bot checks fail to start. Verify claims against workflows and branch rules.

## 4. Integration verification

- [ ] 4.1 Verify the split `test` and `pr-title` workflows both report on this PR without any manual run approval; note that label activation depends on `pr.yml` being on the default branch.
- [ ] 4.2 After merge, open a follow-up PR and verify `label` appears on its own together with `test` and `pr-title`, for a same-repository branch and, when one is available, for a fork PR.
- [ ] 4.3 On the next release-please PR, verify `test` and `pr-title` report without the "Approve workflows to run" banner and the type label appears on its own; if `RELEASE_PLEASE_TOKEN` is not yet set, verify the run is approval-required instead of missing entirely and record which case was observed.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
