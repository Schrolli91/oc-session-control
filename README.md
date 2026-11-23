# oc-session-control

OpenCode V2 TUI plugin that adds a sidebar for session costs, token usage, context, agents, skills, and subagents.

## Installation

```sh
opencode plugin add oc-session-control
```

Restart OpenCode after installation. Releases are published to npm. OpenCode 2.3.x cannot install Git dependencies that define a `build` script ([opencode#49704](https://github.com/anomalyco/opencode/issues/49704)).

## Uninstallation

```sh
opencode plugin remove oc-session-control
```

Restart OpenCode afterwards.

## Features

The sidebar shows data for the current session. A “Session Overview” divider is always shown; when a newer GitHub Release is available, a blue up-arrow icon and underlined white notice show the current and latest versions. Click it to open the GitHub Releases page and browse all changelogs in your default browser.

- Session costs, including main agent and subagent costs, plus estimated cache savings.
- Token totals for input, cache reads and writes, output, and reasoning. These are token counts, not context-window usage.
- Cache hit rate, change since the last call, and time-to-live status.
- Main agent status, model, context usage, and cost. Click the model name to open its details.
- Loaded and unloaded skills with token estimates. Click a skill to insert its `@skill` reference into a focused prompt; it is not sent.
- Subagent model, context, and loaded skills. Click a row to open that session.

Click a section heading to collapse or expand it. The dashboard is mouse-only: it adds no keyboard bindings and leaves prompt keyboard behavior untouched.

Skill insertion only works when an OpenCode prompt editor is already focused; otherwise the click does nothing. OpenCode 2.3.2 has no supported prompt-insertion or targeted-picker API for this path, so the internal picker and frame-gate flow is unsupported and unverified.

The plugin reads data through OpenCode host APIs. It also makes one asynchronous request to GitHub's public Releases API per plugin setup to check for a newer release; network failures do not delay or disable the dashboard.

## Development

When you start `opencode` from this repository, OpenCode automatically discovers and loads the local plugin from `.opencode/plugins/`.

Run the checks with:

```sh
npm run build
npm test
npm run check
```

## License

MIT.
