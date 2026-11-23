# Design

## Context

See proposal.md for motivation. The three PR consumers are `test` and `pr-title` (both required by the `main` ruleset) and `label`. `test.yml` contains tests only and runs on `pull_request` (read-only token on forks, workflow file from the PR head) and pushes to `main`. `pr.yml` owns the PR-only work: `pr-title` runs on `pull_request`, and `label` runs on `workflow_run` after `Tests` completes. The former `pr.yml` ran all PR jobs on `pull_request_target` with types `opened, edited, reopened, synchronize` (base-repository context, write token, workflow file from main).

Two constraints shape everything below, both verified against current GitHub behaviour:

- A workflow that creates a PR with the default `GITHUB_TOKEN` only produces `pull_request` runs for `opened`/`synchronize`/`reopened`, and those runs are created in an approval-required state; other activity types (including `edited`) create no run at all. This is why release PRs sit behind "Approve workflows to run" on every release and why `pr-title` was absent from PR #11 for hours.
- From 2026-12-02 GitHub blocks `pull_request_target` by default in public repositories unless an Actions event policy explicitly allows it. This change does not create such a policy, so any job on that trigger stops reporting on 2026-12-02 — `pr-title` is required by the ruleset, so it cannot stay there.

Only one job needs a write token: `label`. Neither `label` nor `pr-title` executes PR code.

## Goals / Non-Goals

**Goals:**

- Every pull request — same-repository, fork, and release-please — runs tests and reports `test` and `pr-title`; pushes to `main` after merges run tests again.
- Every completed pull-request `Tests` run triggers the trusted labeller, which can label same-repository and fork PRs.
- Release PRs need no manual approval once the token secret exists; until then they behave exactly as today rather than breaking.
- Nothing in the check pipeline depends on `pull_request_target`, so the 2026-12-02 default block has no effect and no repository event policy is required.
- Required check names stay `test` and `pr-title`, so the ruleset needs no edit.

**Non-Goals:**

- Creating an Actions event policy, or keeping any workflow on `pull_request_target`.
- Moving to a GitHub App token, replacing release-please, or changing the changelog/release-please configuration.
- Making the required `test` or `pr-title` check unforgeable by a PR that rewrites `test.yml` in its own PR; human review of workflow changes remains necessary.
- Automating approval of workflow runs.
- Any product code, test, or package change.

## Decisions

1. **Give release-please a write-capable token instead of accepting an approval per release.** `release.yml` passes `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}`. release-please's own documentation names this as the fix, and many repositories merged the identical change (ory/lumen #91, trtmn/tram-mcp #70, igorlg/cfn-handler #18, bmf-san/ggc #451). Rationale: it removes the whole class of bot-triggered quirks (approval gate, missing `edited` runs) at the source, and the `|| secrets.GITHUB_TOKEN` fallback makes the workflow mergeable before the secret exists. Alternatives considered: keep the manual approval (works, but recurring toil and `edited` still produces no run); a scheduled reconciler that approves or re-runs pending checks (hides the approval gate instead of fixing it, adds a third moving workflow); a GitHub App (no expiry, keeps `github-actions[bot]` authorship, but needs an app install — kept as a drop-in replacement for the same input).

2. **Drop `pull_request_target` entirely and keep labeling in the PR-only workflow file.** The `label` job in `pr.yml` listens to `workflow_run` for completed `Tests` runs, executes the version of `pr.yml` from the default branch, and gets `pull-requests: write` — the same privilege the old `pull_request_target` job had without that trigger. `pr-title` remains on `pull_request` in the same file and needs no write permission. GitHub's secure-use guidance names `workflow_run` as a privilege-separation trigger for trusted post-processing of restricted PR CI. Alternatives considered: put labeling on the `pull_request` event (rejected: fork PRs receive a read-only token); keep `pull_request_target` with an event-policy exception (rejected: adds a settings dependency before 2026-12-02); put PR jobs in a separate `label.yml` (rejected by the requested file-scope split).

