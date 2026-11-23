# Tasks

## 1. Update Check

- [x] 1.1 Add an update-check helper that reads the running package version, asynchronously fetches GitHub's latest release with a finite timeout, compares semantic versions, returns both versions for a newer release and no result otherwise; verify stable, equal, prerelease, timeout, and failure cases with unit tests.

## 2. Dashboard Integration

- [x] 2.1 Check GitHub's latest release asynchronously without blocking setup, display its version when newer, underline the update label, add a conditional following blank line, and use the declared `open` dependency to open the full releases page on click; verify failure, pending, comparison, layout, colors, and click behavior with tests. Configure CI's dashboard tests to use Node's `browser` condition.
- [x] 2.2 Document the update notice's colors, persistent divider, and asynchronous GitHub check in the README; verify it describes the version display and no longer claims the plugin makes no network requests.

## 3. Verification

- [x] 3.1 Run `npm run build`, `npm test`, and `npm run check`; resolve any failures and verify all three commands pass.
