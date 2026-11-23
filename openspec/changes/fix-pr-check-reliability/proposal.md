# Proposal

## Why

The required status checks `test` and `pr-title` do not reliably appear on every pull request, so a PR can sit unmergeable until somebody clicks things by hand. Release PRs opened by release-please with the default `GITHUB_TOKEN` produce `pull_request` runs stuck in `action_required` (PR #11 needed repeated manual approvals across seven hours, and no `pr-title` run existed for hours). Tests also run for title-only edits, while fork labels require a privileged event. This change separates the workflows, filters test execution to relevant code paths, and runs PR metadata automation directly and safely.

## What Changes

- Give release-please its own write-capable token so its PRs are authored by a trusted identity: `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}` in `release.yml`. CI runs without the approval gate; the `|| GITHUB_TOKEN` fallback keeps releases working unchanged until the secret exists.
- Keep `test.yml` focused on tests. It runs on pull requests and pushes to `main`, but only runs its build, type-check, tests, and package checks when relevant code or build files change. The required `test` job still reports success when the path filter finds no relevant changes.
- Keep PR-only jobs in `pr.yml` and trigger them directly with `pull_request_target` on `opened, edited, reopened, synchronize`. Validate the title, then apply its type label using the PR number and title from the event. Do not check out or execute PR code; grant write permission only to the label job.
- Add a repository Actions event policy scoped to `.github/workflows/pr.yml` that allows `pull_request_target`. Check names `test` and `pr-title` stay identical, so the branch ruleset needs no edit.
- Document the workflow coverage in `README.md`, the configured `RELEASE_PLEASE_TOKEN` and its expiry, and the close/reopen fallback if a bot-authored PR's checks do not start.
- No product code, test suite, package metadata, or npm publishing behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change only touches repository automation, which the project's specifications do not cover; the change therefore declares `skip_specs: true`.

## Impact

- `.github/workflows/test.yml`: tests only, on PRs and pushes to `main`, with job-level code-path filtering.
- `.github/workflows/pr.yml`: direct `pull_request_target` title validation and labeling, with no checkout.
- Repository Actions policy: allow `pull_request_target` only for `.github/workflows/pr.yml`.
- `.github/workflows/label.yml`: removed; labeling belongs to the PR-only workflow file.
- `.github/workflows/release.yml`: one added `token:` input on the release-please step.
- Repository settings: `RELEASE_PLEASE_TOKEN` is configured and an Actions event policy allows `pull_request_target` only for `.github/workflows/pr.yml`.
- `README.md`: new "CI and releases" subsection.
- Unchanged: the branch ruleset requiring `test` and `pr-title`, `release-please-config.json`, and the npm publish path with trusted publishing.
- Maintenance: a fine-grained PAT expires after at most one year; a GitHub App token avoids that expiry at the cost of a one-time app setup.

## Assumptions

- A manual run approval per automated PR is acceptable as a fallback, but not as the normal path: with the token configured, no approval is expected for release PRs.
- The release token remains a repository secret; the scoped Actions event policy is configured separately from workflow files.
- The `pull_request_target` event policy is scoped only to `pr.yml`; the workflow never checks out or executes pull request code.
- The workflow is read from the base branch, so PR title and label jobs use trusted workflow code for same-repository and fork PRs.
