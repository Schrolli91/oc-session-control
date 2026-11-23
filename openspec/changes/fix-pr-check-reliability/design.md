# Design

## Context

See proposal.md for motivation. `test.yml` owns the required `test` check and runs on PRs and pushes to `main`. `pr.yml` owns the required `pr-title` check and type labeling. The main ruleset requires check contexts `test` and `pr-title`.

GitHub will block `pull_request_target` by default in public repositories starting 2026-12-02 unless an applicable Actions event policy allows it. This repository is public. Fork labeling needs a write-capable token, so PR metadata automation uses `pull_request_target`, with no checkout and a path-scoped event-policy exception.

## Goals / Non-Goals

**Goals:**

- Run tests only when relevant source, build, package, or test-workflow paths change; still report the required `test` check when no matching paths change.
- Run title validation and labeling directly on PR open, edits, reopen, and new commits, including fork PRs.
- Keep the required check names unchanged.
- Keep release automation independent in `release.yml` and use the configured release-please token.

**Non-Goals:**

- Running repository code or checking out PR code in `pr.yml`.
- Running unit tests for documentation-only changes.
- Changing the release process, package behavior, or npm publishing.

## Decisions

1. **Keep tests and PR metadata in separate workflows.** `test.yml` runs on `pull_request` and pushes to `main`; `pr.yml` runs on `pull_request_target`. They start independently. The test job id remains `test`, and the title job id remains `pr-title`, preserving the ruleset contexts.

2. **Filter test execution at job level, not at the workflow trigger.** A workflow skipped by a top-level `paths` filter may leave the required check pending. Instead, always run a path-detection step inside `test`; run checkout/build/test/type-check/package steps only when one of these paths changes: `src/**`, `scripts/**`, `.opencode/plugins/oc-session-control/tui.tsx`, `package.json`, `package-lock.json`, `tsconfig.json`, or `.github/workflows/test.yml`. Use `dorny/paths-filter` with checkout history available for push comparisons and `pull-requests: read` for PR API queries. A no-match result leaves the `test` job successful.

3. **Run title validation and labeling directly on `pull_request_target`.** Trigger on `opened`, `edited`, `reopened`, and `synchronize`. This makes title-only edits revalidate the title and refresh labels without running tests. `pr-title` validates the event title; `label` depends on that job, maps the same title to labels, and receives `pull-requests: write`. The event supplies the PR number and title, so no API lookup fallback is needed. The workflow never checks out PR code.

4. **Allow the privileged event only for `pr.yml`.** Create an active repository Actions policy scoped to `.github/workflows/pr.yml` with only `pull_request_target` in its allowed events. This satisfies GitHub's Dec 2 default policy without allowing the event for other workflows.

5. **Keep release-please on its own token.** `release.yml` passes `RELEASE_PLEASE_TOKEN || GITHUB_TOKEN`. The configured token causes release PR events to run normally; the fallback preserves release creation but may restore the approval requirement if the secret expires or is removed.

## Risks / Trade-offs

- `[pull_request_target]` is privileged → scope the event policy to `pr.yml`, grant write access only to the label job, and never check out or execute PR code.
- `[the event policy is removed or misconfigured]` → GitHub will block PR metadata jobs after Dec 2; verify the active policy targets only `.github/workflows/pr.yml` and allows `pull_request_target`.
- `[path filter action or API check fails]` → the `test` job fails rather than silently skipping its required check.
- `[a relevant build input is omitted from the path list]` → update the filter when adding new build/test inputs; the current list includes source, build script, package metadata, TypeScript config, plugin shim, and the test workflow itself.
- `[RELEASE_PLEASE_TOKEN` expires]` → release-please falls back to `GITHUB_TOKEN` and manual workflow approval may return; renew the PAT before expiry.

## Migration Plan

1. Create the repository event policy allowing `pull_request_target` only for `.github/workflows/pr.yml`.
2. Merge the changes; `test.yml` runs code-scoped tests, while `pr.yml` directly validates and labels PRs.
3. Verify path-filtered tests for code and documentation changes, title edits, and labeling for same-repository and fork PRs.
4. Verify the next release-please PR starts its checks using the configured token.

Rollback: remove the event policy and revert the workflow changes; this restores the previous behavior but leaves fork labels dependent on the old workflow and does not change published releases.
