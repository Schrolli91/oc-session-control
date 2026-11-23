# Design

## Context

`AgentEntry` currently navigates from its row-level `onMouseDown`. Model-name and loaded-skill elements already stop mouse-down and mouse-up propagation so their own actions remain separate.

## Goals / Non-Goals

**Goals:** Navigate only after an uninterrupted left-button press and release on a subagent row. Keep model-detail clicks isolated.

**Non-Goals:** Change main-agent interactions, keyboard behavior, or dashboard layout.

## Decisions

- Arm row navigation on left-button down and perform it on left-button up. Cancel the armed action when the pointer moves, so text selection and drags do not count as clicks. A release outside the row cannot invoke its release handler.
- Keep nested model and skill event propagation guards. Model details continue to handle their own left-button release without arming row navigation.
- Test through the existing headless `Dashboard` render and mouse mock rather than extracting a separate event helper; this verifies actual row routing and nested interactions.

## Risks / Trade-offs

- The TUI mouse mock may expose limited drag controls. Use the smallest supported sequence of mouse down, move, and up events; retain direct coverage for the completed click if drag simulation is unavailable.
