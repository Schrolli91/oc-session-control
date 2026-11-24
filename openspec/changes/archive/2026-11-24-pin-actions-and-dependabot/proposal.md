# Proposal

## Why

Workflows currently use movable major-version tags, so privileged release and npm-publishing jobs can receive changed action code without a reviewed repository change. Repository dependencies also lack automated, reviewable update PRs.

## What Changes

- Pin every `uses:` reference in all workflows to a verified full commit SHA and include its upstream version in a same-line comment.
- Configure Dependabot for weekly GitHub Actions and npm updates, covering workflow actions and the root npm manifest/lockfile.
- Preserve workflow permissions, release behavior, and npm OIDC publishing.

## Capabilities

### New Capabilities

None. This is repository maintenance configuration and does not change application behavior.

### Modified Capabilities

None.

## Impact

Affects `.github/workflows/*.yml`, `.github/dependabot.yml`, and OpenSpec planning artifacts. No runtime or dependency changes.