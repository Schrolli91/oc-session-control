import assert from "node:assert/strict"
import test from "node:test"
import {
  aggregateUsage,
  buildUsageBreakdown,
  cacheHitRate,
  cacheTtlStatus,
  formatElapsed,
  formatPercentage,
  formatPercentageChange,
  formatTokenCount,
  formatTokenTotal,
  lastCacheCallStats,
  latestAssistantUsage,
  usageBarWidths,
} from "./usage.mjs"

test("uses the latest assistant usage and ignores non-assistant messages", () => {
  const messages = [
    { type: "assistant", tokens: { input: 10 } },
    { type: "user", text: "next" },
    { info: { type: "assistant", tokens: { input: 20 } } },
  ]
  assert.equal(latestAssistantUsage(messages), messages[2].info)
})

test("aggregates token usage and estimated cache savings across the session family", () => {
  const sessions = {
    main: {
      model: { providerID: "provider", id: "model" },
      tokens: { input: 100, output: 20, reasoning: 5, cache: { read: 1_000_000, write: 10 } },
    },
    child: {
      model: { providerID: "provider", id: "model" },
      tokens: { input: 50, output: 30, reasoning: 10, cache: { read: 2_000_000, write: 20 } },
    },
  }
  const models = [{
    providerID: "provider",
    modelID: "model",
    cost: [
      { input: 1, output: 2, cache: { read: 0.1, write: 1.25 } },
      { tier: { type: "context", size: 200_000 }, input: 2, output: 4, cache: { read: 0.2, write: 2.5 } },
    ],
  }]
  const usage = aggregateUsage(
    ["main", "child", "child"],
    (id) => sessions[id],
    (id) => [{
      type: "assistant",
      model: sessions[id].model,
      tokens: { ...sessions[id].tokens },
    }],
    models,
  )
  assert.deepEqual({
    input: usage.input,
    cacheRead: usage.cacheRead,
    cacheWrite: usage.cacheWrite,
    output: usage.output,
    reasoning: usage.reasoning,
  }, {
    input: 150,
    cacheRead: 3_000_000,
    cacheWrite: 30,
    output: 50,
    reasoning: 15,
  })
  assert.equal(usage.saved.known, 2)
  assert.equal(usage.saved.missing, 0)
  assert.ok(Math.abs(usage.saved.total - 2.7) < Number.EPSILON)
})

test("uses the matching session location's model catalog for cache savings", () => {
  const sessions = {
    main: {
      model: { providerID: "provider", id: "model-a" },
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } },
    },
    child: {
      model: { providerID: "provider", id: "model-b" },
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } },
    },
  }
  const modelsBySession = {
    main: [{ providerID: "provider", modelID: "model-a", cost: { input: 1, cache: { read: 0.1 } } }],
    child: [{ providerID: "provider", modelID: "model-b", cost: { input: 2, cache: { read: 0.2 } } }],
  }
  const usage = aggregateUsage(
    ["main", "child"],
    (id) => sessions[id],
    (id) => [{
      type: "assistant",
      model: sessions[id].model,
      tokens: { ...sessions[id].tokens },
    }],
    (id) => modelsBySession[id],
  )
  assert.equal(usage.saved.known, 2)
  assert.equal(usage.saved.missing, 0)
  assert.ok(Math.abs(usage.saved.total - 2.7) < Number.EPSILON)
})

test("builds input, output, and session totals from the aggregated session family", () => {
  const usage = aggregateUsage(
    ["main", "child"],
    (id) => ({
      main: { tokens: { input: 100, cache: { read: 1_000_000, write: 10 }, output: 20, reasoning: 5 } },
      child: { tokens: { input: 50, cache: { read: 2_000_000, write: 20 }, output: 30, reasoning: 10 } },
    })[id],
    () => [],
    [],
  )
  assert.deepEqual(buildUsageBreakdown(usage), {
    sessionTotal: 3_000_245,
    input: { total: 3_000_180, cacheHit: 3_000_000, cacheMiss: 150, cacheWrite: 30 },
    output: { total: 65, reasoning: 15, response: 50 },
  })
})

test("preserves zero token counts and leaves missing or invalid fields unavailable", () => {
  assert.deepEqual(buildUsageBreakdown({ input: 0, cacheRead: 0, cacheWrite: 0, output: 0, reasoning: 0 }), {
    sessionTotal: 0,
    input: { total: 0, cacheHit: 0, cacheMiss: 0, cacheWrite: 0 },
    output: { total: 0, reasoning: 0, response: 0 },
  })
  assert.deepEqual(buildUsageBreakdown({ input: 10, cacheRead: undefined, cacheWrite: -1, output: NaN, reasoning: Infinity }), {
    sessionTotal: undefined,
    input: { total: undefined, cacheHit: undefined, cacheMiss: 10, cacheWrite: undefined },
    output: { total: undefined, reasoning: undefined, response: undefined },
  })
})

