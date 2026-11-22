# Proposal

## Why

OpenCode's theme contract says `text.faint` defaults to `text.muted`, but the plugin's neutral-text merge ignores that: when the host theme supplies a valid `muted` and no usable `faint`, the plugin jumps straight to its own hard-coded palette gray (`#6E7681` / `#6E7781`). The lowest emphasis level then no longer belongs to the host theme, so dividers and the empty context-bar track can sit on a gray the rest of the sidebar never uses.

## What Changes

- `getThemeColors` resolves neutral text in the order host `base`/`muted`/`faint` → host `muted` as the `faint` fallback → plugin palette fallback.
- The plugin palette gray stays as the last resort only when neither the host `faint` nor the host `muted` is a valid color.
- The fallback chain is pinned in the theme requirement so a later change cannot silently return to the palette-first behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `oc-session-control`: the "Use colors from the active theme" requirement gains the precedence rule for a missing `faint` (host `muted` first, plugin palette last) and a scenario covering a theme that defines `muted` but not `faint`.

## Impact

- Affected code: `src/theme.mjs` (`getThemeColors`), assertion in `src/agents.test.mjs`.
- Affects only themes that omit or invalidate `text.faint`; themes that resolve `faint` (the OpenCode default) render unchanged.
- No API, dependency, or data changes.
