# Tasks

## 1. Theme fallback

- [x] 1.1 Chain the `faint` fallback in `getThemeColors` (`src/theme.mjs`) to host `faint` → host `muted` → `palette.text.faint`, keeping `isColor` acceptance for hex and RGBA objects; verify by adding a `getThemeColors({ text: { muted: "#123456", faint: "#12" } }, "light").text.faint === "#123456"` assertion in `src/agents.test.mjs` and running `node --test src/agents.test.mjs`.
- [x] 1.2 Extend the existing table-driven fallback test in `src/agents.test.mjs` so a theme with neither a valid `faint` nor a valid `muted` still resolves to the mode palette gray, and verify with `node --test src/agents.test.mjs`.

## 2. Integration checks

- [x] 2.1 Run `npm test` and `npm run check` and verify all 75+ tests pass and `tsc --noEmit` reports no errors.
- [x] 2.2 Run `openspec validate --all` and verify the change and the synced spec are valid.

## Workflow follow-up

- Open a pull request for this change on its own branch.
- Archive the change with `openspec archive` once the pull request is merged.
