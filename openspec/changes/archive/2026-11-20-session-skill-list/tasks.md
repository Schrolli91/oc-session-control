# Tasks

## 1. Skill catalog and load state

- [x] 1.1 Load the skill catalog from TUI data for the current project directory and identify skills visible to the host for the main session; handle an empty catalog and missing data, and cover them with tests.
- [x] 1.2 Detect successful skill loads from messages per session ID in load order, process existing message history chronologically, and reset state after compaction; add tests for ordering, repeated loads without duplicates, failed/running calls, separate subagents, and compaction.

## 2. Skill lists in the sidebar

- [x] 2.1 Add the main session’s skill list, indented by two columns: show `Skills (n/x)` with a gray count and the loaded skills’ token total on the right; clicking the heading hides or shows only unloaded skills. Add a UTF-8-byte/4 estimate on the right of each skill row, shorten names with an ellipsis, and reserve a space. Show loaded skills first in load order, using shared blue `#58A6FF` for dot and text; show unloaded skills below with gray `○`. Test ordering, estimates, and colors.
- [x] 2.2 Under each subagent, render `Skills: ` and the loaded skill names as an indented, non-clickable, comma-separated text block in load order; show nothing for an empty list and preserve existing agent clicks.
- [x] 2.3 Update `README.md` with the main-session and subagent skill displays, and check it against the implementation.

## 3. Native skill insertion and integration

- [x] 3.1 Use the host’s native skill insertion path for clicks in the main session; verify that the native `@skill` reference reaches the composer, is not submitted, and subagent rows do not trigger a click action.
- [ ] 3.2 Run Node tests and check the sidebar in an OpenCode TUI with multiple skills and at least one subagent; if native composer insertion is unsupported, document the compatibility limit instead of silently falling back to text injection or automatic submission.
