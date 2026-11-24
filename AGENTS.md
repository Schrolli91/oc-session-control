# Project guidelines

- Edit `src/`. `.opencode/plugins/oc-session-control/tui.tsx` is local loader shim. Touch only when entry point changes.
- `dist/` generated and ignored. `npm run build` wipes and rebuilds it. Never edit.
- Dashboard render tests need built `dist/` and Node FFI. Plain `npm test` skips them; it lacks required flags.

# Repo guidelines

- Node.js 26.4.0; CI uses it.
- Full checks, repo root, this order: `npm run build` → `node --conditions=browser --experimental-ffi --test "src/**/*.test.mjs"` → `npm run check`.
- PR title is squash commit and must follow Conventional Commits: `type(scope)!: description`. Scope and `!` optional; scope lowercase. Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `deps`. `!` marks breaking change. See `.github/workflows/pr.yml`.
