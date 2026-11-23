import { readFile } from "node:fs/promises"

const RELEASES_API_URL = "https://api.github.com/repos/Schrolli91/oc-session-control/releases/latest"
export const RELEASES_PAGE_URL = "https://github.com/Schrolli91/oc-session-control/releases"
const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

const parseVersion = (version) => {
  if (typeof version !== "string") return undefined
  const match = VERSION_PATTERN.exec(version)
  if (!match) return undefined
  const prerelease = match[4]?.split(".") ?? []
  if (prerelease.some((part) => /^\d+$/.test(part) && part.length > 1 && part.startsWith("0"))) return undefined
  return { core: match.slice(1, 4), prerelease }
}

const compareNumeric = (left, right) =>
  left.length === right.length ? (left === right ? 0 : left < right ? -1 : 1) : left.length < right.length ? -1 : 1

const compareVersions = (left, right) => {
  const a = parseVersion(left)
  const b = parseVersion(right)
  if (!a || !b) return Number.NaN
  for (let index = 0; index < a.core.length; index += 1) {
    const result = compareNumeric(a.core[index], b.core[index])
    if (result) return result
  }
  if (!a.prerelease.length) return b.prerelease.length ? 1 : 0
  if (!b.prerelease.length) return -1
  for (let index = 0; index < Math.max(a.prerelease.length, b.prerelease.length); index += 1) {
    const leftPart = a.prerelease[index]
    const rightPart = b.prerelease[index]
    if (leftPart === undefined) return -1
    if (rightPart === undefined) return 1
    const leftNumeric = /^\d+$/.test(leftPart)
    const rightNumeric = /^\d+$/.test(rightPart)
    if (leftNumeric && rightNumeric) {
      const result = compareNumeric(leftPart, rightPart)
      if (result) return result
    } else if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1
    } else if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1
    }
  }
  return 0
}

export const isNewerVersion = (candidate, current) => compareVersions(candidate, current) > 0

export async function checkForUpdate(fetcher = globalThis.fetch, timeoutMs = 5_000) {
  let timer
  try {
    if (typeof fetcher !== "function") return null
    const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"))
    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetcher(RELEASES_API_URL, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    })
    if (!response?.ok) return null
    const metadata = await response.json()
    const latest = typeof metadata?.tag_name === "string" ? metadata.tag_name.replace(/^v/, "") : undefined
    return isNewerVersion(latest, manifest.version)
      ? { current: manifest.version, latest }
      : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
