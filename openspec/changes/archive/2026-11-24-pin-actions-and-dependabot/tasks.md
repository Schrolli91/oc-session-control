# Tasks

## 1. Workflow pinning

- [x] 1.1 Replace every workflow action tag with its verified full SHA and exact upstream release comment; verify all `uses:` entries are SHA-pinned and existing permissions/OIDC settings are unchanged.

## 2. Dependency updates

- [x] 2.1 Add weekly Dependabot entries for GitHub Actions and the root npm ecosystem; verify both directories and schedules in `.github/dependabot.yml`.

## 3. Integration checks

- [x] 3.1 Run the repository build, tests, and TypeScript check, then validate the OpenSpec change.
