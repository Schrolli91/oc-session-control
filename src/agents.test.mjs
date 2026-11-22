import assert from "node:assert/strict"
import test from "node:test"
import {
  buildAgentRows,
  contextFillColor,
  familyEventSessionIDs,
  formatContextFill,
  getAgentStatus,
  getContextFill,
  getSessionLocation,
  getThemeColors,
  sortSubagentSessionIDs,
  sortSubagentsByActivity,
  truncateAgentTitle,
} from "./agents.mjs"

test("resolves form state from each session location with a setup fallback", () => {
  const setupLocation = { directory: "workspace-a", workspaceID: "a" }
  const sessionLocation = { directory: "workspace-b", workspaceID: "b" }
  assert.equal(getSessionLocation({ location: sessionLocation }, setupLocation), sessionLocation)
  assert.equal(getSessionLocation({}, setupLocation), setupLocation)
})

test("builds one cost row for the main session and each subagent", () => {
  const rows = buildAgentRows(
    ["main", "child"],
    (id) => ({ main: { title: "Main task" }, child: { agent: "researcher" } })[id],
    (id) => ({ main: 0.1, child: 0.2 })[id],
  )
  assert.deepEqual(rows, [
    { sessionID: "main", label: "Main task", isMain: true, cost: "$0.1000" },
    { sessionID: "child", label: "researcher", isMain: false, cost: "$0.2000" },
  ])
})

test("sorts subagents by status priority and preserves order within each status", () => {
  const rows = ["idle-a", "active-a", "success-a", "waiting-a", "error-a", "aborted-a", "idle-b", "active-b", "success-b", "waiting-b", "error-b", "aborted-b"].map((sessionID) => ({
    sessionID,
    status: sessionID.startsWith("waiting") ? "question"
      : sessionID.startsWith("active") ? "working"
      : sessionID.startsWith("error") ? "error"
      : sessionID.startsWith("success") ? "complete"
      : sessionID.startsWith("aborted") ? "aborted"
      : "idle",
  }))
  const sorted = sortSubagentsByActivity(rows)

  assert.deepEqual(sorted.map((row) => row.sessionID), [
    "waiting-a", "waiting-b", "active-a", "active-b",
    "error-a", "error-b", "success-a", "success-b",
    "aborted-a", "aborted-b", "idle-a", "idle-b",
  ])
  assert.deepEqual(rows.map((row) => row.sessionID), [
    "idle-a", "active-a", "success-a", "waiting-a", "error-a", "aborted-a",
    "idle-b", "active-b", "success-b", "waiting-b", "error-b", "aborted-b",
  ])
})

test("sorts rows with missing status after rows with known status", () => {
  const rows = [
    { sessionID: "missing" },
    { sessionID: "idle", status: "idle" },
    { sessionID: "working", status: "working" },
  ]

  assert.deepEqual(sortSubagentsByActivity(rows).map((row) => row.sessionID), [
    "working", "idle", "missing",
  ])
})

test("uses the session ID when session title and agent name are not strings", () => {
  const rows = buildAgentRows(
    ["bad-title", "bad-name"],
    (id) => id === "bad-title"
      ? { title: 42, agent: "researcher" }
      : { title: null, agent: { name: "researcher" } },
    () => 0,
  )

  assert.deepEqual(rows.map((row) => row.label), ["researcher", "bad-name"])
})

test("keeps stable session IDs in status-priority order across refreshed row objects", () => {
  const rows = [
    { sessionID: "idle", status: "idle" },
    { sessionID: "working", status: "working" },
    { sessionID: "waiting", status: "question" },
  ]
  const refreshedRows = rows.map((row) => ({ ...row }))

  assert.deepEqual(sortSubagentSessionIDs(rows), ["waiting", "working", "idle"])
  assert.deepEqual(sortSubagentSessionIDs(refreshedRows), ["waiting", "working", "idle"])
})

test("truncates agent titles to the available single-line width", () => {
  assert.equal(truncateAgentTitle("main", 8), "main")
  assert.equal(truncateAgentTitle("long subagent title", 7), "long s…")
  assert.equal(truncateAgentTitle("long title", 1), "…")
  assert.equal(truncateAgentTitle("title", 0), "")
})

