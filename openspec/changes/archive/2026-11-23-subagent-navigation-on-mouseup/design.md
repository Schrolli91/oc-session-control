# Design

## Context

Dashboard controls run actions from mouse-up handlers, but without a shared check that the left-button press began on the same control and was not dragged. This can trigger actions unintentionally during pointer movement.

## Goals / Non-Goals

**Goals:** Run dashboard actions only after an uninterrupted left-button press and release on the same control. Apply this to subagent navigation, model details, the update hint, skill insertion, and collapsible headers; keep nested actions isolated from their parent row.

**Non-Goals:** Change main-agent interactions, keyboard behavior, or dashboard layout.

## Decisions

- Use one `clickOnRelease` handler for mouse-down arming, drag cancellation, and left-button release. An action runs only if the release is on the control where the press began and no drag occurred.
- Stop propagation for nested controls so their actions do not arm or invoke the containing agent row.
- Unit-test the shared handler and retain headless Dashboard mouse tests for navigation, model details, and the update hint.

## Risks / Trade-offs

- Dashboard rendering tests require OpenTUI FFI; the shared handler unit test can run without the native renderer.
