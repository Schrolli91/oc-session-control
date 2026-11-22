# Proposal

## Why

The required status checks `test` and `pr-title` do not reliably appear on every pull request, so a PR can sit unmergeable until somebody clicks things by hand. Release PRs opened by release-please with the default `GITHUB_TOKEN` produce `pull_request` runs stuck in `action_required` (PR #11 needed repeated manual approvals across seven hours, and no `pr-title` run existed for hours), and `pr.yml` runs on `pull_request_target`, which GitHub blocks by default in public repositories from 2026-12-02 — this change deliberately does not add an event policy, so that trigger has to disappear.

## What Changes

- Give release-please its own write-capable token so its PRs are authored by a trusted identity: `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}` in `release.yml`. CI runs without the approval gate; the `|| GITHUB_TOKEN` fallback keeps releases working unchanged until the secret exists.
- Consolidate both required checks onto one workflow: `test.yml` becomes `Checks` and carries `test` plus `pr-title` on `pull_request` with types `opened, edited, reopened, synchronize`, so a corrected title re-validates. Check names `test` and `pr-title` stay identical, so the branch ruleset needs no edit.
- Delete `pr.yml` and its `pull_request_target` trigger entirely; no Actions event policy is created.
- Add `label.yml` on `workflow_run` (triggered when `Checks` completes for a pull request) with `pull-requests: write`, so the type label still reaches fork PRs and release PRs without a privileged PR trigger. The label job never checks out or executes PR code and resolves the PR number through the API.
- Document the maintenance facts in `README.md`: which workflow carries which check, the `RELEASE_PLEASE_TOKEN` secret and its expiry, and the close/reopen fallback for re-checking a bot-authored PR.
- No product code, test suite, package metadata, or npm publishing behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change only touches repository automation, which the project's specifications do not cover; the change therefore declares `skip_specs: true`.

## Impact

- `.github/workflows/test.yml`: renamed to `Checks`, gains the `pr-title` job and an `edited`-inclusive `pull_request` trigger.
- `.github/workflows/pr.yml`: deleted.
- `.github/workflows/label.yml`: new, `workflow_run`-triggered labeller.
- `.github/workflows/release.yml`: one added `token:` input on the release-please step.
- Repository settings (manual, maintainer-only): new Actions secret `RELEASE_PLEASE_TOKEN`. No Actions event policy is added.
- `README.md`: new "CI and releases" subsection.
- Unchanged: the branch ruleset requiring `test` and `pr-title`, `release-please-config.json`, and the npm publish path with trusted publishing.
- Maintenance: a fine-grained PAT expires after at most one year; a GitHub App token avoids that expiry at the cost of a one-time app setup.

## Assumptions

- A manual run approval per automated PR is acceptable as a fallback, but not as the normal path: with the token configured, no approval is expected for release PRs.
- Repository settings changes are performed by the maintainer outside the repository tree; this change only documents them.
- `pull_request_target` is not used anywhere after this change, so the 2026-12-02 default block has no effect on this repository and no event policy is needed.
- The labeller only exists once `label.yml` is on the default branch, because `workflow_run` triggers are read from there; until then a PR gets `test` and `pr-title` but no automatic label.
