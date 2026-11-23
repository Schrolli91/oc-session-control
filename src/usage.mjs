import { findModel, getModelBaseCost, getModelCostTiers } from "./models.mjs"

export function latestAssistantUsage(messages) {
  if (!Array.isArray(messages)) return undefined
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const info = messages[index]?.info ?? messages[index]
    if (info?.type === "compaction" && info.status === "completed") return undefined
    if (info?.type === "assistant" && info.tokens) return info
  }
  return undefined
}

function hasCompletedCompaction(messages) {
  return messages.some((message) => {
    const type = message?.type ?? message?.info?.type
    const status = message?.status ?? message?.info?.status
    return type === "compaction" && status === "completed"
  })
}

// Price each assistant call under the model it was billed under, so a model switch
// no longer invalidates the session's estimate. `known` means a priceable number
// exists for the session; `missing` means that number does not cover the whole
// lifetime cache-read counter.
// Context-Tier gewinnt, sobald das genutzte Fenster die Schwelle des Tiers
// ueberschreitet; ohne gueltige Fenstergroesse oder Tier bleibt der Basistier.
function pricingForContext(model, tokens) {
  const base = getModelBaseCost(model)
  const used = (tokens?.input ?? NaN) +
    (tokens?.cache?.read ?? NaN) +
    (tokens?.cache?.write ?? NaN)
  if (!Number.isFinite(used)) return base
  const tier = getModelCostTiers(model)
    .filter((entry) => entry?.tier?.type === "context" && Number.isFinite(entry.tier?.size))
    .filter((entry) => used > entry.tier.size)
    .sort((a, b) => b.tier.size - a.tier.size)[0]
  return tier ?? base
}

function sessionSavings(tokens, messages, sessionModels) {
  const cacheRead = tokens?.cache?.read
  if (!Number.isFinite(cacheRead) || cacheRead < 0) return { known: false, missing: true }
  if (cacheRead === 0) return { total: 0, known: true }
  if (!Array.isArray(messages)) return { known: false, missing: true }
  const compacted = hasCompletedCompaction(messages)

  const calls = messages
    .map((message) => message?.info ?? message)
    .filter((info) => info?.type === "assistant")
  if (calls.length === 0) return { known: false, missing: true }

  let total = 0
  let summedRead = 0
  for (const info of calls) {
    const read = info.tokens?.cache?.read
    // A call without cache reads carries none to attribute, so it cannot make the
    // session's coverage unknown.
    if (read == null || read === 0) continue
    if (!Number.isFinite(read) || read < 0) return { known: false, missing: true }
    summedRead += read

    const pricing = pricingForContext(findModel(info.model, sessionModels), info.tokens)
    const inputRate = pricing?.input
    const cacheRate = pricing?.cache?.read
    const writeRate = pricing?.cache?.write
    if (
      !Number.isFinite(inputRate) || inputRate < 0 ||
      !Number.isFinite(cacheRate) || cacheRate < 0
    ) return { known: false, missing: true }

    // Geschriebene Cache-Tokens kosten den Ueberpreis gegenueber Input; er senkt
    // die Ersparnis. Klemme pro Call auf 0 — nie eine negative Ersparnis.
    let estimate = (read * (inputRate - cacheRate)) / 1_000_000
    const write = info.tokens?.cache?.write
    if (Number.isFinite(write) && write > 0) {
      if (!Number.isFinite(writeRate) || writeRate < 0) return { known: false, missing: true }
      estimate -= (write * (writeRate - inputRate)) / 1_000_000
    }
    estimate = Math.max(0, estimate)
    if (!Number.isFinite(total + estimate)) return { known: false, missing: true }
    total += estimate
  }
  // Lifetime counter books reads that no retained call reports: the messages do not
  // cover them, so a total would be false rather than a lower bound.
  if (summedRead === 0) return { known: false, missing: true }
  if (compacted || summedRead < cacheRead) return { total, known: true, missing: true }
  return { total, known: true }
}

