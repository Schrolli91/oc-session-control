import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "typescript"
import {
  cacheTtlTimerEligible,
  clearDashboardTimer,
  syncDashboardTimer,
} from "./dashboard-timers.mjs"

const trackerSource = await readFile(new URL("./session-tracker.ts", import.meta.url), "utf8")
const trackerModule = ts.transpileModule(trackerSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
}).outputText
  .replace('"solid-js"', JSON.stringify(import.meta.resolve("solid-js")))
  .replace('"./agents.mjs"', JSON.stringify(new URL("./agents.mjs", import.meta.url).href))
const { createSessionTracker } = await import(`data:text/javascript;base64,${Buffer.from(trackerModule).toString("base64")}`)

function makeContext() {
  const handlers = new Map()
  const calls = new Map()
  const count = (name) => calls.set(name, (calls.get(name) ?? 0) + 1)
  const collection = (name, extra = {}) => ({
    invalidate: () => count(`${name}.invalidate`),
    sync: () => { count(`${name}.sync`); return Promise.resolve() },
    list: () => [],
    ...extra,
  })
  const context = {
    location: { directory: "/project", workspaceID: "workspace" },
    data: {
      on(name, handler) {
        handlers.set(name, handler)
        return () => handlers.delete(name)
      },
      session: {
        family: () => [],
        get: () => undefined,
        cost: () => undefined,
        status: () => undefined,
        invalidate: () => count("session.invalidate"),
        sync: () => { count("session.sync"); return Promise.resolve() },
        message: collection("message", {
          more: () => false,
          loading: () => false,
          loadMore: () => Promise.resolve(),
        }),
        permission: collection("permission"),
        form: collection("form"),
      },
      location: {
        default: () => context.location,
        agent: collection("agent"),
        skill: collection("skill"),
        model: collection("model"),
        provider: collection("provider"),
      },
    },
  }
  return { context, handlers, calls, count }
}

test("deduplicates in-flight refreshes for one session", async () => {
  const { context, calls } = makeContext()
  let release
  context.data.session.sync = () => {
    calls.set("session.sync", (calls.get("session.sync") ?? 0) + 1)
    return new Promise((resolve) => { release = resolve })
  }
  const tracker = createSessionTracker(context, context.location)
  const first = tracker.refreshSession("session-1")
  const second = tracker.refreshSession("session-1")

  assert.strictEqual(second, first)
  assert.equal(calls.get("session.invalidate"), 1)
  assert.equal(calls.get("session.sync"), 1)
  release()
  await Promise.all([first, second])
  tracker.dispose()
})

test("refreshes root details without syncing its already-refreshed session record", async () => {
  const { context, calls } = makeContext()
  context.data.session.message.list = () => [{}]
  const tracker = createSessionTracker(context, context.location)

  await tracker.refreshSession("session-1", { session: false })

  assert.equal(calls.get("session.invalidate"), undefined)
  assert.equal(calls.get("session.sync"), undefined)
  assert.equal(calls.get("message.invalidate"), 1)
  assert.equal(calls.get("message.sync"), 1)
  assert.equal(calls.get("permission.invalidate"), 1)
  assert.equal(calls.get("permission.sync"), 1)
  assert.equal(calls.get("form.invalidate"), 1)
  assert.equal(calls.get("form.sync"), 1)

  await tracker.refreshSession("session-1")
  assert.equal(calls.get("session.invalidate"), 1)
  assert.equal(calls.get("session.sync"), 1)
  tracker.dispose()
})

test("chains a full session refresh behind a detail-only refresh", async () => {
  const { context, calls } = makeContext()
  context.data.session.message.list = () => [{}]
  let releaseDetails
  let markDetailsStarted
  let formSyncs = 0
  const detailsStarted = new Promise((resolve) => { markDetailsStarted = resolve })
  context.data.session.form.sync = () => {
    formSyncs++
    if (formSyncs > 1) return Promise.resolve()
    return new Promise((resolve) => {
      releaseDetails = resolve
      markDetailsStarted()
    })
  }
  const tracker = createSessionTracker(context, context.location)

  const details = tracker.refreshSession("session-1", { session: false })
  await detailsStarted
  const full = tracker.refreshSession("session-1")
  assert.equal(calls.get("session.sync"), undefined)
  releaseDetails()
  await Promise.all([details, full])

  assert.equal(calls.get("session.invalidate"), 1)
  assert.equal(calls.get("session.sync"), 1)
  tracker.dispose()
})

