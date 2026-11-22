import assert from "node:assert/strict"
import test from "node:test"
import { aggregateCosts, buildSessionCostRows, formatCost, formatTotal } from "./costs.mjs"

test("formats a known session cost as USD", () => {
  assert.equal(formatCost(0.012345), "$0.0123")
  assert.equal(formatCost(0.01236), "$0.0124")
  assert.equal(formatCost(0.1), "$0.1000")
})

test("shows unavailable for a missing session cost", () => {
  assert.equal(formatCost(undefined), "unavailable")
  assert.equal(formatTotal({ total: 0, known: 0, missing: 1 }), "unavailable")
})

test("aggregates the main session cost", () => {
  const costs = aggregateCosts(["main"], () => 0.25)
  assert.deepEqual(costs, { total: 0.25, known: 1, missing: 0 })
  assert.equal(formatTotal(costs), "$0.2500")
})

test("deduplicates session IDs and marks a partial total", () => {
  const costs = aggregateCosts(["main", "child", "main"], (id) =>
    id === "main" ? 0.1 : undefined,
  )
  assert.deepEqual(costs, { total: 0.1, known: 1, missing: 1 })
  assert.equal(formatTotal(costs), "$0.1000 (partial)")
})

test("sums costs from a session family", () => {
  const costs = aggregateCosts(["main", "child-a", "child-b"], (id) => ({
    main: 0.1,
    "child-a": 0.2,
    "child-b": 0.3,
  })[id])
  assert.ok(Math.abs(costs.total - 0.6) < Number.EPSILON)
  assert.equal(formatTotal(costs), "$0.6000")
})

test("builds visible cost rows even when token usage and cache savings are unavailable", () => {
  assert.deepEqual(buildSessionCostRows(
    "$0.1000",
    { total: 0.2, known: 1, missing: 0 },
    1,
    undefined,
  ), [
    { label: "Mainagent:", value: "$0.1000" },
    { label: "Subagents:", value: "$0.2000" },
    { label: "Saved (est.):", value: "unavailable" },
  ])
})

test("renders the cache savings estimate from its coverage summary", () => {
  const savedRow = (saved) => buildSessionCostRows(
    "$0.1000",
    { total: 0, known: 1, missing: 0 },
    0,
    saved,
  )[2]
  assert.deepEqual(savedRow({ total: 0, known: 1, missing: 0 }), {
    label: "Saved (est.):",
    value: "~$0.0000",
  })
  assert.deepEqual(savedRow({ total: 1.2345, known: 2, missing: 0 }), {
    label: "Saved (est.):",
    value: "~$1.2345",
  })
  assert.deepEqual(savedRow({ total: 1.2345, known: 1, missing: 1 }), {
    label: "Saved (est.):",
    value: "~$1.2345 (partial)",
  })
  assert.deepEqual(savedRow({ total: 0, known: 0, missing: 2 }), {
    label: "Saved (est.):",
    value: "unavailable",
  })
})
