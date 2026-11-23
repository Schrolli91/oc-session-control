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

### CI and releases

Three workflows under `.github/workflows/`:

- `Tests` (`test.yml`) runs the build, tests, type check and package check as the `test` job on every pull request (same-repository, fork, and release-please) and on pushes to `main` after merges.
- `PR` (`pr.yml`) validates conventional-commit titles as `pr-title` on pull request events (`opened`, `edited`, `reopened`, `synchronize`), so fixing a title re-validates it. After each `Tests` run for a PR completes, it applies the type label (`feat` → `feature`, `fix` → `bug`, `deps` → `dependencies`, …, plus `breaking-change`). The label job runs from `main` with a write-capable token, never checks out PR code, and resolves the PR using the run's PR association or an API lookup matched by head repository and commit. Because `workflow_run` definitions are read from the default branch, labeling starts only after `pr.yml` lands on `main`.
- `Release` (`release.yml`) runs release-please on pushes to `main` and publishes to npm when release-please cuts a release.

Release PRs are opened by `github-actions[bot]`. The repository secret `RELEASE_PLEASE_TOKEN` is configured so their CI runs start like other PRs without manual approval. It is a fine-grained PAT with Contents and Pull requests read/write; renew it before it expires (PATs expire after at most one year). If it is absent or expires, the workflow falls back to `GITHUB_TOKEN`, and the approval requirement may return; if a title edit produces no run, close and reopen the PR to trigger another one. A PR title check runs from the `pull_request` workflow definition, which comes from the PR's merge ref; review changes to workflow files carefully because a PR can modify its own check definition.

## License

MIT.
