import assert from "node:assert/strict"
import test from "node:test"
import { findModel, formatModelRate, getModelBaseCost, getModelCostTiers, getModelName } from "./models.mjs"

test("resolves display names for agent models", () => {
  const models = [{ providerID: "provider", modelID: "model-id", id: "model-entry", name: "Friendly model" }]
  assert.equal(getModelName({ providerID: "provider", id: "model-id" }, models), "Friendly model")
  assert.equal(getModelName({ providerID: "provider", id: "custom-model" }, models), "custom-model")
  assert.equal(getModelName(undefined, models), "unavailable")
})

test("handles missing or invalid model catalogs and null entries", () => {
  const modelRef = { providerID: "provider", id: "model-id" }
  const model = { providerID: "provider", modelID: "model-id", name: "Friendly model" }

  for (const models of [undefined, null, {}, "invalid"]) {
    assert.equal(findModel(modelRef, models), undefined)
    assert.equal(getModelName(modelRef, models), "model-id")
  }

  assert.equal(findModel(modelRef, [null, undefined, model]), model)
  assert.equal(findModel(modelRef, [null, undefined]), undefined)
})

test("reads base and tiered model prices for the details overlay", () => {
  const model = {
    cost: [
      { input: 0.1, output: 0.5, cache: { read: 0.01, write: 0 } },
      { tier: { type: "context", size: 200_000 }, input: 0.2, output: 1, cache: { read: 0.02, write: 0 } },
    ],
  }
  assert.equal(getModelCostTiers(model).length, 2)
  assert.equal(getModelBaseCost(model), model.cost[0])
  assert.equal(formatModelRate(0.1), "$0.10/M")
  assert.equal(formatModelRate(0.003), "$0.003/M")
  assert.equal(formatModelRate(undefined), "unavailable")
})