test("matches usage updates and newly forked sessions to the active family", () => {
  assert.deepEqual(
    familyEventSessionIDs(["main", "child"], { data: { sessionID: "child" } }),
    ["child"],
  )
  assert.deepEqual(
    familyEventSessionIDs(["main"], { data: { sessionID: "new-child", parentID: "main" } }),
    ["main", "new-child"],
  )
  assert.deepEqual(
    familyEventSessionIDs(["main"], { data: { form: { sessionID: "main" } } }),
    ["main"],
  )
  assert.deepEqual(familyEventSessionIDs(["main"], { data: { sessionID: "other" } }), [])
})

test("matches compaction completion to the affected session", () => {
  assert.deepEqual(
    familyEventSessionIDs(["main", "child"], {
      type: "session.compaction.ended",
      data: { sessionID: "child" },
    }),
    ["child"],
  )
})

test("ignores session events when session-family data is missing or invalid", () => {
  const event = { data: { sessionID: "child", parentID: "main" } }

  for (const familyIDs of [undefined, null, {}, "main"]) {
    assert.deepEqual(familyEventSessionIDs(familyIDs, event), [])
  }
})

test("maps session execution and pending questions to semantic status keys", () => {
  assert.equal(getAgentStatus("running", false), "working")
  assert.equal(getAgentStatus("idle", false), "idle")
  assert.equal(getAgentStatus("running", true), "question")
  assert.equal(getAgentStatus("running", false, false, "error"), "working")
  assert.equal(getAgentStatus("idle", false, false, "success"), "complete")
  assert.equal(getAgentStatus("idle", false, false, "aborted"), "aborted")
  assert.equal(getAgentStatus("idle", false, false, "error"), "error")
  assert.equal(getAgentStatus("running", true, false, "error"), "question")
  assert.equal(getAgentStatus({ type: "busy" }, false), "working")
  assert.equal(getAgentStatus({ type: "retry" }, false), "working")
  assert.equal(getAgentStatus({ type: "idle" }, false), "idle")
  assert.equal(getAgentStatus({ type: "idle" }, false, true), "working")
  assert.equal(getAgentStatus({ type: "busy" }, true), "question")
})

test("computes context fill from prompt and cache tokens against the matching model limit", () => {
  const fill = getContextFill(
    {
      model: { providerID: "provider", id: "model-a" },
      tokens: { input: 100, cache: { read: 20, write: 5 } },
    },
    [{ providerID: "provider", modelID: "model-a", limit: { context: 500 } }],
  )
  assert.deepEqual(fill, { used: 125, limit: 500, percentage: 25 })
  assert.equal(formatContextFill(fill), "125 / 500 tok")
  assert.equal(formatContextFill({ used: 60_100, limit: 1_000_000 }), "60.1k / 1M tok")
  assert.equal(formatContextFill({ used: 1_234_000, limit: 1_000_000 }), "1.2m / 1M tok")
  assert.equal(formatContextFill({ used: 1_234_000_000, limit: 2_000_000_000 }), "1.2b / 2B tok")
})

test("reports context unavailable when usage or model limit is missing", () => {
  assert.equal(getContextFill(undefined, []), undefined)
  assert.equal(
    formatContextFill(getContextFill({ tokens: { input: 10 } }, [])),
    "unavailable",
  )
})

test("rejects negative context counters and preserves valid zero counters", () => {
  const models = [{ providerID: "provider", modelID: "model", limit: { context: 500 } }]
  const model = { providerID: "provider", id: "model" }
  for (const tokens of [
    { input: -1, cache: { read: 0, write: 0 } },
    { input: 1, cache: { read: -1, write: 0 } },
    { input: 1, cache: { read: 0, write: -1 } },
  ]) {
    assert.equal(getContextFill({ model, tokens }, models), undefined)
  }
  assert.deepEqual(getContextFill({ model, tokens: { input: 0, cache: { read: 0, write: 0 } } }, models), {
    used: 0,
    limit: 500,
    percentage: 0,
  })
})

