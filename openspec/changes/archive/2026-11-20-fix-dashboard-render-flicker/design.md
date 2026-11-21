# Design

## Context

See `proposal.md` for the motivation and `specs/session-usage-dashboard/spec.md` for the behavior contract. The context bar currently lays out each colored segment with flex and measures each segment independently before drawing repeated Unicode characters. In the live diagnostic, a fixed-width version stopped flickering; its fixed width is not suitable as the final responsive behavior. The separate `TokenUsageBar` already measures its parent once and calculates segment widths with `usageBarWidths`. There is no automated TUI-rendering harness, so live verification is required.

## Goals / Non-Goals

**Goals:**

- Keep proportional bars full-width and responsive without per-segment size feedback.
- Preserve existing colors, context calculations, and animated spinner behavior.
- Verify session headings independently of the context-bar fix.

**Non-Goals:**

- Changing token/context calculations, session refresh behavior, or adding dependencies without evidence that they cause the remaining flicker.
- Redesigning the sidebar or replacing OpenTUI rendering.

## Decisions

1. **Measure the context bar container once and calculate segment widths.** Use the available-width measurement and `usageBarWidths` to produce proportional character-cell widths, then render the colored text segments without flex growth or per-segment `onSizeChange`. This follows the non-flickering fixed-width diagnostic while restoring full-width responsiveness. Keeping the current independently measured flex segments is rejected because the diagnostic implicates that path; retaining a hard-coded width is rejected because it clips or leaves unused space at different sidebar widths.

2. **Keep the data and presentation behavior otherwise unchanged.** Do not alter usage aggregation, colors, or event invalidation as part of this fix: the observed percentage and token values stayed stable, the spinner pause did not resolve the bar flicker, and the missing-usage diagnostic did not appear. If heading flicker reproduces after the bar fix, investigate that separately rather than hiding or delaying live values.

3. **Remove test instrumentation and restore normal status animation.** Remove both diagnostic labels and restore the existing rotating spinner after the live checks; the test-only fixed-width bar is replaced by the responsive implementation.

4. **Combine helper and live verification.** Keep the `usageBarWidths` arithmetic covered by the existing unit tests. Validate actual TUI rendering with the spinner running, bars at full width, active session updates, and the available layout. If alternate sidebar widths cannot be produced, record that limitation. If any bar or heading still flickers, record which element and whether its value changes, isolate the remaining render/data path, make a focused correction, and repeat the live check before considering the task complete.

## Risks / Trade-offs

- [A single container measurement may still expose an OpenTUI redraw issue] → Test during active work; if flicker remains, continue with targeted layout/render diagnostics instead of closing the task.
- [A full-width bar may clip in a narrow sidebar] → Use the measured available cell width and verify narrow and wider layouts when the host permits; otherwise record the untested width range.
- [The reported heading flicker may be independent of the context bar] → Treat heading verification as a separate acceptance check and continue investigation if it reproduces.

## Migration Plan

No persisted data, API, or dependency migration is needed. Replace the diagnostic fixed-width rendering with the responsive implementation, remove temporary diagnostic UI, restore the spinner, and run automated and live checks. Roll back by restoring the previous context-bar rendering if the responsive replacement introduces a regression; do not leave the test-only fixed-width or paused-spinner state as the final behavior.
