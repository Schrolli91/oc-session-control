# oc-session-control

OpenCode V2 TUI plugin that adds a sidebar dashboard for session costs, token usage, context, agents, skills, and subagents.

## Installation

```sh
opencode plugin add oc-session-control
```

This installs the package and adds it to your global OpenCode configuration. Restart OpenCode afterwards. Pin a version with `oc-session-control@0.1.0`.

Do not install from a Git branch: OpenCode 2.3.x cannot install Git dependencies that define a `build` script ([opencode#49704](https://github.com/anomalyco/opencode/issues/49704)). Releases are published to npm instead.

OpenCode's own `Context` panel (tokens, `% used`, `spent`) sits above this dashboard. To hide it, add `"-opencode.sidebar.context"` to `plugins` in `~/.config/opencode/cli.json`, or run `/plugins`, press `Ctrl+A`, and toggle `opencode.sidebar.context` off.

## Uninstallation

```sh
opencode plugin remove oc-session-control
```

Restart OpenCode afterwards. If you installed the plugin manually, delete the copied plugin directory and remove its `cli.json` entry.

## Features

The sidebar updates with the current session and has these sections:

- Session usage: family total in the heading, main agent and subagent cost rows when subagents exist, and estimated cache savings (`Saved (est.)`).
- Session Total: combined input, cache reads and writes, output, and reasoning tokens, with bars per group. It is a token count, not context-window usage.
- Cache: hit rate, change since the last call, and TTL status.
- Mainagent: status spinner, model, context percentage and bar, and cost. Click the model name to open model details.
- Skills: loaded and unloaded skills with token estimates. Click a skill to insert its `@skill` reference into a focused prompt; the prompt is not sent.
- Subagents (n): one row per subagent with model, context, and loaded skills. Click a row to open that session.

Click a section heading to collapse or expand it. The dashboard is mouse-only: it adds no keyboard bindings and leaves prompt keyboard behavior untouched.

Skill insertion only works when an OpenCode prompt editor is already focused; otherwise the click does nothing. OpenCode 2.3.2 has no supported prompt-insertion or targeted-picker API for this path, so the internal picker and frame-gate flow is unsupported and unverified.

The plugin reads data through OpenCode host APIs and makes no network requests of its own.

## Development

Start `opencode` inside this repository; it auto-discovers the plugin in `.opencode/plugins/`.

For another project, copy this package into `.opencode/plugins/oc-session-control/`. For a global install, copy it into `plugins/oc-session-control/` under your OpenCode config directory. Alternatively, point `cli.json` at the package path:

```json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": ["/absolute/path/to/oc-session-control"]
}
```

`cli.json` lives at `~/.config/opencode/cli.json` or `$XDG_CONFIG_HOME/opencode/cli.json`. See [plugin loading](https://opencode.ai/docs/build/plugins), [TUI plugins](https://opencode.ai/docs/build/plugins/cli), and [CLI settings](https://opencode.ai/docs/cli/config).

### Code layout

- `src/tui.tsx` registers the sidebar and connects host APIs. `src/session-tracker.ts` refreshes session data, tracks execution, and cleans up subscriptions. `.opencode/plugins/oc-session-control/tui.tsx` is the project-local auto-load shim.
- `src/dashboard.tsx` composes the sidebar and session view. `src/dashboard-components.tsx` renders rows, headers, bars, and dividers.
- `src/view-model.mjs` derives agent rows, context, skills, and subagent counts. `src/theme.mjs` holds the light/dark color map. `src/dashboard-timers.mjs` scopes cache-TTL and spinner timers.
- Other helpers and their `*.test.mjs` files live in `src/`.

### Checks

```sh
npm run build
npm test
npm run check
```

`npm run build` compiles `src/` into `dist/`. `npm run check` type-checks the source.

## License

MIT.
