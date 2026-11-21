import assert from "node:assert/strict"
import test from "node:test"
import { formatModelDetails } from "./model-details.mjs"

test("formats model details with provider, capabilities, limits, and tiered rates", () => {
  const message = formatModelDetails({
    name: "Friendly model",
    modelID: "model-id",
    family: "family",
    type: "language",
    capabilities: { input: ["text", "image"], output: ["text"], tools: true },
    limit: { context: 200_000, input: 100_000, output: 20_000 },
    cost: [
      { input: 0.1, output: 0.5, cache: { read: 0.01, write: 0 } },
      { tier: { type: "context", size: 200_000 }, input: 0.2, output: 1, cache: { read: 0.02, write: 0 } },
    ],
  }, { providerID: "provider", id: "model-id", variant: "thinking" }, { name: "Provider" })

  assert.match(message, /Name: +Friendly model/)
  assert.match(message, /Model: +model-id #thinking/)
  assert.match(message, /Provider: +Provider · provider/)
  assert.match(message, /Limits: +↕200K ↑100K ↓20K/)
  assert.match(message, /Capabilities: +language · Input text · Input image · Output text · Tools/)
  assert.match(message, /Context > 200K tok/)
  assert.match(message, /Cached input: +\$0\.01\/M/)
})

test("formats missing model details without provider or price data", () => {
  const message = formatModelDetails(undefined, { providerID: "provider", id: "unknown" })

  assert.match(message, /Name: +unknown/)
  assert.match(message, /Provider: +provider · provider/)
  assert.match(message, /Input: +unavailable/)
})

test("omits malformed model capabilities and keeps valid string entries", () => {
  const modelRef = { providerID: "provider", id: "model-id" }
  const malformed = formatModelDetails({
    capabilities: { input: "text", output: { image: true }, tools: "yes" },
  }, modelRef)
  const partial = formatModelDetails({
    capabilities: { input: [null, 42, "text"], output: [false, "image"], tools: true },
  }, modelRef)

  assert.doesNotMatch(malformed, /Capabilities:/)
  assert.match(partial, /Capabilities: +Input text · Output image · Tools/)
})