test("backfills the transcript pages the newest-page sync cannot see", async () => {
  const { context } = makeContext()
  let remaining = true
  const loaded = []
  context.data.session.message.more = () => remaining
  context.data.session.message.loading = () => false
  context.data.session.message.loadMore = (id, options) => {
    loaded.push([id, options.all])
    remaining = false
    return Promise.resolve()
  }
  const tracker = createSessionTracker(context, context.location)

  await tracker.refreshSession("session-1")
  assert.deepEqual(loaded, [["session-1", true]])

  await tracker.refreshSession("session-2")
  assert.equal(loaded.length, 1)
  tracker.dispose()
})

test("keeps loaded history while usage and status events refresh a session", async () => {
  const { context, handlers, calls } = makeContext()
  context.data.session.message.list = () => [{}]
  const tracker = createSessionTracker(context, context.location)
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  handlers.get("session.usage.updated")({ data: { sessionID: "session-1" } })
  await flush()
  assert.equal(calls.get("message.invalidate"), undefined)
  assert.equal(calls.get("message.sync"), undefined)

  handlers.get("session.status")({ data: { sessionID: "session-1" } })
  await flush()
  assert.equal(calls.get("message.sync"), undefined)

  context.data.session.message.list = () => []
  handlers.get("session.usage.updated")({ data: { sessionID: "session-2" } })
  await flush()
  assert.equal(calls.get("message.sync"), 1)

  handlers.get("session.compaction.ended")({ data: { sessionID: "session-1" } })
  await flush()
  assert.equal(calls.get("message.invalidate"), 2)
  assert.equal(calls.get("message.sync"), 2)
  tracker.dispose()
})

test("execution lifecycle events refresh sessions without reloading or backfilling loaded history", async () => {
  const { context, handlers, calls } = makeContext()
  const loadedMore = []
  context.data.session.message.list = () => [{}]
  context.data.session.message.more = () => true
  context.data.session.message.loadMore = (id, options) => {
    loadedMore.push([id, options.all])
    return Promise.resolve()
  }
  const tracker = createSessionTracker(context, context.location)
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  for (const name of [
    "session.execution.started",
    "session.execution.succeeded",
    "session.execution.failed",
    "session.execution.interrupted",
  ]) {
    handlers.get(name)({ data: { sessionID: "session-1" } })
    await flush()
  }

  assert.equal(calls.get("session.sync"), 4)
  assert.equal(calls.get("message.invalidate"), undefined)
  assert.equal(calls.get("message.sync"), undefined)
  assert.deepEqual(loadedMore, [])
  tracker.dispose()
})

test("execution events load messages when the session has no loaded history", async () => {
  const { context, handlers, calls } = makeContext()
  const tracker = createSessionTracker(context, context.location)
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  handlers.get("session.execution.started")({ data: { sessionID: "session-1" } })
  await flush()

  assert.equal(calls.get("message.invalidate"), 1)
  assert.equal(calls.get("message.sync"), 1)
  tracker.dispose()
})

test("refreshes the root and affected subagent on usage and execution events", async () => {
  const { context, handlers } = makeContext()
  const syncedSessions = []
  context.data.session.family = (id) => id === "main" ? ["child"] : []
  context.data.session.sync = (id) => {
    syncedSessions.push(id)
    return Promise.resolve()
  }
  const tracker = createSessionTracker(context, context.location)
  tracker.sessionFamily("main")
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  handlers.get("session.usage.updated")({ data: { parentID: "main", sessionID: "child" } })
  await flush()
  assert.deepEqual(syncedSessions, ["main", "child"])

  syncedSessions.length = 0
  handlers.get("session.execution.succeeded")({ data: { parentID: "main", sessionID: "child" } })
  await flush()
  assert.deepEqual(syncedSessions, ["main", "child"])
  tracker.dispose()
})

test("chains a history-changing refresh behind a lighter one that is running", async () => {
  const { context, calls, count } = makeContext()
  context.data.session.message.list = () => [{}]
  context.data.session.sync = () => {
    count("session.sync")
    return new Promise((resolve) => setImmediate(resolve))
  }
  const tracker = createSessionTracker(context, context.location)

  const light = tracker.refreshSession("session-1", { messages: false })
  const history = tracker.refreshSession("session-1", { messages: true })
  assert.equal(calls.get("message.sync"), undefined)

  await Promise.all([light, history])
  assert.equal(calls.get("message.sync"), 1)
  assert.equal(calls.get("message.invalidate"), 1)
  tracker.dispose()
})

