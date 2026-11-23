# Design

## Context

See `proposal.md` for the motivation and `specs/oc-session-control/spec.md` for the behavior contract. The dashboard already has the displayed family session IDs, cumulative session token counters, and each session's loaded assistant messages. Today the family counters and the latest call are both reduced to family-wide values before rendering.

## Goals / Non-Goals

**Goals:**
- Preserve the current family-wide rate while deriving the same statistics independently for each displayed session.
- Keep per-agent values associated with the correct main or subagent row during refreshes and reordering.
- Reuse existing formatting, theme-neutral text colors, and TTL status thresholds.

**Non-Goals:**
- Add per-agent collapse controls or change the existing Cache section toggle.
- Change cache savings estimates, token aggregation, or OpenCode event subscriptions unless implementation reveals a specific refresh gap.

## Decisions

1. **Keep family and per-agent statistics as separate calculations.** The Cache heading continues to use the summed counters for all unique family session IDs; its ratio is therefore weighted by token counts, not an average of the displayed per-agent rates. Each agent block uses only that session's counters. This preserves the existing family overview while making attribution explicit; replacing the family rate with an average would change its meaning.

2. **Scope Last call to one session.** Find the latest and immediately previous assistant calls within that session's transcript, using the existing completed/created timestamp ordering and cache-rate formula. Do not compare a main-agent call to a subagent call. If the latest call's rate or the previous rate is unavailable, show the corresponding value as unavailable rather than deriving a change from another session.

3. **Scope TTL to each session, but share one clock.** Compute elapsed time from each session's latest usable assistant-call timestamp. Keep a single one-second dashboard timer while Cache is expanded and at least one displayed timestamp is usable; render each agent's age from that shared `now` value. This avoids starting one interval per subagent while keeping all visible TTL rows live.

4. **Render under Cache in family order.** Indent the entire per-agent breakdown one level so its rows align under the Cache heading; do not add another nested indent for Last call or TTL. Show the white `◆ Mainagent` rate row only when subagents exist, since otherwise it duplicates the family rate; keep the main session's Last call and TTL visible. Prefix each subagent's display name with a white `↳` arrow. Truncate an overlong subagent label with the existing title helper and reserve one trailing cell before the right-aligned percentage. Reuse these glyphs in Session usage cost rows and the Mainagent/Subagents dividers without changing those rows' existing colors. Keep the existing top-level Cache toggle: it hides or shows the whole per-agent breakdown. Do not add independent agent toggles. Use the normal theme foreground for Cache labels, muted theme gray for rates and detail text, and existing TTL status colors only for the dots.

## Risks / Trade-offs

- [A session's cumulative counters may be present while its transcript does not contain enough calls to compute Last call or TTL] -> Show those details as unavailable and keep the independently available family and per-agent rates visible.
- [Many subagents can make the expanded Cache section tall, and long names can compete with right-aligned rates] -> Keep the required compact rows and use the existing single-line truncation/alignment conventions; per-agent collapsing remains a separate future decision.
- [A child-session refresh may otherwise leave its row stale] -> Verify usage and execution events refresh the affected session and that derived values are read from that session's counters and messages.