test("aggregates persistent counters independently when a family field is missing or invalid", () => {
  const usage = aggregateUsage(
    ["main", "child"],
    (id) => ({
      main: { tokens: { input: 5, cache: { read: 2, write: 1 }, output: 8, reasoning: 3 } },
      child: { tokens: { input: undefined, cache: { read: 0, write: 0 }, output: NaN, reasoning: 10 } },
    })[id],
    () => [],
    [],
  )
  assert.deepEqual(usage, {
    input: undefined,
    cacheRead: 2,
    cacheWrite: 1,
    output: undefined,
    reasoning: 13,
    saved: { total: 0, known: 1, missing: 1 },
  })
})

test("returns unavailable usage when every counter is invalid", () => {
  assert.equal(aggregateUsage(
    ["main"],
    () => ({ tokens: { input: -1, cache: { read: NaN, write: -1 }, output: Infinity, reasoning: undefined } }),
    () => [],
    [],
  ), undefined)
})

test("preserves valid zero counters in aggregated usage", () => {
  assert.deepEqual(aggregateUsage(
    ["main"],
    () => ({ tokens: { input: 0, cache: { read: 0, write: 0 }, output: 0, reasoning: 0 } }),
    () => [],
    [],
  ), {
    input: 0,
    cacheRead: 0,
    cacheWrite: 0,
    output: 0,
    reasoning: 0,
    saved: { total: 0, known: 1, missing: 0 },
  })
})

test("adds reasoning to visible output when calculating the output total", () => {
  assert.deepEqual(buildUsageBreakdown({ input: 1, cacheRead: 0, cacheWrite: 0, output: 4, reasoning: 5 }), {
    sessionTotal: 10,
    input: { total: 1, cacheHit: 0, cacheMiss: 1, cacheWrite: 0 },
    output: { total: 9, reasoning: 5, response: 4 },
  })
})

test("rounds proportional usage bar widths to fill the requested width", () => {
  assert.deepEqual(usageBarWidths([1, 2, 1], 10), [3, 5, 2])
  assert.deepEqual(usageBarWidths([1, 1, 1], 5), [2, 2, 1])
  assert.deepEqual(usageBarWidths([0, 3], 8), [0, 8])
})

test("omits usage bar widths for missing, invalid, or zero distributions", () => {
  for (const [values, width] of [
    [undefined, 5],
    [[], 5],
    [[0, 0], 5],
    [[1, undefined], 5],
    [[1, -1], 5],
    [[1, NaN], 5],
    [[1, 2], 0],
    [[1, 2], 2.5],
  ]) {
    assert.equal(usageBarWidths(values, width), undefined)
  }
})

test("leaves estimated cache savings unpriced when model pricing is missing", () => {
  const usage = aggregateUsage(
    ["main"],
    () => ({ tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1, write: 0 } } }),
    () => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: "unknown" },
        tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1, write: 0 } },
      },
    }],
    [],
  )
  assert.deepEqual(usage.saved, { total: 0, known: 0, missing: 1 })
})

test("leaves cache savings unpriced when message history cannot establish a model", () => {
  const usage = aggregateUsage(
    ["main"],
    () => ({
      model: { providerID: "provider", id: "model" },
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1, write: 0 } },
    }),
    () => [],
    [{ providerID: "provider", modelID: "model", cost: { input: 1, cache: { read: 0.1 } } }],
  )
  assert.deepEqual(usage.saved, { total: 0, known: 0, missing: 1 })
})

test("leaves cache savings unpriced when no retained call reports cache reads", () => {
  const usage = aggregateUsage(
    ["main"],
    () => ({
      model: { providerID: "provider", id: "model" },
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } },
    }),
    () => [{
      info: {
        type: "assistant",
        model: { providerID: "provider", id: "model" },
        tokens: { input: 5, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
      },
    }],
    [{ providerID: "provider", modelID: "model", cost: { input: 1, cache: { read: 0.1 } } }],
  )
  assert.deepEqual(usage.saved, { total: 0, known: 0, missing: 1 })
})

test("keeps usage available when message history has a malformed shape", () => {
  const usage = aggregateUsage(
    ["main"],
    () => ({ tokens: { input: 3, output: 2, reasoning: 0, cache: { read: 1, write: 0 } } }),
    () => ({ unexpected: true }),
    [],
  )
  assert.deepEqual(usage, {
    input: 3,
    cacheRead: 1,
    cacheWrite: 0,
    output: 2,
    reasoning: 0,
    saved: { total: 0, known: 0, missing: 1 },
  })
  assert.equal(latestAssistantUsage({ unexpected: true }), undefined)
  assert.equal(lastCacheCallStats(["main"], () => ({ unexpected: true })), undefined)
})

