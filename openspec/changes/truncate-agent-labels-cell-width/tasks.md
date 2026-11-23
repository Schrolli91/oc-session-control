# Tasks

## 1. Implement cell-aware truncation

- [x] 1.1 Declare the existing OpenTUI `string-width@7.2.0` helper as a direct runtime dependency and verify the lockfile resolves that version.
- [x] 1.2 Update `truncateAgentTitle()` to count terminal cells and truncate at grapheme boundaries; add tests for CJK, combining marks, emoji sequences, exact-fit and truncated ASCII, and invalid widths; verify `node --test src/agents.test.mjs` passes.

## 2. Integrate label widths

- [x] 2.1 Keep agent, cache, and skill label budgets in terminal cells, including adjacent-content spacing; add or extend render tests for all three label types and verify their visible text fits without splitting display sequences.

## 3. Verify integration

- [x] 3.1 Run `npm test`, `npm run check`, `npm run build`, and OpenSpec validation; record any environment-based skips or unavailable checks accurately.
