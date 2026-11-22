# Tasks

## 1. Repository settings (maintainer-only, GitHub UI — no file changes)

- [x] 1.1 Create the secret `RELEASE_PLEASE_TOKEN` as a fine-grained PAT scoped to this repository with Contents: read/write and Pull requests: read/write (a GitHub App installation token works too), record its expiry date, and verify `gh secret list` shows `RELEASE_PLEASE_TOKEN`.

## 2. Workflows

- [x] 2.1 Add `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}` to the `googleapis/release-please-action@v4` step in `.github/workflows/release.yml`, and verify the file still parses by checking the Actions tab reports the `Release` workflow as valid after the push.
- [x] 2.2 Move `pr-title` from `pr.yml` into `.github/workflows/test.yml`, rename that workflow to `Checks`, add the `pull_request` trigger with types `opened, edited, reopened, synchronize`, keep the job ids `test` and `pr-title`, and delete `.github/workflows/pr.yml`; verify `grep` finds exactly one `pr-title` job across `.github/workflows/` and no `pull_request_target` trigger remains.
- [x] 2.3 Add `.github/workflows/label.yml` triggered by `workflow_run` on the completed `Checks` workflow, restricted to `event == 'pull_request'`, with `pull-requests: write`, no checkout, PR number resolved via `gh run view --json pullRequests` with a `gh pr list --head` fallback, and the existing type-to-label mapping unchanged; verify `openspec validate --all` still passes and the YAML contains no `pull_request_target` and no `actions/checkout`.

## 3. Documentation

- [x] 3.1 Add a "CI and releases" subsection to `README.md` after "Checks" naming the three workflows, the required checks `test` and `pr-title`, the `RELEASE_PLEASE_TOKEN` secret with its expiry, the fact that the labeller activates only once `label.yml` is on the default branch, and the close/reopen fallback for re-checking a bot-authored PR; verify every claim against `.github/workflows/*.yml` and the current branch ruleset.

## 4. Integration verification

- [x] 4.1 Open a PR from this branch and verify that `test` and `pr-title` report without any manual run approval, noting that `label` cannot run yet because `label.yml` is not on the default branch.
- [ ] 4.2 After merge, open a follow-up PR and verify `label` appears on its own together with `test` and `pr-title`, for a same-repository branch and, when one is available, for a fork PR.
- [ ] 4.3 On the next release-please PR, verify `test` and `pr-title` report without the "Approve workflows to run" banner and the type label appears on its own; if `RELEASE_PLEASE_TOKEN` is not yet set, verify the run is approval-required instead of missing entirely and record which case was observed.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
