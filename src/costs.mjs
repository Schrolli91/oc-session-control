export function aggregateCosts(sessionIDs, getCost) {
  const uniqueIDs = [...new Set(sessionIDs.filter(Boolean))]
  let total = 0
  let known = 0
  let missing = 0

  for (const sessionID of uniqueIDs) {
    const cost = getCost(sessionID)
    if (typeof cost !== "number" || !Number.isFinite(cost)) {
      missing += 1
      continue
    }

    total += cost
    known += 1
  }

  return { total, known, missing }
}

export function formatCost(cost) {
  if (typeof cost !== "number" || !Number.isFinite(cost)) return "unavailable"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(cost)
}

export function formatTotal(summary) {
  if (summary.known === 0) return "unavailable"

  const total = formatCost(summary.total)
  return summary.missing > 0 ? `${total} (partial)` : total
}

export function buildSessionCostRows(mainCost, subagentCosts, subagentCount, saved) {
  const savedRow = {
    label: "Saved (est.):",
    value: saved && saved.known > 0
      ? `~${formatTotal(saved)}`
      : "unavailable",
  }

  if (subagentCount === 0) return [savedRow]

  return [
    { label: "Mainagent:", value: mainCost ?? "unavailable" },
    { label: "Subagents:", value: formatTotal(subagentCosts) },
    savedRow,
  ]
}
