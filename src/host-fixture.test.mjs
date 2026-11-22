import assert from "node:assert/strict"
import test from "node:test"
import { aggregateUsage, buildUsageBreakdown, cacheHitRate } from "./usage.mjs"

// Feldsemantik des Hosts (session.tokens bzw. assistant.info.tokens), hier als
// Fixture festgenagelt — ändert der Host eine Bedeutung, muss dieses Testfile
// explizit angepasst werden:
//   input       = NUR ungespeiste (non-cached) Input-Tokens → "Cache Miss"
//   cache.read  = Cache-Treffer → "Cache Hit"
//   cache.write = Tokens, die in den Cache geschrieben wurden
//   output      = sichtbare Antwort-Tokens OHNE reasoning → "Response"
//   reasoning   = separat gemeldete Denk-Tokens
const modelRef = { providerID: "anthropic", id: "claude-sonnet-4-5" }
const models = [{
  providerID: "anthropic",
  modelID: "claude-sonnet-4-5",
  cost: [{ input: 3, output: 15, cache: { read: 0.3, write: 3.75 } }],
}]
const hostSession = {
  model: modelRef,
  tokens: { input: 30, output: 40, reasoning: 25, cache: { read: 970, write: 30 } },
}
const hostMessages = [{
  type: "assistant",
  info: {
    type: "assistant",
    model: modelRef,
    tokens: { input: 30, output: 40, reasoning: 25, cache: { read: 970, write: 30 } },
  },
}]
const aggregate = (session) => aggregateUsage(
  ["main"],
  () => session,
  () => hostMessages,
  models,
)

test("host field semantics: input is non-cached, output excludes reasoning", () => {
  const usage = aggregate(hostSession)
  const breakdown = buildUsageBreakdown(usage)

  assert.deepEqual(breakdown.input, {
    total: 1_030, // input + cache read + cache write
    cacheHit: 970,
    cacheMiss: 30, // der input-Zähler IST die Cache-Miss-Menge
    cacheWrite: 30,
  })
  assert.deepEqual(breakdown.output, {
    total: 65, // output + reasoning
    reasoning: 25,
    response: 40, // response = reines output-Feld, ohne reasoning
  })
  assert.equal(breakdown.sessionTotal, 1_095)

  // Trefferquote: Treffer / (input + Treffer + Writes)
  const rate = cacheHitRate(usage.input, usage.cacheRead, usage.cacheWrite)
  assert.ok(Math.abs(rate - (970 / 1_030) * 100) < 1e-10, `rate ${rate}`)
})

test("aggregateUsage → buildUsageBreakdown fails closed on an invalid field", () => {
  const broken = {
    ...hostSession,
    tokens: { ...hostSession.tokens, cache: { read: 970, write: -1 } },
  }
  const usage = aggregate(broken)

  // Das ungültige Feld wird verworfen, die gültigen bleiben erhalten.
  assert.equal(usage.cacheWrite, undefined)
  assert.equal(usage.input, 30)
  assert.equal(usage.cacheRead, 970)
  assert.equal(usage.output, 40)
  assert.equal(usage.reasoning, 25)

  const breakdown = buildUsageBreakdown(usage)
  // Ein Gruppentotal entsteht nur bei vollständigen Feldern …
  assert.equal(breakdown.input.total, undefined)
  assert.equal(breakdown.sessionTotal, undefined)
  // … die Einzelwerte bleiben sichtbar, die Output-Seite ist unberührt.
  assert.equal(breakdown.input.cacheHit, 970)
  assert.equal(breakdown.input.cacheMiss, 30)
  assert.deepEqual(breakdown.output, { total: 65, reasoning: 25, response: 40 })
})
