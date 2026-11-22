# Design

## Context

`getThemeColors` in `src/theme.mjs` merges host neutral text into a plugin-owned mode palette. Today each of `base`, `muted`, and `faint` is resolved independently: host value if it is a valid hex color or RGBA object, otherwise the palette value. A host that supplies `muted` but no `faint` therefore gets the plugin gray for `faint` while its own `muted` is used one level up, mixing two sources inside the same three-step emphasis ladder.

OpenCode's own theme contract states that `faint` defaults to `muted`, so the host already treats the two as one fallback chain. The plugin is the only place that breaks the chain. See proposal.md for motivation and `specs/oc-session-control/spec.md` for the requirement this implements.

## Goals / Non-Goals

**Goals:**

- Resolve `faint` through host `faint` → host `muted` → mode palette.
- Keep `base` and `muted` resolution and every accent palette untouched.
- Cover the new precedence with a table-driven test.

**Non-Goals:**

- Changing the hard-coded palette values or any status/context accent.
- Reworking how the host theme object is obtained from `context.theme`.
- Touching the `faint` call sites (section dividers, context bar track); they keep reading `text.faint`.

## Decisions

1. **Chain the fallback inside the `text` object rather than post-processing.** The `faint` expression reads `hostText.muted` when `hostText.faint` is invalid. Alternative considered: resolve `muted` first and use the resolved value — rejected because it would let a palette fallback leak into `faint` whenever the host omits both, changing the documented "palette only when neither is valid" rule.

2. **Palette gray stays the last resort for both keys.** If neither host value is valid, `faint` keeps `palette.text.faint`, not `palette.text.muted`. Alternative considered: falling back to the palette `muted` for symmetry with the host rule — rejected because the plugin's palette defines `faint` deliberately and is complete by construction; a missing host is not a missing palette entry.

3. **Keep the RGBA-object acceptance rule.** `isColor` already accepts `{ toInts }` objects as well as hex strings; the chain reuses it unchanged so host themes that hand the TUI a resolved color object keep working.

## Risks / Trade-offs

- [A host resolves `faint` on its own, so the new branch rarely runs] → The rule is still pinned by a test and the spec scenario; it protects older or partial host theme objects instead of depending on host behavior.
- [A theme that intentionally wants `faint` lighter than `muted` supplies it explicitly] → No change: an explicit valid host `faint` still wins first.
- [Behavior differs only for invalid input, which tests must construct by hand] → The existing table-driven test in `src/agents.test.mjs` already feeds invalid neutral colors; extend it with a host that has valid `muted` and invalid `faint`.

## Migration Plan

Not applicable: pure rendering change, no persisted data or API. Rollback is a one-line revert.

## Open Questions

None.
