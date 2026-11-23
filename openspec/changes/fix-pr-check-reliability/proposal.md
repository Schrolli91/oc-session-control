# Proposal

## Why

The required status checks `test` and `pr-title` do not reliably appear on every pull request, so a PR can sit unmergeable until somebody clicks things by hand. Release PRs opened by release-please with the default `GITHUB_TOKEN` produce `pull_request` runs stuck in `action_required` (PR #11 needed repeated manual approvals across seven hours, and no `pr-title` run existed for hours). Tests also run for title-only edits, while fork labels require a privileged event. This change separates the workflows, filters test execution to relevant code paths, and runs PR metadata automation directly and safely.

## What Changes

- Require the configured write-capable `RELEASE_PLEASE_TOKEN` for release-please and fail visibly if it is missing. Do not fall back to `GITHUB_TOKEN`, which can create release PRs without triggering their required CI.
- Keep `test.yml` focused on tests. It always runs its build, type-check, tests, and package checks when a PR opens, reopens, or receives commits, and on pushes to `main` after merges. Title-only edits do not rerun tests.
- Keep PR-only jobs in `pr.yml` and trigger them directly with `pull_request_target` on `opened, edited, reopened, synchronize`. Validate the title, then apply its type label using the PR number and title from the event. Do not check out or execute PR code; grant write permission only to the label job.
- Add a repository Actions event policy scoped to `.github/workflows/pr.yml` that allows `pull_request_target`. Check names `test` and `pr-title` stay identical, so the branch ruleset needs no edit.
- Document workflow coverage, the required `RELEASE_PLEASE_TOKEN`, its expiry, and the visible failure behavior when the secret is missing or invalid.
- No product code, test suite, package metadata, or npm publishing behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change only touches repository automation, which the project's specifications do not cover; the change therefore declares `skip_specs: true`.

## Impact

- `.github/workflows/test.yml`: tests only, on PRs and pushes to `main`.
- `.github/workflows/pr.yml`: direct `pull_request_target` title validation and labeling, with no checkout.
- Repository Actions policy: allow `pull_request_target` only for `.github/workflows/pr.yml`.
- `.github/workflows/label.yml`: removed; labeling belongs to the PR-only workflow file.
- `.github/workflows/release.yml`: requires `RELEASE_PLEASE_TOKEN` and checks it is present before invoking release-please.
- Repository settings: `RELEASE_PLEASE_TOKEN` is configured and an Actions event policy allows `pull_request_target` only for `.github/workflows/pr.yml`.
- `README.md`: new "CI and releases" subsection.
- Unchanged: the branch ruleset requiring `test` and `pr-title`, `release-please-config.json`, and the npm publish path with trusted publishing.
- Maintenance: a fine-grained PAT expires after at most one year; a GitHub App token avoids that expiry at the cost of a one-time app setup.

## Assumptions

- A missing or invalid release token must fail the release workflow visibly rather than create a PR whose required checks will not run.
- The release token remains a repository secret; the scoped Actions event policy is configured separately from workflow files.
- The `pull_request_target` event policy is scoped only to `pr.yml`; the workflow never checks out or executes pull request code.
- The workflow is read from the base branch, so PR title and label jobs use trusted workflow code for same-repository and fork PRs.