test("uses complete plugin-owned accent maps for light and dark modes", () => {
  const expected = {
    dark: {
      cost: "#58A6FF",
      agentStatus: {
        working: "#58A6FF",
        complete: "#3FB950",
        question: "#D29922",
        aborted: "#D29922",
        error: "#F85149",
        idle: "#8B949E",
      },
      usage: {
        input: { cacheHit: "#79df86", cacheMiss: "#fa736c", cacheWrite: "#f8f188" },
        output: { reasoning: "#BC8CFF", response: "#58A6FF" },
      },
      contextFill: { green: "#79df86", yellow: "#f8f188", orange: "#ff9e59", red: "#fa736c" },
      cacheTTL: { fresh: "#79df86", aging: "#f8f188", stale: "#fa736c" },
      skills: { loaded: "#58A6FF", unloaded: "#8B949E" },
    },
    light: {
      cost: "#0969DA",
      agentStatus: {
        working: "#0969DA",
        complete: "#1A7F37",
        question: "#9A6700",
        aborted: "#9A6700",
        error: "#CF222E",
        idle: "#6E7781",
      },
      usage: {
        input: { cacheHit: "#1A7F37", cacheMiss: "#CF222E", cacheWrite: "#9A6700" },
        output: { reasoning: "#8250DF", response: "#0969DA" },
      },
      contextFill: { green: "#1A7F37", yellow: "#9A6700", orange: "#BC4C00", red: "#CF222E" },
      cacheTTL: { fresh: "#1A7F37", aging: "#9A6700", stale: "#CF222E" },
      skills: { loaded: "#0969DA", unloaded: "#6E7781" },
    },
  }

  for (const mode of ["dark", "light"]) {
    const colors = getThemeColors({}, mode)
    for (const [area, palette] of Object.entries(expected[mode])) {
      assert.deepEqual(colors[area], palette)
    }
    assert.ok([...Object.values(colors.text), colors.cost, ...Object.values(colors.agentStatus),
      ...Object.values(colors.contextFill), ...Object.values(colors.cacheTTL),
      ...Object.values(colors.skills), ...Object.values(colors.usage.input),
      ...Object.values(colors.usage.output)]
      .every((color) => /^#[0-9A-Fa-f]{6}$/.test(color)))
  }
  assert.equal(getThemeColors({}).agentStatus.working, expected.dark.agentStatus.working)
})

test("host hue and feedback changes cannot affect plugin accents", () => {
  const hostTheme = {
    text: {
      feedback: {
        info: { base: "host-info" },
        success: { base: "host-success" },
        warning: { base: "host-warning" },
        error: { base: "host-error" },
      },
    },
    hue: Object.fromEntries(["blue", "green", "yellow", "orange", "red", "purple", "interactive", "accent"]
      .map((name) => [name, { 200: "host-hue", 400: "host-hue", 500: "host-hue", 800: "host-hue" }])),
  }

  for (const mode of ["dark", "light"]) {
    const colors = getThemeColors(hostTheme, mode)
    const withoutHostAccents = getThemeColors({}, mode)
    for (const area of ["agentStatus", "usage", "contextFill", "cacheTTL", "skills", "cost"]) {
      assert.deepEqual(colors[area], withoutHostAccents[area])
    }
  }
})

test("merges valid host neutral text colors into the mode palette and uses safe fallbacks", () => {
  const rgba = { toInts: () => [1, 2, 3, 255] }
  const colors = getThemeColors({ text: { base: rgba, muted: "#123456", faint: rgba } }, "light")
  assert.deepEqual(colors.text, { base: rgba, muted: "#123456", faint: rgba })
  assert.deepEqual(colors.agentStatus, getThemeColors({}, "light").agentStatus)
  assert.deepEqual(colors.contextFill, getThemeColors({}, "light").contextFill)
  assert.equal(typeof colors.agentStatus.working, "string")

  for (const theme of [
    undefined,
    null,
    {},
    { text: null },
    { text: { base: 42, muted: null, faint: false } },
    { text: { base: "host-muted", muted: "invalid", faint: "#12" } },
  ]) {
    for (const mode of ["dark", "light"]) {
      const fallback = getThemeColors(theme, mode)
      assert.deepEqual(fallback.text, mode === "light"
        ? { base: "#24292F", muted: "#57606A", faint: "#6E7781" }
        : { base: "#FFFFFF", muted: "#8B949E", faint: "#6E7681" })
      assert.ok([...Object.values(fallback.agentStatus), ...Object.values(fallback.contextFill)]
        .every((color) => /^#[0-9A-Fa-f]{6}$/.test(color)))
    }
  }
})

test("colors context fill at the 30, 50, and 70 percent boundaries", () => {
  for (const mode of ["dark", "light"]) {
    const colorMap = getThemeColors({}, mode)
    assert.equal(contextFillColor(29, colorMap), colorMap.contextFill.green)
    assert.equal(contextFillColor(30, colorMap), colorMap.contextFill.yellow)
    assert.equal(contextFillColor(50, colorMap), colorMap.contextFill.orange)
    assert.equal(contextFillColor(70, colorMap), colorMap.contextFill.red)
  }
})
