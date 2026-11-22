# Design

## Context

See proposal.md for motivation. The three PR consumers are `test` and `pr-title` (both required by the `main` ruleset) and `label`. Today they split across two triggers: `test.yml` on `pull_request` (read-only token on forks, workflow file from the PR head) and `pr.yml` on `pull_request_target` with types `opened, edited, reopened, synchronize` (base-repository context, write token, workflow file from main).

Two constraints shape everything below, both verified against current GitHub behaviour:

- A workflow that creates a PR with the default `GITHUB_TOKEN` only produces `pull_request` runs for `opened`/`synchronize`/`reopened`, and those runs are created in an approval-required state; other activity types (including `edited`) create no run at all. This is why release PRs sit behind "Approve workflows to run" on every release and why `pr-title` was absent from PR #11 for hours.
- From 2026-12-02 GitHub blocks `pull_request_target` by default in public repositories unless an Actions event policy explicitly allows it. This change does not create such a policy, so any job on that trigger stops reporting on 2026-12-02 — `pr-title` is required by the ruleset, so it cannot stay there.

Only one job needs a write token: `label`. Neither `label` nor `pr-title` executes PR code.

## Goals / Non-Goals

**Goals:**

- Every pull request — same-repository, fork, and release-please — reports `test` and `pr-title` without anyone hunting for missing runs.
- Release PRs need no manual approval once the token secret exists; until then they behave exactly as today rather than breaking.
- Nothing in the check pipeline depends on `pull_request_target`, so the 2026-12-02 default block has no effect and no repository event policy is required.
- Required check names stay `test` and `pr-title`, so the ruleset needs no edit.

**Non-Goals:**

- Creating an Actions event policy, or keeping any workflow on `pull_request_target`.
- Moving to a GitHub App token, replacing release-please, or changing the changelog/release-please configuration.
- Making the required `test` check unforgeable by a fork that rewrites `test.yml` in its own PR.
- Automating approval of workflow runs.
- Any product code, test, or package change.

## Decisions

1. **Give release-please a write-capable token instead of accepting an approval per release.** `release.yml` passes `token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}`. release-please's own documentation names this as the fix, and many repositories merged the identical change (ory/lumen #91, trtmn/tram-mcp #70, igorlg/cfn-handler #18, bmf-san/ggc #451). Rationale: it removes the whole class of bot-triggered quirks (approval gate, missing `edited` runs) at the source, and the `|| secrets.GITHUB_TOKEN` fallback makes the workflow mergeable before the secret exists. Alternatives considered: keep the manual approval (works, but recurring toil and `edited` still produces no run); a scheduled reconciler that approves or re-runs pending checks (hides the approval gate instead of fixing it, adds a third moving workflow); a GitHub App (no expiry, keeps `github-actions[bot]` authorship, but needs an app install — kept as a drop-in replacement for the same input).

2. **Drop `pull_request_target` entirely and label from a `workflow_run` follow-up.** `label.yml` triggers when `Checks` completes, runs the workflow file from main, and gets `pull-requests: write` — the same privilege `pr.yml` had, without the event GitHub blocks by default. GitHub's secure-use guidance names `workflow_run` as the better privilege-separation trigger for exactly this split (restricted `pull_request` CI, trusted post-processing), and third-party labellers document the same pattern for labelling fork PRs without `pull_request_target`. Alternatives considered: keep `pr.yml` plus an event policy allowlisting it for one workflow file (rejected: leaves an unsafe event allowlisted in a public repo and adds a settings dependency that must exist before 2026-12-02); put the label job inside `Checks` (rejected: fork PRs only get a read-only token on `pull_request`, so the label silently never lands there); a `workflow_call` composition (rejected: nothing is shared between the two jobs beyond a trigger).

