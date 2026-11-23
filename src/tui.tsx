import { Plugin } from "@opencode/plugin/tui"
import { Dashboard } from "./dashboard.tsx"
import { getSessionLocation } from "./agents.mjs"
import { getThemeColors } from "./theme.mjs"
import { createSessionTracker } from "./session-tracker.ts"

export default Plugin.define({
  id: "oc-session-control",
  setup(context) {
    const location = context.location ?? context.data.location.default()
    const sessionLocation = (id) => getSessionLocation(context.data.session.get(id), location)
    const tracker = createSessionTracker(context, location)
    const {
      dashboardContext,
      executingSessionIDs,
      executionResults,
      sessionFamily,
      refreshSession,
    } = tracker

    let stopSidebar
    try {
      stopSidebar = context.ui.slot({
        append: "sidebar.content",
        render: ({ sessionID }) => sessionID
          ? <Dashboard
            context={dashboardContext}
            location={location}
            sessionFamily={sessionFamily}
            executingSessionIDs={executingSessionIDs}
            executionResults={executionResults}
            refreshSession={refreshSession}
            sessionID={sessionID}
          />
          : <text fg={getThemeColors(context.theme, context.themeMode).text.muted}>Open a session to see usage.</text>,
      })
    } catch (error) {
      tracker.dispose()
      throw error
    }

    return () => {
      stopSidebar()
      tracker.dispose()
    }
  },
})
