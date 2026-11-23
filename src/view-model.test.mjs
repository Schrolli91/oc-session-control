import assert from "node:assert/strict"
import test from "node:test"
import { buildDashboardRows, buildDashboardViewModel, sessionIDsForFamily } from "./view-model.mjs"

function rowsFor(options = {}) {
  return buildDashboardRows({
    sessionIDs: ["main", "child"],
    getSession: (id) => ({ title: id, model: { providerID: "provider", id: `${id}-model` } }),
    getCost: () => 0,
    getMessages: () => [],
    getModels: () => [],
    getStatus: () => "idle",
    hasPendingQuestion: () => false,
    isExecuting: () => false,
    getExecutionResult: () => undefined,
    ...options,
  })
}

test("keeps dashboard rows keyed by unique stable session IDs", () => {
  const rows = rowsFor({ sessionIDs: ["main", "child", "child"] })
  const refreshed = rowsFor({ sessionIDs: ["main", "child", "child"] })

  assert.deepEqual(rows.map((row) => row.sessionID), ["main", "child"])
  assert.deepEqual(refreshed.map((row) => row.sessionID), rows.map((row) => row.sessionID))
  assert.deepEqual(buildDashboardViewModel(rows).subagentIDs, ["child"])
})

test("keeps the active session when family data is missing or malformed", () => {
  assert.deepEqual(sessionIDsForFamily("main"), ["main"])
  assert.deepEqual(sessionIDsForFamily("main", "invalid"), ["main"])
  assert.deepEqual(sessionIDsForFamily("main", ["child", "child", "", null, 2, {}]), ["main", "child"])
  assert.deepEqual(sessionIDsForFamily({}, ["child", 2]), ["child"])
})

test("builds rows when message history has a malformed shape", () => {
  const rows = rowsFor({ getMessages: () => ({ unexpected: true }) })
  assert.deepEqual(rows.map((row) => row.loadedSkills), [[], []])
  assert.deepEqual(rows.map((row) => row.context), ["unavailable", "unavailable"])
})

test("reports the selected model while keeping context on the model that reported it", () => {
  const rows = rowsFor({
    getSession: (id) => ({ title: id, model: { providerID: "provider", id: "selected" } }),
    getMessages: () => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: "used" },
        tokens: { input: 80, cache: { read: 10, write: 10 } },
      },
    }],
    getModels: () => [{
      providerID: "provider",
      modelID: "selected",
      name: "Selected model",
      limit: { context: 1_000 },
    }, {
      providerID: "provider",
      modelID: "used",
      name: "Used model",
      limit: { context: 200 },
    }],
  })

  assert.equal(rows[0].modelName, "Selected model")
  assert.equal(rows[0].modelInfo.name, "Selected model")
  assert.equal(rows[0].contextPercentage, 50)
  assert.equal(rows[0].context, "100 / 200 tok")
})

test("falls back to the latest assistant usage when the session has no selected model", () => {
  const rows = rowsFor({
    getSession: () => ({}),
    getMessages: () => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: "used" },
        tokens: { input: 50, cache: { read: 0, write: 0 } },
      },
    }],
    getModels: () => [{
      providerID: "provider",
      modelID: "used",
      name: "Used model",
      limit: { context: 100 },
    }],
  })

  assert.equal(rows[0].modelName, "Used model")
  assert.equal(rows[0].contextPercentage, 50)
})

test("reports an unavailable model when neither selection nor usage is available", () => {
  const rows = rowsFor({ getSession: () => ({}), getMessages: () => [] })

  assert.equal(rows[0].modelName, "unavailable")
  assert.equal(rows[0].context, "unavailable")
  assert.equal(rows[0].contextPercentage, undefined)
})

test("resolves model details against each session's model list", () => {
  const rows = rowsFor({
    getMessages: (id) => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: `${id}-message-model` },
        tokens: { input: 10, cache: { read: 0, write: 0 } },
      },
    }],
    getModels: (id) => [{
      providerID: "provider",
      modelID: `${id}-model`,
      name: `${id} selected model`,
      limit: { context: 500 },
    }, {
      providerID: "provider",
      modelID: `${id}-message-model`,
      name: `${id} resolved model`,
      limit: { context: 100 },
    }],
  })

  assert.deepEqual(rows.map((row) => row.modelName), ["main selected model", "child selected model"])
  assert.deepEqual(rows.map((row) => row.modelInfo.limit.context), [500, 500])
  assert.deepEqual(rows.map((row) => row.context), ["10 / 100 tok", "10 / 100 tok"])
})

test("reads each session model catalog once and reuses resolved model details", () => {
  const calls = new Map()
  const rows = rowsFor({
    getModels: (id) => {
      calls.set(id, (calls.get(id) ?? 0) + 1)
      return [{
        providerID: "provider",
        modelID: `${id}-model`,
        name: `${id} model`,
        limit: { context: 100 },
      }]
    },
    getMessages: (id) => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: `${id}-model` },
        tokens: { input: 20, cache: { read: 10, write: 5 } },
      },
    }],
  })

  assert.deepEqual([...calls], [["main", 1], ["child", 1]])
  assert.deepEqual(rows.map((row) => row.modelName), ["main model", "child model"])
  assert.deepEqual(rows.map((row) => row.context), ["35 / 100 tok", "35 / 100 tok"])
})

test("reports unavailable context when session usage has no valid model limit", () => {
  const [row] = rowsFor({
    getMessages: () => [{
      info: { type: "assistant", model: { providerID: "provider", id: "missing" }, tokens: { input: 10 } },
    }],
  })

  assert.equal(row.context, "unavailable")
  assert.equal(row.contextPercentage, undefined)
})

test("counts subagents and summarizes loaded skill tokens", () => {
  const rows = rowsFor()
  const skills = [
    { id: "one", content: "12345678" },
    { id: "two", content: "1234" },
    { id: "three", content: "not loaded" },
  ]
  const viewModel = buildDashboardViewModel(rows, skills, new Set(["one", "two"]))

  assert.equal(viewModel.subagentCount, 1)
  assert.deepEqual(viewModel.skillSummary, { loadedCount: 2, totalCount: 3, loadedTokens: 3 })
})

test("indexes only available rows by stable session ID", () => {
  const viewModel = buildDashboardViewModel([
    { sessionID: "child", isMain: false },
    undefined,
    { isMain: false },
    { sessionID: "main", isMain: true },
  ])

  assert.equal(viewModel.rowBySessionID.get("child").sessionID, "child")
  assert.equal(viewModel.rowBySessionID.get("missing"), undefined)
  assert.deepEqual(viewModel.subagentIDs, ["child"])
})