test("compaction refreshes history when it overlaps an execution refresh", async () => {
  const { context, handlers, calls } = makeContext()
  context.data.session.message.list = () => [{}]
  let releaseLightRefresh
  let resolveHistoryRefresh
  const historyRefresh = new Promise((resolve) => { resolveHistoryRefresh = resolve })
  let sessionSyncs = 0
  context.data.session.sync = () => {
    sessionSyncs++
    if (sessionSyncs === 1) return new Promise((resolve) => { releaseLightRefresh = resolve })
    if (sessionSyncs === 2) resolveHistoryRefresh()
    return Promise.resolve()
  }
  const tracker = createSessionTracker(context, context.location)
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  handlers.get("session.execution.started")({ data: { sessionID: "session-1" } })
  handlers.get("session.compaction.ended")({ data: { sessionID: "session-1" } })
  assert.equal(calls.get("message.sync"), undefined)

  releaseLightRefresh()
  await historyRefresh
  await flush()
  assert.equal(calls.get("message.invalidate"), 1)
  assert.equal(calls.get("message.sync"), 1)
  tracker.dispose()
})

test("compaction still refreshes history when the overlapping execution refresh fails", async () => {
  const { context, handlers, calls } = makeContext()
  context.data.session.message.list = () => [{}]
  let rejectLightRefresh
  let resolveHistoryRefresh
  const historyRefresh = new Promise((resolve) => { resolveHistoryRefresh = resolve })
  let sessionSyncs = 0
  context.data.session.sync = () => {
    sessionSyncs++
    if (sessionSyncs === 1) return new Promise((_, reject) => { rejectLightRefresh = reject })
    if (sessionSyncs === 2) resolveHistoryRefresh()
    return Promise.resolve()
  }
  const tracker = createSessionTracker(context, context.location)
  const flush = () => new Promise((resolve) => setImmediate(resolve))

  handlers.get("session.execution.started")({ data: { sessionID: "session-1" } })
  handlers.get("session.compaction.ended")({ data: { sessionID: "session-1" } })
  rejectLightRefresh(new Error("temporary session sync failure"))
  await historyRefresh
  await flush()

  assert.equal(calls.get("message.invalidate"), 1)
  assert.equal(calls.get("message.sync"), 1)
  tracker.dispose()
})

test("retains last-known render data until a replacement arrives", () => {
  const { context } = makeContext()
  let session = { title: "Known title" }
  let family = ["child"]
  context.data.session.get = () => session
  context.data.session.family = () => family
  const tracker = createSessionTracker(context, context.location)

  assert.equal(tracker.dashboardContext.data.session.get("session-1").title, "Known title")
  assert.deepEqual(tracker.sessionFamily("session-1"), ["child"])
  session = undefined
  family = undefined
  assert.equal(tracker.dashboardContext.data.session.get("session-1").title, "Known title")
  assert.deepEqual(tracker.sessionFamily("session-1"), ["child"])
  session = { title: "Updated title" }
  family = []
  assert.equal(tracker.dashboardContext.data.session.get("session-1").title, "Updated title")
  assert.deepEqual(tracker.sessionFamily("session-1"), [])
  tracker.dispose()
})

test("prunes execution state for sessions no longer in the active family", () => {
  const { context, handlers } = makeContext()
  let family = ["live", "stale"]
  context.data.session.family = () => family
  const tracker = createSessionTracker(context, context.location)
  handlers.get("session.execution.started")({ data: { sessionID: "live" } })
  handlers.get("session.execution.started")({ data: { sessionID: "stale" } })
  assert.deepEqual([...tracker.executingSessionIDs()].sort(), ["live", "stale"])

  family = ["live"]
  assert.deepEqual(tracker.sessionFamily("main"), ["live"])
  assert.deepEqual([...tracker.executingSessionIDs()], ["live"])
  assert.equal(tracker.executionResults().has("stale"), false)
  handlers.get("session.execution.started")({ data: { sessionID: "stale" } })
  assert.deepEqual([...tracker.executingSessionIDs()], ["live"])
  tracker.dispose()
})

