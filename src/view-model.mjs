import {
  buildAgentRows,
  formatContextFill,
  getAgentStatus,
  sortSubagentSessionIDs,
} from "./agents.mjs"
import { findModel } from "./models.mjs"
import { countLoadedSkills, getLoadedSkillOrder, sumSkillTokens } from "./skills.mjs"
import { latestAssistantUsage } from "./usage.mjs"

function contextFillForModel(assistant, model) {
  const tokens = assistant?.tokens
  const limit = model?.limit?.context
  const input = tokens?.input
  const cacheRead = tokens?.cache?.read
  const cacheWrite = tokens?.cache?.write

  if (
    !Number.isFinite(limit) || limit <= 0 ||
    !Number.isFinite(input) || input < 0 ||
    !Number.isFinite(cacheRead) || cacheRead < 0 ||
    !Number.isFinite(cacheWrite) || cacheWrite < 0
  ) return undefined

  const used = input + cacheRead + cacheWrite
  if (!Number.isFinite(used)) return undefined
  return { used, limit, percentage: (used / limit) * 100 }
}

export function sessionIDsForFamily(sessionID, family) {
  return [...new Set([sessionID, ...(Array.isArray(family) ? family : [])]
    .filter((id) => typeof id === "string" && id.length > 0))]
}

export function buildDashboardRows({
  sessionIDs,
  getSession,
  getCost,
  getMessages,
  getModels,
  getStatus,
  hasPendingQuestion,
  isExecuting,
  getExecutionResult,
  skillCatalog = [],
}) {
  return buildAgentRows(sessionIDs, getSession, getCost).map((row) => {
    const messages = getMessages(row.sessionID)
    const loadedSkillOrder = getLoadedSkillOrder(messages)
    const usage = latestAssistantUsage(messages)
    const models = getModels(row.sessionID) ?? []
    const modelRef = usage?.model ?? getSession(row.sessionID)?.model
    const modelInfo = findModel(modelRef, models)
    const fill = contextFillForModel(usage, modelInfo)

    return {
      ...row,
      loadedSkillOrder,
      loadedSkills: loadedSkillOrder,
      skillCatalog,
      modelRef,
      modelInfo,
      modelName: modelRef ? modelInfo?.name ?? modelRef.id : "unavailable",
      status: getAgentStatus(
        getStatus(row.sessionID),
        hasPendingQuestion(row.sessionID),
        isExecuting(row.sessionID),
        getExecutionResult(row.sessionID),
      ),
      context: fill ? formatContextFill(fill) : "unavailable",
      contextPercentage: fill?.percentage,
    }
  })
}

export function buildDashboardViewModel(rows, skills = [], loadedSkillIDs = new Set()) {
  const safeRows = Array.isArray(rows)
    ? rows.filter((row) => row && typeof row.sessionID === "string")
    : []
  const safeSkills = Array.isArray(skills) ? skills : []
  const mainRow = safeRows.find((row) => row.isMain)
  const subagentRows = safeRows.filter((row) => !row.isMain)
  const loadedSkills = safeSkills.filter((skill) => loadedSkillIDs.has(skill.id))
  const rowBySessionID = new Map(safeRows.map((row) => [row.sessionID, row]))

  return {
    mainRow,
    subagentRows,
    rowBySessionID,
    subagentIDs: sortSubagentSessionIDs(subagentRows),
    subagentCount: subagentRows.length,
    skillSummary: {
      loadedCount: countLoadedSkills(safeSkills, loadedSkillIDs),
      totalCount: safeSkills.length,
      loadedTokens: loadedSkills.length ? sumSkillTokens(loadedSkills) : undefined,
    },
  }
}
