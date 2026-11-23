# Design

## Context

See proposal.md for motivation. `test.yml` owns the required `test` check and runs on PRs and pushes to `main`. `pr.yml` owns the required `pr-title` check and type labeling. The main ruleset requires check contexts `test` and `pr-title`.

GitHub will block `pull_request_target` by default in public repositories starting 2026-12-02 unless an applicable Actions event policy allows it. This repository is public. Fork labeling needs a write-capable token, so PR metadata automation uses `pull_request_target`, with no checkout and a path-scoped event-policy exception.

## Goals / Non-Goals

**Goals:**

- Run tests on every PR and on pushes to `main` after merges. Title-only edits do not trigger the test workflow.
- Run title validation and labeling directly on PR open, edits, reopen, and new commits, including fork PRs.
- Keep the required check names unchanged.
- Keep release automation independent in `release.yml` and use the configured release-please token.

**Non-Goals:**

- Running repository code or checking out PR code in `pr.yml`.
- Adding path filters or conditional test execution.
- Changing the release process, package behavior, or npm publishing.

## Decisions

1. **Keep tests and PR metadata in separate workflows.** `test.yml` runs on `pull_request` and pushes to `main`; `pr.yml` runs on `pull_request_target`. They start independently. The test job id remains `test`, and the title job id remains `pr-title`, preserving the ruleset contexts.

2. **Run the test suite on each test workflow event.** Keep `pull_request` without explicit activity types, so GitHub uses its defaults (`opened`, `synchronize`, `reopened`); keep the push trigger on `main` for post-merge tests. Do not add `edited`: title edits are handled by `pr.yml`, and should not spend test runner time.

3. **Run title validation and labeling directly on `pull_request_target`.** Trigger on `opened`, `edited`, `reopened`, and `synchronize`. This makes title-only edits revalidate the title and refresh labels without running tests. `pr-title` validates the event title; `label` depends on that job, maps the same title to labels, and receives `pull-requests: write`. The event supplies the PR number and title, so no API lookup fallback is needed. The workflow never checks out PR code.

4. **Allow the privileged event only for `pr.yml`.** Create an active repository Actions policy scoped to `.github/workflows/pr.yml` with only `pull_request_target` in its allowed events. This satisfies GitHub's Dec 2 default policy without allowing the event for other workflows.

5. **Require the release token and fail fast.** Check that `RELEASE_PLEASE_TOKEN` is non-empty before invoking release-please, then pass only that secret as its token. Do not fall back to `GITHUB_TOKEN`: it can create the release PR while suppressing the PR-triggered required workflows. An expired or revoked token causes the action to fail authentication.

## Risks / Trade-offs

- `[pull_request_target]` is privileged → scope the event policy to `pr.yml`, grant write access only to the label job, and never check out or execute PR code.
- `[the PR title is untrusted]` → pass it through environment variables and do not write it to workflow-command output or the step summary.
- `[the event policy is removed or misconfigured]` → GitHub will block PR metadata jobs after Dec 2; verify the active policy targets only `.github/workflows/pr.yml` and allows `pull_request_target`.
- `[tests run on documentation-only PRs]` → accepted; keeping a required check simple and reliable is preferred to conditional path filtering.
- `[RELEASE_PLEASE_TOKEN` is missing]` → the preflight step fails before release-please can create a PR without checks.
- `[RELEASE_PLEASE_TOKEN` expires or is revoked]` → the non-empty secret is still selected, so authentication fails; renew the PAT before expiry.

## Migration Plan

1. Create the repository event policy allowing `pull_request_target` only for `.github/workflows/pr.yml`.
2. Merge the changes; `test.yml` runs tests on PR creation, reopen, code updates, and pushes to `main`, while `pr.yml` directly validates and labels PRs.
3. Verify tests on a PR and post-merge push, title edits without a test rerun, and labeling for same-repository and fork PRs.
4. Verify the next release-please PR starts its checks using the configured token.

Rollback: remove the event policy and revert the workflow changes; this restores the previous behavior but leaves fork labels dependent on the old workflow and does not change published releases.