3. **Carry both required checks on one `pull_request` workflow.** `test.yml` is renamed `Checks` and gains `pr-title`, keeping the job ids `test` and `pr-title` so the ruleset contexts stay valid. One workflow means one run, one approval dialog, and one completion event for the labeller. `pr-title` keeps `if: github.event_name == 'pull_request'` because push runs to main carry no title. The trigger types must include `edited`: `pull_request` defaults to `opened, synchronize, reopened`, and a corrected title must re-validate. `edited` also re-runs `test` on the same SHA, which is a few wasted runner minutes a month rather than extra conditionals to reason about. Alternatives considered: keep `pr-title` on `pull_request_target` (rejected — see decision 2); split title checking into its own `pull_request` workflow (rejected: two runs per event, two approval prompts for bot PRs).

4. **Resolve the PR through the API, not through event payload.** `workflow_run` carries `pull_requests`, but that array is documented-unreliable and often empty for fork PRs. The label job asks `gh run view --json pullRequests` first and falls back to `gh pr list --head "$HEAD_BRANCH"`; if neither yields a PR it exits 0 with a notice instead of failing. The title is read with `gh pr view --json title` and passed to the existing type-mapping script through `env:` like before. The job runs no checkout, so the attacker-controlled parts (branch name, title) stay data.

5. **Do not re-create the concurrency group.** The old `pr-N` group lived in `pr.yml` and its cancel-in-progress produced `cancelled` required checks while the replacement run started. Nothing in the new layout cancels anything; rapid pushes simply queue, which is the right trade for a repository with a handful of PRs. Alternatives: re-add `concurrency` on `Checks` (reintroduces the cancelled-check window) or `cancel-in-progress: false` (keeps stale runs alive for no benefit).

## Risks / Trade-offs

- [A `workflow_run` trigger only exists once `label.yml` is on the default branch] → until this change merges, PRs get `test` and `pr-title` but no automatic label; the first labelled PR is the post-merge verification.
- [`workflow_run` fires only when a `Checks` run actually completes] → a title edit on a bot-authored PR still produces no run at all, so neither check nor label updates; close and reopening the PR (`reopened` does create an approval-required run) is the documented fallback until the release token exists.
- [`Checks` runs the workflow file from the PR head, so a fork can rewrite `test` and `pr-title` to always pass] → out of scope; `require_extra_approval_for_unattributed_changes` on the ruleset still demands a human approval for such PRs.
- [The labeller now runs regardless of the run's conclusion, where the old job waited for `pr-title` to pass] → accepted: the label is metadata, the ruleset still gates merging, and waiting on a combined conclusion would withhold labels from every PR with a failing test. An unmapped commit type makes the `label` job red, which is visible noise on a non-required check.
- [The privileged labeller receives an attacker-influenced branch name and title] → no checkout, no `eval`, no unquoted interpolation; every value goes through `env:` and quoted expansions, and permissions stop at `pull-requests: write`.
- [The fine-grained PAT expires after at most one year] → release PRs silently fall back to `GITHUB_TOKEN` (the `||` fallback) and the approval gate returns. Mitigation: the fallback degrades to today's behaviour rather than breaking releases; document expiry, or use a GitHub App instead.
- [A release-please PR still shows the PAT owner as author] → accepted; a GitHub App token is the drop-in alternative if bot authorship matters.

## Migration Plan

1. Merge this change: `pr.yml` disappears, `Checks` carries both required checks, `label.yml` becomes active from main, `release.yml` falls back to `GITHUB_TOKEN`.
2. Create the `RELEASE_PLEASE_TOKEN` secret whenever convenient; releases work before that, with the approval click as today's fallback.
3. Verify on an ordinary PR (`test`, `pr-title`, `label` all report) and on the next release PR (checks without the approval banner once the secret exists).

Rollback: delete the secret (reverts release-please to `GITHUB_TOKEN`) or revert the merge commit (restores `pr.yml`, which then needs an event policy to survive 2026-12-02). Published releases are unaffected either way.

## Open Questions

- PAT or GitHub App for `RELEASE_PLEASE_TOKEN`: same input, only expiry and PR authorship differ. Answer when creating the secret; no artifact depends on it.
