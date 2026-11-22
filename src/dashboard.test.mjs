import assert from "node:assert/strict"
import test from "node:test"
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

const makeContext = (session, messages) => ({
  theme: {},
  themeMode: "dark",
  data: {
    session: {
      get: (id) => (id === "main" ? session : undefined),
      status: () => "idle",
      permission: { list: () => [] },
      form: { list: () => [] },
      message: { list: (id) => (id === "main" ? messages : []) },
    },
    location: {
      agent: { list: () => [], sync: async () => {} },
      skill: { list: () => [], sync: async () => {} },
      model: { list: (target) => (target === location ? models : []), sync: async () => {} },
      provider: { list: () => [], sync: async () => {} },
    },
  },
  ui: { router: { navigate: () => {} }, dialog: { alert: async () => {} } },
})

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

const renderDashboard = async (session, messages, t) => {
  let Dashboard
  try {
    ({ Dashboard } = await import("../dist/dashboard.js"))
  } catch {
    t.skip("dist/ fehlt — zuerst `npm run build` ausführen")
    return undefined
  }
  try {
    const setup = await testRender(() => Dashboard({
      context: makeContext(session, messages),
      location,
      sessionFamily: () => ["main"],
      executingSessionIDs: () => new Set(),
      executionResults: () => new Map(),
      refreshSession: async () => {},
      insertSkill: () => {},
      sessionID: () => "main",
    }), { width: 60, height: 40 })
    await setup.renderOnce()
    await setup.flush()
    return setup
  } catch (error) {
    t.skip(`OpenTUI-FFI nicht verfügbar: ${error?.message ?? error}`)
    return undefined
  }
}

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
    assert.match(frame, /Claude Sonnet 4\.5/)
    assert.match(frame, /Context: 250\.1%\s+500\.1k \/ 200K tok/)
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
