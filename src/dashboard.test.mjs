import assert from "node:assert/strict"
import test from "node:test"
import { TextAttributes } from "@opentui/core"
import { testRender } from "@opentui/solid"

// Rendert die echte Dashboard-Komponente headless (@opentui/core/testing) und
// prüft den sichtbaren Sidebar-Frame. Benötigt Node >= 26.4 mit
// `--experimental-ffi` (siehe test.yml) — ohne FFI oder ohne gebautes dist/
// wird der Test übersprungen statt fehlerhaft.

const location = { directory: "/tmp/project", workspaceID: "ws1" }
const modelRef = { providerID: "anthropic", id: "claude-sonnet-4-5" }
const models = [{
  providerID: "anthropic",
  modelID: "claude-sonnet-4-5",
  name: "Claude Sonnet 4.5",
  limit: { context: 200_000, output: 64_000 },
  cost: [{ input: 3, output: 15, cache: { read: 0.3, write: 3.75 } }],
}]

const makeContext = (session, messages, subagents = []) => {
  const sessions = new Map([["main", session], ...subagents.map(({ session }) => [session.id, session])])
  const messagesBySession = new Map([["main", messages], ...subagents.map(({ session, messages }) => [session.id, messages])])
  return {
    theme: {},
    themeMode: "dark",
    data: {
      session: {
        get: (id) => sessions.get(id),
        status: () => "idle",
        permission: { list: () => [] },
        form: { list: () => [] },
        message: { list: (id) => messagesBySession.get(id) ?? [] },
      },
      location: {
        agent: { list: () => [], sync: async () => {} },
        skill: { list: () => [], sync: async () => {} },
        model: { list: (target) => (target === location ? models : []), sync: async () => {} },
        provider: { list: () => [], sync: async () => {} },
      },
    },
    ui: { router: { navigate: () => {} }, dialog: { alert: async () => {} } },
  }
}

const healthySession = {
  id: "main",
  model: modelRef,
  cost: 1.2345,
  location,
  tokens: { input: 100, output: 20, reasoning: 5, cache: { read: 1_000_000, write: 0 } },
  permissions: [],
}
const assistantMessage = {
  type: "assistant",
  info: {
    type: "assistant",
    model: modelRef,
    time: { completed: Date.now() - 30_000 },
    tokens: { input: 100, output: 20, reasoning: 5, cache: { read: 500_000, write: 0 } },
  },
}

const renderDashboard = async (session, messages, t, subagents = []) => {
  let Dashboard
  try {
    ({ Dashboard } = await import("../dist/dashboard.js"))
  } catch {
    t.skip("dist/ fehlt — zuerst `npm run build` ausführen")
    return undefined
  }
  try {
    const setup = await testRender(() => Dashboard({
      context: makeContext(session, messages, subagents),
      location,
      sessionFamily: () => subagents.map(({ session: child }) => child.id),
      executingSessionIDs: () => new Set(),
      executionResults: () => new Map(),
      refreshSession: async () => {},
      insertSkill: () => {},
      sessionID: "main",
    }), { width: 60, height: 60 })
    await setup.renderOnce()
    await setup.flush()
    return setup
  } catch (error) {
    t.skip(`OpenTUI-FFI nicht verfügbar: ${error?.message ?? error}`)
    return undefined
  }
}

const modelNameSpans = (setup, name) => setup.captureSpans().lines
  .filter((line) => line.spans.some((span) => span.text.includes("Model:")))
  .flatMap((line) => line.spans)
  .filter((span) => span.text.includes(name))

test("renders the session usage, totals, and cache sections", async (t) => {
  const setup = await renderDashboard(healthySession, [assistantMessage], t)
  if (!setup) return
  try {
    const frame = setup.captureCharFrame()
    assert.match(frame, /Session usage/)
    assert.match(frame, /\$1\.2345/)
    // Ohne Subagenten gibt es keine Kostenzeile — der Wert steht nur im Heading.
    assert.doesNotMatch(frame, /Mainagent:/)
    assert.match(frame, /Saved \(est\.\):/)
    assert.match(frame, /Session Total\s+1M tok/)
    assert.match(frame, /Cache Hit\s+1M tok/)
    assert.match(frame, /Reasoning\s+5 tok/)
    assert.match(frame, /Cache\s+99\.9\d%/)
    assert.doesNotMatch(frame, /◆ Mainagent\s+99\.99%/)
    assert.match(frame, /Last call:\s+—\s+99\.98%/)
    assert.match(frame, /Claude Sonnet 4\.5/)
    assert.match(frame, /Context: 250\.1%\s+500\.1k \/ 200K tok/)
  } finally {
    await setup.dispose()
  }
})

test("renders separate cache rates and last calls for the main agent and subagent", async (t) => {
  const child = {
    session: {
      id: "child",
      title: "explore-this-very-long-subagent-name-that-must-be-truncated",
      model: modelRef,
      cost: 0,
      location,
      tokens: { input: 500, output: 0, reasoning: 0, cache: { read: 500, write: 0 } },
      permissions: [],
    },
    messages: [
      { info: {
        type: "assistant",
        model: modelRef,
        time: { completed: Date.now() - 120_000 },
        tokens: { input: 100, cache: { read: 0, write: 0 } },
      } },
      { info: {
        type: "assistant",
        model: modelRef,
        time: { completed: Date.now() - 60_000 },
        tokens: { input: 25, cache: { read: 75, write: 0 } },
      } },
    ],
  }
  const setup = await renderDashboard(healthySession, [assistantMessage], t, [child])
  if (!setup) return
  try {
    const frame = setup.captureCharFrame()
    assert.match(frame, /Cache\s+99\.94%/)
    assert.match(frame, /◆ Mainagent\s+99\.99%/)
    assert.match(frame, /◆ Mainagent:/)
    assert.match(frame, /↳ Subagents:/)
    assert.match(frame, /◆ Mainagent/)
    assert.match(frame, /↳ explore[^…\n]*… +50\.00%/)
    assert.match(frame, /Last call:\s+—\s+99\.98%/)
    assert.match(frame, /Last call:\s+↑75\.0%\s+75\.00%/)
    assert.match(frame, /TTL:\s+●\s+1m 0?s/)
    const modelSpans = modelNameSpans(setup, "Claude Sonnet 4.5")
    assert.equal(modelSpans.length, 2)
    assert.ok(modelSpans.every((span) => span.attributes & TextAttributes.UNDERLINE))
  } finally {
    await setup.dispose()
  }
})

test("does not underline an unavailable model label", async (t) => {
  const session = { ...healthySession, model: undefined }
  const setup = await renderDashboard(session, [], t)
  if (!setup) return
  try {
    const modelSpans = modelNameSpans(setup, "unavailable")
    assert.equal(modelSpans.length, 1)
    assert.equal(modelSpans[0].attributes & TextAttributes.UNDERLINE, 0)
  } finally {
    await setup.dispose()
  }
})

test("renders a bare dash instead of '— tok' for an invalid token field", async (t) => {
  const brokenSession = {
    ...healthySession,
    tokens: { ...healthySession.tokens, cache: { read: 1_000_000, write: -1 } },
  }
  const setup = await renderDashboard(brokenSession, [assistantMessage], t)
  if (!setup) return
  try {
    const frame = setup.captureCharFrame()
    // Die Gruppentotale sind ungültig → Session Total zeigt nur "—".
    assert.match(frame, /Session Total\s+—/)
    assert.ok(!frame.includes("— tok"), "kein '— tok'-Platzhalter im Frame")
  } finally {
    await setup.dispose()
  }
})
