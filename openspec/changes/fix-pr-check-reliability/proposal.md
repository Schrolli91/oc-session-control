# Proposal

## Why

The required status checks `test` and `pr-title` do not reliably appear on every pull request, so a PR can sit unmergeable until somebody clicks things by hand. Release PRs opened by release-please with the default `GITHUB_TOKEN` produce `pull_request` runs stuck in `action_required` (PR #11 needed repeated manual approvals across seven hours, and no `pr-title` run existed for hours), and `pr.yml` runs on `pull_request_target`, which GitHub blocks by default in public repositories from 2026-12-02 — this change deliberately does not add an event policy, so that trigger has to disappear.

## What Changes

- Give release-please its own write-capable token so its PRs are authored by a trusted identity: `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}` in `release.yml`. CI runs without the approval gate; the `|| GITHUB_TOKEN` fallback keeps releases working unchanged until the secret exists.
- Keep `test.yml` focused on tests only: run the `test` job for pull requests (same-repository, fork, and release-please) and on pushes to `main` after merges.
- Keep PR-only jobs in `pr.yml`: validate titles on pull request events `opened, edited, reopened, synchronize`, so a corrected title re-validates; label after the `Tests` workflow completes for a pull request, using `workflow_run` and `pull-requests: write`. The label job never checks out or executes PR code; it uses the event's PR number when available and otherwise resolves the PR through the API using the head repository and SHA.
- Remove every `pull_request_target` trigger; no Actions event policy is created. Check names `test` and `pr-title` stay identical, so the branch ruleset needs no edit.
- Document the workflow coverage in `README.md`, the configured `RELEASE_PLEASE_TOKEN` and its expiry, and the close/reopen fallback if a bot-authored PR's checks do not start.
- No product code, test suite, package metadata, or npm publishing behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change only touches repository automation, which the project's specifications do not cover; the change therefore declares `skip_specs: true`.

## Impact

- `.github/workflows/test.yml`: contains only the `test` job, triggered on `pull_request` and pushes to `main`.
- `.github/workflows/pr.yml`: contains `pr-title` on `pull_request` and `label` on `workflow_run` after `Tests` completes.
- `.github/workflows/label.yml`: removed; labeling belongs to the PR-only workflow file.
- `.github/workflows/release.yml`: one added `token:` input on the release-please step.
- Repository settings: the Actions secret `RELEASE_PLEASE_TOKEN` is configured. No Actions event policy is added.
- `README.md`: new "CI and releases" subsection.
- Unchanged: the branch ruleset requiring `test` and `pr-title`, `release-please-config.json`, and the npm publish path with trusted publishing.
- Maintenance: a fine-grained PAT expires after at most one year; a GitHub App token avoids that expiry at the cost of a one-time app setup.

## Assumptions

- A manual run approval per automated PR is acceptable as a fallback, but not as the normal path: with the token configured, no approval is expected for release PRs.
- Repository settings changes are performed by the maintainer outside the repository tree; this change only documents them.
- `pull_request_target` is not used anywhere after this change, so the 2026-12-02 default block has no effect on this repository and no event policy is needed.
- The labeller only exists once `pr.yml` is on the default branch, because `workflow_run` triggers are read from there; until then a PR gets `test` and `pr-title` but no automatic label.
- `pr-title` runs from the `pull_request` workflow definition, which comes from the PR's merge ref. A PR can therefore alter its own title-check workflow; this minimal design relies on human review of workflow changes and does not claim that the required check is tamper-proof.
