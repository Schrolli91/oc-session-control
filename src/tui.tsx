import { Plugin } from "@opencode/plugin/tui"
import { CliRenderEvents, InputRenderable } from "@opentui/core"
import { Dashboard } from "./dashboard.tsx"
import { getSessionLocation } from "./agents.mjs"
import { getThemeColors } from "./theme.mjs"
import { createSessionTracker } from "./session-tracker.ts"

const locationKey = (value) => JSON.stringify([value.directory, value.workspaceID])

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
    let stopNativeSelection
    const insertSkill = (skill, sessionID, skillLocation) => {
      const editor = context.renderer.currentFocusedEditor
      const traits = editor?.traits as { owner?: string; role?: string } | undefined
      if (traits?.owner !== "opencode" || traits.role !== "prompt") {
        stopNativeSelection?.()
        return
      }
      const currentRoute = context.ui.router.current()
      const warn = (message) => context.ui.toast.show({ title: "Skills", variant: "warning", message })
      if (currentRoute.type !== "session" || currentRoute.sessionID !== sessionID) {
        warn("Open the matching session before inserting a skill")
        return
      }
      const skills = context.data.location.skill.list(skillLocation)
      const index = skills?.findIndex((entry) => entry.id === skill.id) ?? -1
      if (!skills || index < 0) {
        warn("Skill is no longer available")
        return
      }
      const ids = skills.map((entry) => entry.id)
      const route = JSON.stringify(currentRoute)
      stopNativeSelection?.()
      let prompt
      let active = true
      let releaseFrame: (() => void) | undefined
      const frameGate = new Promise<void>((resolve) => { releaseFrame = resolve })
      const beforeFrame = () => frameGate
      const stop = () => {
        if (!active) return
        active = false
        clearTimeout(timer)
        context.renderer.off(CliRenderEvents.FOCUSED_EDITOR, ready)
        context.renderer.removeFrameCallback(beforeFrame)
        releaseFrame?.()
        if (stopNativeSelection === stop) stopNativeSelection = undefined
      }
      const ready = () => {
        if (!active) return
        const routeNow = context.ui.router.current()
        if (JSON.stringify(routeNow) !== route) {
          stop()
          warn("Session changed; try again")
          return
        }
        const editor = context.renderer.currentFocusedEditor
        if (!prompt) {
          const traits = editor?.traits as { owner?: string; role?: string; status?: string } | undefined
          if (traits?.owner !== "opencode" || traits.role !== "prompt") return
          if (traits.status === "SHELL") {
            stop()
            warn("Prompt busy; try again")
            return
          }
          if (!context.keymap.commands().some((command) => command.id === "prompt.skills")) {
            stop()
            warn("Native skill picker is unavailable")
            return
          }
          prompt = editor
          context.renderer.setFrameCallback(beforeFrame)
          context.keymap.dispatch("prompt.skills")
          return
        }
        if (editor === prompt) {
          stop()
          return // Native picker was cancelled.
        }
        if (!(editor instanceof InputRenderable) || editor.traits.status !== "FILTER") return
        stop()
        const routeLocation = context.data.session.get(sessionID)?.location ?? context.location ?? location
        const currentSkills = context.data.location.skill.list(skillLocation)
        if (
          prompt.isDestroyed || locationKey(routeLocation) !== locationKey(skillLocation) ||
          !currentSkills || currentSkills.length !== ids.length ||
          currentSkills.some((entry, position) => entry.id !== ids[position])
        ) {
          warn("Skills or session changed; pick the skill again")
          return
        }
        context.keymap.dispatch("dialog.select.home")
        for (let position = 0; position < index; position += 1) context.keymap.dispatch("dialog.select.next")
        context.keymap.dispatch("dialog.select.submit")
      }
      const timer = setTimeout(() => {
        stop()
        warn("Native skill picker timed out; close it and try again")
      }, 5_000)
      stopNativeSelection = stop
      context.renderer.on(CliRenderEvents.FOCUSED_EDITOR, ready)
      queueMicrotask(ready)
    }

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
            insertSkill={insertSkill}
            sessionID={sessionID}
          />
          : <text fg={getThemeColors(context.theme, context.themeMode).text.muted}>Open a session to see usage.</text>,
      })
    } catch (error) {
      stopNativeSelection?.()
      tracker.dispose()
      throw error
    }

    return () => {
      stopNativeSelection?.()
      stopSidebar()
      tracker.dispose()
    }
  },
})