test("prices each call under its own model when session history switches models", () => {
  const usage = aggregateUsage(
    ["main"],
    () => ({
      model: { providerID: "provider", id: "model-b" },
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } },
    }),
    () => [
      { info: {
        type: "assistant",
        model: { providerID: "provider", id: "model-a" },
        tokens: { input: 0, cache: { read: 600_000, write: 0 } },
      } },
      { info: {
        type: "assistant",
        model: { providerID: "provider", id: "model-b" },
        tokens: { input: 0, cache: { read: 400_000, write: 0 } },
      } },
    ],
    [
      { providerID: "provider", modelID: "model-a", cost: { input: 1, cache: { read: 0.1 } } },
      { providerID: "provider", modelID: "model-b", cost: { input: 2, cache: { read: 0.2 } } },
    ],
  )
  assert.equal(usage.saved.known, 1)
  assert.equal(usage.saved.missing, 0)
  assert.ok(Math.abs(usage.saved.total - 1.26) < 1e-12)
})

test("marks only the compacted session as unpriced", () => {
  const pricedCall = {
    info: {
      type: "assistant",
      model: { providerID: "provider", id: "model-a" },
      tokens: { input: 0, cache: { read: 1_000_000, write: 0 } },
    },
  }
  const usage = aggregateUsage(
    ["main", "child"],
    (id) => ({
      main: { tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } } },
      child: { tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 1_000_000, write: 0 } } },
    })[id],
    (id) => id === "main"
      ? [{ type: "compaction", status: "completed" }, pricedCall]
      : [pricedCall],
    [{ providerID: "provider", modelID: "model-a", cost: { input: 1, cache: { read: 0.1 } } }],
  )
  assert.equal(usage.saved.known, 1)
  assert.equal(usage.saved.missing, 1)
  assert.ok(Math.abs(usage.saved.total - 0.9) < 1e-12)
})

test("formats token totals with compact suffixes", () => {
  assert.equal(formatTokenTotal(850), "850")
  assert.equal(formatTokenTotal(66_493_563), "66M")
  assert.equal(formatTokenTotal(872_000), "872K")
  assert.equal(formatTokenTotal(1_234_000_000), "1.2B")
})

test("calculates family and per-call cache hit rates", () => {
  assert.equal(cacheHitRate(700, 300), 30)
  assert.equal(cacheHitRate(0, 0), undefined)
  assert.equal(cacheHitRate(Number.MAX_VALUE, Number.MAX_VALUE), 50)
  assert.equal(cacheHitRate(3, 1), 25)
  const messages = {
    main: [{ info: {
      type: "assistant",
      time: { created: 1_000, completed: 1_100 },
      tokens: { input: 60, cache: { read: 40 } },
    } }],
    child: [{ info: {
      type: "assistant",
      time: { created: 2_000, completed: 2_100 },
      tokens: { input: 40, cache: { read: 60 } },
    } }],
  }
  assert.deepEqual(lastCacheCallStats(["main", "child"], (id) => messages[id]), {
    rate: 60,
    change: 20,
    timestamp: 2_100,
  })
})

test("orders calls with valid timestamps after calls missing timestamps", () => {
  const messages = {
    first: [{ info: {
      type: "assistant",
      time: { created: 300 },
      tokens: { input: 3, cache: { read: 1 } },
    } }],
    missing: [{ info: {
      type: "assistant",
      tokens: { input: 1, cache: { read: 1 } },
    } }],
    last: [{ info: {
      type: "assistant",
      time: { created: 200 },
      tokens: { input: 1, cache: { read: 3 } },
    } }],
  }
  assert.deepEqual(lastCacheCallStats(["first", "missing", "last"], (id) => messages[id]), {
    rate: 25,
    change: -50,
    timestamp: 300,
  })
})

test("formats cache percentages and TTL thresholds", () => {
  assert.equal(formatPercentage(42.268), "42.27%")
  assert.equal(formatPercentage(99.9985), "100.00%")
  assert.equal(formatPercentage(100), "100.00%")
  assert.equal(formatPercentageChange(5.2), "↑5.2%")
  assert.equal(formatPercentageChange(-3), "↓3.0%")
  assert.equal(formatPercentageChange(0), "→0.0%")
  assert.equal(formatElapsed(135_000), "2m 15s")
  assert.equal(cacheTtlStatus(179_999), "fresh")
  assert.equal(cacheTtlStatus(180_000), "aging")
  assert.equal(cacheTtlStatus(299_999), "aging")
  assert.equal(cacheTtlStatus(300_000), "stale")
})

test("formats context token counts compactly", () => {
  assert.equal(formatTokenCount(850), "850")
  assert.equal(formatTokenCount(1_234), "1.2k")
  assert.equal(formatTokenCount(124_000), "124k")
  assert.equal(formatTokenCount(999_999), "1m")
  assert.equal(formatTokenCount(1_234_000), "1.2m")
  assert.equal(formatTokenCount(1_234_000_000), "1.2b")
})
