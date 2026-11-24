# Design

## Context

The test and release workflows use `actions/checkout@v4` and `actions/setup-node@v4`; the release workflow also uses `googleapis/release-please-action@v4`. The PR workflow uses no actions. The root `package.json` and `package-lock.json` are the only dependency manifests. Existing workflow permissions and npm Trusted Publishing are intentional constraints.

## Goals / Non-Goals

**Goals:** Make action revisions immutable while retaining their current v4 behavior, and let Dependabot propose routine action and npm updates.

**Non-Goals:** Change workflow permissions, Node.js versions, release semantics, application dependencies, or workflow triggers.

## Decisions

- Use full commit SHAs for every workflow action and same-line comments with the exact upstream release tag. Resolve each SHA from the upstream GitHub tag ref, and confirm action metadata at that commit.
- Configure weekly Dependabot updates for the `github-actions` and root `npm` ecosystems. Keep default PR limits and grouping unchanged so each update remains reviewable.
- Pin the latest v4 releases rather than adopting newer major versions; updating major versions is outside this maintenance change.

## Risks / Trade-offs

- SHA pins require explicit updates. Dependabot will open version-aware update PRs using the adjacent version comments.
- A valid SHA can still refer to vulnerable upstream code. Review and merge Dependabot PRs deliberately; pinning does not replace security review.

## Migration Plan

Land the workflow pins and Dependabot configuration together. Existing release token, write permissions, and OIDC identity remain unchanged. Roll back by reverting this commit if a pinned action fails.
