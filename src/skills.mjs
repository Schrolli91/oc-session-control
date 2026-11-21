function matches(value, pattern) {
  if (typeof value !== "string" || typeof pattern !== "string") return false
  const expression = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".")
  return new RegExp(`^${expression}$`, "s").test(value)
}

export function getVisibleSkills(skills = [], permissions = []) {
  const visible = new Map()
  const rules = (Array.isArray(permissions) ? permissions : []).slice().reverse()
  for (const skill of Array.isArray(skills) ? skills : []) {
    if (
      typeof skill?.id !== "string" || !skill.id ||
      typeof skill.description !== "string" ||
      skill.autoinvoke === false
    ) continue
    const permission = rules.find((rule) =>
      matches("skill", rule?.action) && matches(skill.id, rule?.resource),
    )
    if (permission?.effect === "deny") continue
    if (!visible.has(skill.id)) visible.set(skill.id, skill)
  }
  return [...visible.values()]
}

function messageType(message) {
  return message?.type ?? message?.info?.type
}

function messageParts(message) {
  if (Array.isArray(message?.parts)) return message.parts
  if (Array.isArray(message?.content)) return message.content
  return []
}

function skillContent(value) {
  if (typeof value === "string") return value.includes("<skill_content name=\"")
  return Array.isArray(value) && value.some((part) =>
    typeof part?.text === "string" && part.text.startsWith('<skill_content name="'),
  )
}

function skillIDsFromMessage(message) {
  const type = messageType(message)
  if (type === "assistant") {
    const ids = []
    for (const part of messageParts(message)) {
      const state = part?.state
      if (
        part?.type !== "tool" || (part.name ?? part.tool) !== "skill" ||
        state?.status !== "completed" ||
        (!skillContent(state.content) && !skillContent(state.output))
      ) continue
      const id = state.input?.id ?? state.input?.name
      if (typeof id === "string" && id) ids.push(id)
    }
    return ids
  }
  if (type === "skill") {
    const id = message.skill ?? message.info?.skill
    return typeof id === "string" && id ? [id] : []
  }
  if (type === "user") {
    const skills = message.skills ?? message.info?.skills
    return (Array.isArray(skills) ? skills : [])
      .map((skill) => skill?.id ?? skill?.name)
      .filter((id) => typeof id === "string" && id)
  }
  return []
}

function messageTime(message) {
  for (const value of [
    message?.time?.created,
    message?.time?.completed,
    message?.info?.time?.created,
    message?.info?.time?.completed,
  ]) {
    if (Number.isFinite(value)) return value
    if (typeof value === "string") {
      const parsed = Date.parse(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

export function getLoadedSkillOrder(messages = []) {
  const ordered = (Array.isArray(messages) ? messages : [])
    .map((message, index) => ({ message, index, time: messageTime(message) }))
  const timestamped = ordered
    .filter((entry) => Number.isFinite(entry.time))
    .sort((left, right) => left.time - right.time || left.index - right.index)
  let timestampedIndex = 0
  for (let index = 0; index < ordered.length; index++) {
    if (!Number.isFinite(ordered[index].time)) continue
    ordered[index] = timestamped[timestampedIndex++]
  }

  const ids = []
  const seen = new Set()
  for (const { message } of ordered) {
    if (messageType(message) === "compaction" && (message?.status ?? message?.info?.status) === "completed") {
      ids.length = 0
      seen.clear()
      continue
    }
    for (const id of skillIDsFromMessage(message)) {
      if (seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}

export function sortSkillsByLoadOrder(skills = [], loadedOrder = []) {
  const byID = new Map(skills.map((skill) => [skill.id, skill]))
  const loaded = []
  const seen = new Set()
  for (const id of loadedOrder) {
    const skill = byID.get(id)
    if (!skill || seen.has(id)) continue
    seen.add(id)
    loaded.push(skill)
  }
  return [...loaded, ...skills.filter((skill) => !seen.has(skill.id))]
}

export function countLoadedSkills(skills = [], loadedIDs = new Set()) {
  return skills.reduce((count, skill) => count + Number(loadedIDs.has(skill.id)), 0)
}

export function skillsForDisplay(skills = [], loadedIDs = new Set(), collapsed = false) {
  return collapsed ? skills.filter((skill) => loadedIDs.has(skill.id)) : skills
}

export function estimateSkillTokens(content) {
  return typeof content === "string" ? Math.ceil(Buffer.byteLength(content, "utf8") / 4) : undefined
}

export function sumSkillTokens(skills = []) {
  let total = 0
  for (const skill of skills) {
    const tokens = estimateSkillTokens(skill.content)
    if (tokens === undefined) return undefined
    total += tokens
  }
  return total
}

export function loadedSkillNames(loadedOrder = [], skills = []) {
  const byID = new Map(skills.map((skill) => [skill.id, skill]))
  return loadedOrder.map((id) => byID.get(id)?.name ?? byID.get(id)?.id ?? id)
}

export function formatLoadedSkillNames(loadedOrder = [], skills = []) {
  return loadedSkillNames(loadedOrder, skills).join(", ")
}
