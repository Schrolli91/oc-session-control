import stringWidth from "string-width"
import { formatCost } from "./costs.mjs"
import { findModel } from "./models.mjs"
import { formatTokenCount, formatTokenTotal } from "./usage.mjs"
export { contextFillColor, getThemeColors } from "./theme.mjs"

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" })

export function buildAgentRows(sessionIDs, getSession, getCost) {
  const uniqueIDs = [...new Set(sessionIDs.filter(Boolean))]

  return uniqueIDs.map((sessionID, index) => {
    const session = getSession(sessionID)
    const detail = (typeof session?.title === "string" && session.title) ||
      (typeof session?.agent === "string" && session.agent) || sessionID
    return {
      sessionID,
      label: detail,
      isMain: index === 0,
      cost: formatCost(getCost(sessionID)),
    }
  })
}

export function sortSubagentsByActivity(rows) {
  const priority = { question: 0, working: 1, error: 2, complete: 3, aborted: 4, idle: 5 }
  return [...rows].sort((a, b) => (priority[a?.status] ?? 6) - (priority[b?.status] ?? 6))
}

export function sortSubagentSessionIDs(rows) {
  return sortSubagentsByActivity(rows).map((row) => row.sessionID)
}

export function truncateAgentTitle(title, width) {
  if (typeof title !== "string" || !Number.isFinite(width) || width < 1) return ""
  const limit = Math.floor(width)
  if (stringWidth(title) <= limit) return title

  const ellipsis = "…"
  const titleWidth = limit - stringWidth(ellipsis)
  let result = ""
  let resultWidth = 0
  for (const { segment } of graphemes.segment(title)) {
    const segmentWidth = stringWidth(segment)
    if (resultWidth + segmentWidth > titleWidth) break
    result += segment
    resultWidth += segmentWidth
  }
  return `${result}${ellipsis}`
}

export function familyEventSessionIDs(familyIDs, event) {
  const affected = new Set(Array.isArray(familyIDs) ? familyIDs : [])
  const data = event?.data
  if (!data) return []
  const sessionID = data.sessionID ?? data.form?.sessionID

  if (affected.has(sessionID)) return [sessionID]
  if (data.parentID && affected.has(data.parentID) && sessionID) {
    return [data.parentID, sessionID]
  }
  return []
}

export function getSessionLocation(session, fallback) {
  return session?.location ?? fallback
}

export function getAgentStatus(status, waitingForInput, isExecuting = false, result) {
  if (waitingForInput) return "question"
  if (isExecuting || status === "running" || status?.type === "busy" || status?.type === "retry") {
    return "working"
  }
  if (result === "success") return "complete"
  if (result === "aborted") return "aborted"
  if (result === "error") return "error"
  return "idle"
}

export function getContextFill(assistant, models) {
  const tokens = assistant?.tokens
  const modelRef = assistant?.model
  if (!tokens || !modelRef) return undefined

  const model = findModel(modelRef, models)
  const limit = model?.limit?.context
  const input = tokens.input
  const cacheRead = tokens.cache?.read
  const cacheWrite = tokens.cache?.write

  if (
    !Number.isFinite(limit) || limit <= 0 ||
    !Number.isFinite(input) || input < 0 ||
    !Number.isFinite(cacheRead) || cacheRead < 0 ||
    !Number.isFinite(cacheWrite) || cacheWrite < 0
  ) {
    return undefined
  }

  const used = input + cacheRead + cacheWrite
  if (!Number.isFinite(used)) return undefined
  return { used, limit, percentage: (used / limit) * 100 }
}

export function formatContextFill(fill) {
  if (!fill) return "unavailable"

  return `${formatContextUsed(fill.used)} / ${formatTokenTotal(fill.limit)} tok`
}

function formatContextUsed(value) {
  if (!Number.isFinite(value) || value < 0 || value < 1_000) return formatTokenCount(value)

  const thousands = Number((value / 1_000).toFixed(1))
  if (thousands < 1_000) return `${thousands.toFixed(1)}k`

  const millions = Number((value / 1_000_000).toFixed(1))
  if (millions < 1_000) return `${millions.toFixed(1)}m`

  return `${(value / 1_000_000_000).toFixed(1)}b`
}
