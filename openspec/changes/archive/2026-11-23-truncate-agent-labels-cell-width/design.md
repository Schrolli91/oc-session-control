# Design

## Context

See proposal.md for the motivation. OpenTUI layout widths are terminal cells. `truncateAgentTitle()` currently slices code points, and its three caller groups receive widths from OpenTUI boxes. OpenTUI `0.8.4` depends on `string-width@7.2.0`, but does not expose a public width helper.

## Goals / Non-Goals

**Goals:**
- Measure labels with the same terminal-cell semantics as OpenTUI layout.
- Preserve existing helper behavior for fitting labels and invalid or zero widths.
- Keep grapheme clusters intact when finding a truncation boundary.

**Non-Goals:**
- Change layout allocations, ellipsis style, or dashboard appearance for ordinary ASCII labels.
- Add support for terminal-specific ambiguous-width policies beyond `string-width` behavior.

## Decisions

- Use `string-width` for cell measurement. Reusing the version already present in OpenTUI avoids custom Unicode-width tables. Declare it as a direct runtime dependency because OpenTUI does not export its transitive dependency as a public API.
- Use `Intl.Segmenter` with grapheme granularity to choose truncation boundaries. Measure candidate graphemes in cells and reserve the ellipsis width before appending them. This avoids splitting combining sequences and emoji while preserving the existing `truncateAgentTitle(title, width)` API.
- Keep caller reservations in cell units. Agent and skill box widths already come from OpenTUI; the cache rate is ASCII, so measure it with `string-width` for consistent semantics when calculating the label budget.

## Risks / Trade-offs

- [Grapheme segmentation support depends on the JavaScript runtime] → The supported Node and Bun runtimes provide `Intl.Segmenter`; exercise combining and emoji cases in the unit tests.
- [A direct dependency adds package metadata] → Pin the same `string-width` version already used by OpenTUI instead of adding a second width implementation.

## Migration Plan

No persisted data or configuration changes. Rollback by reverting the helper and dependency edits; no migration is needed.
