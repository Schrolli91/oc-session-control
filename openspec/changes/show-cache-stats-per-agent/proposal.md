# Proposal

## Why

The current Cache section combines cache activity from the main session and all subagents, so its per-call rate and timer do not show which agent produced them. Keeping the combined rate while showing each agent's own cache statistics makes the overview attributable without losing the family-wide summary.

## What Changes

- Keep the Cache heading's family-wide hit rate.
- Under it, show a separate block for the main agent and each subagent, with that session's own hit rate, last-call rate and change, and elapsed time since its latest assistant call.
- Use the requested neutral colors: agent names white; agent hit rates gray; all Last call text gray; TTL label and elapsed time gray, with only the TTL status dot colored.
- Reuse the `◆` and `↳` agent markers in Session usage cost rows and the Mainagent/Subagents section dividers, preserving the existing colors of those rows and dividers.
- Preserve the existing Cache section interaction; per-agent collapse behavior is out of scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: Show family-wide cache hit rate together with per-agent hit rate, last-call, and TTL details.

## Impact

- `src/dashboard.tsx`: Cache section layout and display.
- `src/dashboard-components.tsx`: Agent markers in section dividers.
- `src/costs.mjs`: Agent markers in cost rows.
- `src/usage.mjs`: Per-session cache rate and latest-call statistics, using that session's own counters and transcript.
- `src/session-tracker.ts`: Ensure each agent's cache data refreshes from the existing usage and execution events.
- Cache, cost-row, divider, and dashboard tests.