export function aggregateUsage(sessionIDs, getSession, getMessages, models) {
  const totals = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0, reasoning: 0 }
  const valid = Object.fromEntries(Object.keys(totals).map((field) => [field, true]))
  const saved = { total: 0, known: 0, missing: 0 }
  let hasUsage = false

  for (const sessionID of new Set(sessionIDs.filter(Boolean))) {
    const session = getSession(sessionID)
    const tokens = session?.tokens
    if (!tokens) continue

    hasUsage = true
    const values = {
      input: tokens.input,
      cacheRead: tokens.cache?.read,
      cacheWrite: tokens.cache?.write,
      output: tokens.output,
      reasoning: tokens.reasoning,
    }
    for (const [field, value] of Object.entries(values)) {
      if (!Number.isFinite(value) || value < 0 || !Number.isFinite(totals[field] + value)) {
        valid[field] = false
      } else if (valid[field]) {
        totals[field] += value
      }
    }

    const sessionModels = typeof models === "function" ? models(sessionID) : models
    const coverage = sessionSavings(tokens, getMessages(sessionID), sessionModels)
    if (coverage.known) {
      saved.known += 1
      saved.total += coverage.total
    }
    if (coverage.missing) saved.missing += 1
  }

  return hasUsage && Object.values(valid).some(Boolean)
    ? {
        ...Object.fromEntries(Object.entries(totals).map(([field, value]) => [field, valid[field] ? value : undefined])),
        saved,
      }
    : undefined
}

export function buildUsageBreakdown(usage) {
  const count = (value) => Number.isFinite(value) && value >= 0 ? value : undefined
  const input = count(usage?.input)
  const cacheHit = count(usage?.cacheRead)
  const cacheWrite = count(usage?.cacheWrite)
  const output = count(usage?.output)
  const reasoning = count(usage?.reasoning)
  const inputTotal = input !== undefined && cacheHit !== undefined && cacheWrite !== undefined
    ? input + cacheHit + cacheWrite
    : undefined
  const validInputTotal = Number.isFinite(inputTotal) ? inputTotal : undefined
  const outputTotal = output !== undefined && reasoning !== undefined ? output + reasoning : undefined
  const validOutputTotal = Number.isFinite(outputTotal) ? outputTotal : undefined
  const sessionTotal = validInputTotal !== undefined && validOutputTotal !== undefined
    ? validInputTotal + validOutputTotal
    : undefined

  return {
    sessionTotal: Number.isFinite(sessionTotal) ? sessionTotal : undefined,
    input: {
      total: validInputTotal,
      cacheHit,
      cacheMiss: input,
      cacheWrite,
    },
    output: {
      total: validOutputTotal,
      reasoning,
      response: output,
    },
  }
}