3. **Split tests from PR-only validation and labeling.** `test.yml` contains only `test`, running on `pull_request` and pushes to `main`; `pr.yml` contains `pr-title` on pull request events `opened, edited, reopened, synchronize` and `label` on `workflow_run` after the `Tests` workflow completes. The job ids `test` and `pr-title` stay unchanged, preserving the ruleset contexts. Including `edited` in the test trigger ensures title changes also produce a `Tests` completion for the labeller; this reruns tests on the same SHA but avoids a separate trigger-only workflow. Alternatives considered: combine both required checks into one workflow (rejected to keep file scope clear); keep `pr-title` on `pull_request_target` (rejected — see decision 2).

4. **Resolve the PR using supported API data and an exact fallback.** Use `workflow_run.pull_requests[0].number` when present. It may be empty for fork PRs, so fall back to the GitHub REST API, matching the run's head repository, branch, and SHA; never select the first PR matching only a branch name. `gh run view --json pullRequests` is not a supported `gh` JSON field and must not be used. If no exact open PR is found, exit successfully with a notice. Read the title with `gh pr view --json title` and pass it to the existing type-mapping script through `env:`. The job performs no checkout, so attacker-controlled branch and title values remain data.

5. **Do not re-create the concurrency group.** The old `pr-N` group lived in `pr.yml` and its cancel-in-progress produced `cancelled` required checks while the replacement run started. Nothing in the new layout cancels anything; rapid pushes simply queue, which is the right trade for a repository with a handful of PRs. Alternatives: re-add `concurrency` on `Tests` or `PR` (reintroduces the cancelled-check window) or `cancel-in-progress: false` (keeps stale runs alive for no benefit).

## Risks / Trade-offs

- A `workflow_run` trigger only exists once `pr.yml` is on the default branch → until this change merges, PRs get `test` and `pr-title` but no automatic label; the first labelled PR is the post-merge verification.
- `workflow_run` fires only when a `Tests` run actually completes → a title edit on a bot-authored PR still produces no run at all, so neither check nor label updates; close and reopening the PR (`reopened` does create an approval-required run) is the documented fallback until the release token exists.
- `test.yml` and the `pull_request` job in `pr.yml` run workflow definitions from the PR head, so a PR can rewrite `test` and `pr-title` to always pass → accepted for this minimal design; the ruleset's review requirements must be used to review workflow changes. This is not a technical guarantee that those check implementations are immutable.
- [The labeller now runs regardless of the run's conclusion, where the old job waited for `pr-title` to pass] → accepted: the label is metadata, the ruleset still gates merging, and waiting on a combined conclusion would withhold labels from every PR with a failing test. An unmapped commit type makes the `label` job red, which is visible noise on a non-required check.
- [The privileged labeller receives an attacker-influenced branch name and title] → no checkout, no `eval`, no unquoted interpolation; every value goes through `env:` and quoted expansions, and permissions stop at `pull-requests: write`.
- [The fine-grained PAT expires after at most one year] → release PRs silently fall back to `GITHUB_TOKEN` (the `||` fallback) and the approval gate returns. Mitigation: the fallback degrades to today's behaviour rather than breaking releases; document expiry, or use a GitHub App instead.
- [A release-please PR still shows the PAT owner as author] → accepted; a GitHub App token is the drop-in alternative if bot authorship matters.

## Migration Plan

1. Merge this change: `test.yml` owns tests, and `pr.yml` handles PR titles plus post-test labeling from the default branch.
2. Keep the configured `RELEASE_PLEASE_TOKEN` valid; renew it before expiry. The `GITHUB_TOKEN` fallback preserves release creation but returns to approval-required checks.
3. Verify on an ordinary PR (`test`, `pr-title`, `label` all report) and on the next release PR (checks without the approval banner once the secret exists).

Rollback: delete the secret (reverts release-please to `GITHUB_TOKEN`) or revert the merge commit (restores the previous `pull_request_target` setup, which then needs an event policy to survive 2026-12-02). Published releases are unaffected either way.

## Open Questions

- PAT or GitHub App for `RELEASE_PLEASE_TOKEN`: same input, only expiry and PR authorship differ. Answer when creating the secret; no artifact depends on it.