test("prunes cached families for roots outside the active session family", () => {
  const { context } = makeContext()
  const families = { main: ["live", "stale"], stale: ["nested"] }
  context.data.session.family = (id) => families[id]
  const tracker = createSessionTracker(context, context.location)

  assert.deepEqual(tracker.sessionFamily("stale"), ["nested"])
  assert.deepEqual(tracker.sessionFamily("main"), ["live", "stale"])
  families.main = ["live"]
  assert.deepEqual(tracker.sessionFamily("main"), ["live"])
  families.stale = undefined
  assert.deepEqual(tracker.sessionFamily("stale"), [])
  tracker.dispose()
})

test("disposes listeners once and ignores refreshes afterward", async () => {
  const { context, handlers, calls } = makeContext()
  const tracker = createSessionTracker(context, context.location)
  assert.ok(handlers.size > 0)
  tracker.dispose()
  tracker.dispose()

  assert.equal(handlers.size, 0)
  await tracker.refreshSession("session-1")
  assert.equal(calls.get("session.sync"), undefined)
})

test("stops a pending refresh after disposal when initial syncs settle", async () => {
  const { context, calls, count } = makeContext()
  let releaseSessionSync
  context.data.session.sync = () => {
    count("session.sync")
    return new Promise((resolve) => { releaseSessionSync = resolve })
  }
  context.data.session.message.more = () => {
    count("message.more")
    return true
  }
  const tracker = createSessionTracker(context, context.location)
  const refresh = tracker.refreshSession("session-1")

  tracker.dispose()
  releaseSessionSync()
  await refresh

  assert.equal(calls.get("message.more"), undefined)
  assert.equal(calls.get("message.loadMore"), undefined)
  assert.equal(calls.get("form.invalidate"), undefined)
  assert.equal(calls.get("form.sync"), undefined)
})

test("stops a pending refresh after disposal when transcript backfill settles", async () => {
  const { context, calls, count } = makeContext()
  let releaseBackfill
  let startedBackfill
  const backfillStarted = new Promise((resolve) => { startedBackfill = resolve })
  context.data.session.message.more = () => true
  context.data.session.message.loadMore = () => {
    count("message.loadMore")
    startedBackfill()
    return new Promise((resolve) => { releaseBackfill = resolve })
  }
  const tracker = createSessionTracker(context, context.location)
  const refresh = tracker.refreshSession("session-1")

  await backfillStarted
  tracker.dispose()
  releaseBackfill()
  await refresh

  assert.equal(calls.get("form.invalidate"), undefined)
  assert.equal(calls.get("form.sync"), undefined)
})

test("cleans earlier listeners when event registration fails", () => {
  const { context, handlers } = makeContext()
  const on = context.data.on
  context.data.on = (name, handler) => {
    if (name === "session.status") throw new Error("setup failed")
    return on(name, handler)
  }

  assert.throws(() => createSessionTracker(context, context.location), /setup failed/)
  assert.equal(handlers.size, 0)
})

test("scopes dashboard timers to eligible data and cleans them on scope changes", (t) => {
  const active = new Map()
  let nextHandle = 0
  t.mock.method(globalThis, "setInterval", (callback, delay) => {
    const handle = ++nextHandle
    active.set(handle, { callback, delay })
    return handle
  })
  t.mock.method(globalThis, "clearInterval", (handle) => active.delete(handle))

  assert.equal(cacheTtlTimerEligible(true, Date.now()), false)
  assert.equal(cacheTtlTimerEligible(false, undefined), false)
  assert.equal(cacheTtlTimerEligible(false, Number.NaN), false)
  assert.equal(cacheTtlTimerEligible(false, Date.now()), true)

  let timer
  timer = syncDashboardTimer(timer, "session-1", false, () => {}, 1_000)
  assert.equal(timer, undefined)
  timer = syncDashboardTimer(timer, "session-1", true, () => {}, 1_000)
  const firstHandle = timer.handle
  assert.equal(active.get(firstHandle).delay, 1_000)

  timer = syncDashboardTimer(timer, "session-2", true, () => {}, 90)
  assert.equal(active.has(firstHandle), false)
  const secondHandle = timer.handle
  assert.equal(active.get(secondHandle).delay, 90)

  timer = syncDashboardTimer(timer, "session-2", false, () => {}, 90)
  assert.equal(timer, undefined)
  assert.equal(active.size, 0)

  timer = syncDashboardTimer(timer, "session-2", true, () => {}, 1_000)
  clearDashboardTimer(timer)
  assert.equal(active.size, 0)
})