export function usageBarWidths(values, width) {
  if (!Array.isArray(values) || values.length === 0 || !Number.isSafeInteger(width) || width <= 0) return undefined
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return undefined

  const total = values.reduce((sum, value) => sum + value, 0)
  if (!Number.isFinite(total) || total <= 0) return undefined

  const exactWidths = values.map((value) => (value / total) * width)
  const widths = exactWidths.map(Math.floor)
  let remainder = width - widths.reduce((sum, value) => sum + value, 0)
  const order = exactWidths
    .map((value, index) => ({ index, fraction: value - widths[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  for (let index = 0; remainder > 0; index += 1, remainder -= 1) {
    widths[order[index % order.length].index] += 1
  }
  return widths
}

export function cacheHitRate(input, cacheRead, cacheWrite = 0) {
  if (
    !Number.isFinite(input) || input < 0 ||
    !Number.isFinite(cacheRead) || cacheRead < 0 ||
    !Number.isFinite(cacheWrite) || cacheWrite < 0
  ) return undefined
  const scale = Math.max(input, cacheRead, cacheWrite)
  const rate = scale > 0
    ? (cacheRead / scale) / (input / scale + cacheRead / scale + cacheWrite / scale) * 100
    : undefined
  return rate === undefined ? undefined : Number(rate.toPrecision(15))
}

export function lastCacheCallStats(messages) {
  if (!Array.isArray(messages)) return undefined
  const calls = []
  for (const message of messages) {
    const info = message?.info ?? message
    if (info?.type !== "assistant" || !info.tokens) continue
    calls.push({
      rate: cacheHitRate(info.tokens.input, info.tokens.cache?.read, info.tokens.cache?.write),
      timestamp: info.time?.completed ?? info.time?.created,
      order: calls.length,
    })
  }
  calls.sort((a, b) => {
    const aHasTime = Number.isFinite(a.timestamp)
    const bHasTime = Number.isFinite(b.timestamp)
    if (aHasTime && bHasTime) return a.timestamp - b.timestamp || a.order - b.order
    if (aHasTime !== bHasTime) return aHasTime ? 1 : -1
    return a.order - b.order
  })
  const last = calls.at(-1)
  const previous = calls.at(-2)
  return last
    ? {
        rate: last.rate,
        change: Number.isFinite(last.rate) && Number.isFinite(previous?.rate)
          ? last.rate - previous.rate
          : undefined,
        timestamp: Number.isFinite(last.timestamp) ? last.timestamp : undefined,
      }
    : undefined
}

export function sessionCacheStats(session, messages) {
  const tokens = session?.tokens
  return {
    rate: cacheHitRate(tokens?.input, tokens?.cache?.read, tokens?.cache?.write),
    lastCall: lastCacheCallStats(messages),
  }
}

export function formatPercentage(value) {
  if (!Number.isFinite(value)) return "—"
  // 1e-9 kompensiert die Gleitkomma-Unterschreitung von value*100 (z.B. 0.29),
  // ohne echte Nachkommstellen aufzurunden — abschneiden wie in der Spez gefordert.
  return `${(Math.floor(value * 100 + 1e-9) / 100).toFixed(2)}%`
}

export function formatPercentageChange(value) {
  if (!Number.isFinite(value)) return "—"
  const direction = value > 0 ? "↑" : value < 0 ? "↓" : "→"
  return `${direction}${Math.abs(value).toFixed(1)}%`
}

export function cacheTtlStatus(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= 5 * 60_000) return "stale"
  if (elapsed < 3 * 60_000) return "fresh"
  return "aging"
}

export function elapsedSince(timestamp, now) {
  return Number.isFinite(timestamp) && Number.isFinite(now)
    ? Math.max(0, now - timestamp)
    : undefined
}

export function formatElapsed(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) return "—"
  const seconds = Math.floor(elapsed / 1_000)
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`
}

export function formatTokenCount(value) {
  if (!Number.isFinite(value) || value < 0) return "—"
  if (value < 1_000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
  if (value < 1_000_000) {
    const thousands = value / 1_000
    const rounded = thousands >= 10 ? Math.round(thousands) : Number(thousands.toFixed(1))
    return rounded >= 1_000 ? "1m" : `${rounded}k`
  }
  const millions = value / 1_000_000
  const rounded = millions >= 10 ? Math.round(millions) : Number(millions.toFixed(1))
  if (rounded >= 1_000) {
    const billions = value / 1_000_000_000
    return `${billions >= 10 ? Math.round(billions) : Number(billions.toFixed(1))}b`
  }
  return `${rounded}m`
}

export function formatTokenTotal(value) {
  if (!Number.isFinite(value) || value < 0) return "—"
  return formatTokenCount(value).replace(/k$/, "K").replace(/m$/, "M").replace(/b$/, "B")
}

// Ohne gueltigen Wert nur der nackte Platzhalter — die Einheit steht nur bei
// echten Zahlen (Harmonisierung mit dem Skills-Header).
export function formatTokenTotalWithUnit(value) {
  return Number.isFinite(value) && value >= 0 ? `${formatTokenTotal(value)} tok` : "—"
}
