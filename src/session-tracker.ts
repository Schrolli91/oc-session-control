import { createSignal } from "solid-js"
import { familyEventSessionIDs, getSessionLocation } from "./agents.mjs"

const locationKey = (value) => JSON.stringify([value.directory, value.workspaceID])

export function createSessionTracker(context, location) {
  const [executingSessionIDs, setExecutingSessionIDs] = createSignal(new Set())
  const [executionResults, setExecutionResults] = createSignal(new Map())
  const familySnapshots = new Map()
  const sessionSnapshots = new Map()
  const locationSnapshots = new Map()
  const refreshes = new Map()
  const disposers = []
  let disposed = false
  let activeSessionIDs

  const retain = (cache, scope, key, read) => {
    let values = cache.get(scope)
    if (!values) cache.set(scope, values = new Map())
    const value = read()
    if (value !== undefined && value !== null) values.set(key, value)
    return value ?? values.get(key)
  }
  const retainedAPI = (api, methods, cache, getScope) => new Proxy(api, {
    get(target, property) {
      const value = Reflect.get(target, property, target)
      if (typeof property !== "string" || typeof value !== "function" || !methods.has(property)) return value
      return (...args) => retain(
        cache,
        getScope(args),
        `${String(property)}:${JSON.stringify(args.slice(1))}`,
        () => Reflect.apply(value, target, args),
      )
    },
  })

  const sessionReaders = new Set(["get", "cost", "status"])
  const collectionReaders = new Set(["list"])
  const wrappedSession = new Proxy(context.data.session, {
    get(target, property) {
      if (property === "message" || property === "permission" || property === "form") {
        return retainedAPI(target[property], collectionReaders, sessionSnapshots, ([id]) => id)
      }
      const value = Reflect.get(target, property, target)
      if (typeof property !== "string" || typeof value !== "function" || !sessionReaders.has(property)) return value
      return (...args) => retain(
        sessionSnapshots,
        args[0],
        `${String(property)}:${JSON.stringify(args.slice(1))}`,
        () => Reflect.apply(value, target, args),
      )
    },
  })
  const wrappedLocation = new Proxy(context.data.location, {
    get(target, property) {
      if (typeof property === "string" && ["agent", "skill", "model", "provider"].includes(property)) {
        return retainedAPI(target[property], collectionReaders, locationSnapshots, ([targetLocation]) => locationKey(targetLocation))
      }
      return Reflect.get(target, property, target)
    },
  })
  const dashboardContext = new Proxy(context, {
    get(target, property, receiver) {
      if (property !== "data") return Reflect.get(target, property, receiver)
      return new Proxy(target.data, {
        get(data, key, dataReceiver) {
          if (key === "session") return wrappedSession
          if (key === "location") return wrappedLocation
          return Reflect.get(data, key, dataReceiver)
        },
      })
    },
  })

  const pruneExecutionState = (activeIDs) => {
    setExecutingSessionIDs((current) => {
      const next = new Set([...current].filter((id) => activeIDs.has(id)))
      return next.size === current.size ? current : next
    })
    setExecutionResults((current) => {
      const next = new Map([...current].filter(([id]) => activeIDs.has(id)))
      return next.size === current.size ? current : next
    })
    for (const id of sessionSnapshots.keys()) {
      if (!activeIDs.has(id)) sessionSnapshots.delete(id)
    }
    for (const id of familySnapshots.keys()) {
      if (!activeIDs.has(id)) familySnapshots.delete(id)
    }
  }

  const sessionFamily = (id) => {
    const family = typeof context.data.session.family === "function"
      ? context.data.session.family(id)
      : undefined
    if (!Array.isArray(family)) return familySnapshots.get(id) ?? []
    familySnapshots.set(id, family)
    activeSessionIDs = new Set([id, ...family])
    pruneExecutionState(activeSessionIDs)
    return family
  }

  const refreshSession = (id, { messages = true } = {}) => {
    if (!id || disposed) return Promise.resolve()
    if (refreshes.has(id)) return refreshes.get(id)
    const pending = (async () => {
      // The newest-page sync drops everything older, so only history-changing
      // refreshes may run it; step events already append messages in place.
      const refreshMessages = messages || (context.data.session.message.list(id) ?? []).length === 0
      context.data.session.invalidate(id)
      context.data.session.permission.invalidate(id)
      if (refreshMessages) context.data.session.message.invalidate(id)
      await Promise.all([
        context.data.session.sync(id),
        refreshMessages ? context.data.session.message.sync(id) : Promise.resolve(),
        context.data.session.permission.sync(id),
      ])
      // Walk the transcript pages the newest-page sync cannot see. `more` clears
      // itself once the cursor is exhausted, so this runs once per trimming sync.
      if (context.data.session.message.more(id) && !context.data.session.message.loading(id)) {
        await context.data.session.message.loadMore(id, { all: true })
      }
      const targetLocation = getSessionLocation(context.data.session.get(id), location)
      context.data.session.form.invalidate(id, targetLocation)
      await context.data.session.form.sync(id, targetLocation)
    })()
    const refresh = pending.finally(() => {
      if (refreshes.get(id) === refresh) refreshes.delete(id)
    })
    refreshes.set(id, refresh)
    return refresh
  }

  const refreshEvent = (event, options = {}) => {
    const rootID = event.data?.parentID ?? event.data?.sessionID ?? event.data?.form?.sessionID
    if (!rootID || disposed) return
    const affected = familyEventSessionIDs([rootID], event)
    void Promise.all(affected.map((id) => refreshSession(id, options))).catch(() => {})
  }
  const trackExecution = (event, result) => {
    if (disposed) return
    const id = event.data?.sessionID
    if (id && (!activeSessionIDs || activeSessionIDs.has(id))) {
      const active = result === "running"
      setExecutingSessionIDs((current) => {
        const next = new Set(current)
        if (active) next.add(id)
        else next.delete(id)
        return next
      })
      setExecutionResults((current) => {
        const next = new Map(current)
        if (active) next.delete(id)
        else next.set(id, result)
        return next
      })
    }
    refreshEvent(event)
  }
  const subscribe = (name, handler) => {
    const stop = context.data.on(name, handler)
    disposers.push(typeof stop === "function" ? stop : () => {})
  }
  const dispose = () => {
    if (disposed) return
    disposed = true
    for (const stop of disposers.splice(0).reverse()) {
      try { stop() } catch {}
    }
    refreshes.clear()
    familySnapshots.clear()
    sessionSnapshots.clear()
    locationSnapshots.clear()
    setExecutingSessionIDs(new Set())
    setExecutionResults(new Map())
  }

  try {
    subscribe("session.usage.updated", (event) => refreshEvent(event, { messages: false }))
    subscribe("skill.updated", (event) => {
      if (disposed) return
      const targetLocation = event.location ?? location
      context.data.location.skill.invalidate(targetLocation)
      context.data.location.agent.invalidate(targetLocation)
      void Promise.all([
        context.data.location.skill.sync(targetLocation),
        context.data.location.agent.sync(targetLocation),
      ]).catch(() => {})
    })
    subscribe("session.compaction.ended", refreshEvent)
    subscribe("session.status", (event) => refreshEvent(event, { messages: false }))
    subscribe("session.execution.started", (event) => trackExecution(event, "running"))
    subscribe("session.execution.succeeded", (event) => trackExecution(event, "success"))
    subscribe("session.execution.failed", (event) => trackExecution(event, "error"))
    subscribe("session.execution.interrupted", (event) => trackExecution(event, "aborted"))
    subscribe("session.created", refreshEvent)
    subscribe("session.forked", refreshEvent)
    subscribe("permission.asked", refreshEvent)
    subscribe("permission.replied", refreshEvent)
    subscribe("form.created", refreshEvent)
    subscribe("form.replied", refreshEvent)
    subscribe("form.cancelled", refreshEvent)
  } catch (error) {
    dispose()
    throw error
  }

  return {
    dashboardContext,
    executingSessionIDs,
    executionResults,
    sessionFamily,
    refreshSession,
    dispose,
  }
}
