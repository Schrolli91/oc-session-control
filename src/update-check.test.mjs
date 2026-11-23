import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { checkForUpdate, isNewerVersion, RELEASES_PAGE_URL } from "./update-check.mjs"

const packageVersion = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")).version
const [major, minor, patch] = packageVersion.split(".").map(Number)
const nextPatch = `${major}.${minor}.${patch + 1}`

test("compares stable and prerelease versions using semantic precedence", () => {
  assert.equal(isNewerVersion("1.2.0", "1.1.9"), true)
  assert.equal(isNewerVersion("1.2.0", "1.2.0"), false)
  assert.equal(isNewerVersion("1.2.0-rc.1", "1.2.0-beta.9"), true)
  assert.equal(isNewerVersion("1.2.0", "1.2.0-rc.1"), true)
  assert.equal(isNewerVersion("1.2.0-rc.2", "1.2.0-rc.10"), false)
  assert.equal(isNewerVersion("not-a-version", "1.2.0"), false)
})

test("checks the latest GitHub release against the version in package.json", async () => {
  const result = await checkForUpdate(async (url, { signal, headers }) => {
    assert.equal(url, "https://api.github.com/repos/Schrolli91/oc-session-control/releases/latest")
    assert.ok(signal instanceof AbortSignal)
    assert.equal(headers.Accept, "application/vnd.github+json")
    return { ok: true, json: async () => ({ tag_name: `v${nextPatch}` }) }
  })
  assert.deepEqual(result, { current: packageVersion, latest: nextPatch })
  assert.equal(RELEASES_PAGE_URL, "https://github.com/Schrolli91/oc-session-control/releases")
})

test("does not report an equal, invalid, or failed registry version", async () => {
  assert.equal(await checkForUpdate(async () => ({ ok: true, json: async () => ({ tag_name: `v${packageVersion}` }) })), null)
  assert.equal(await checkForUpdate(async () => ({ ok: true, json: async () => ({ tag_name: "invalid" }) })), null)
  assert.equal(await checkForUpdate(async () => ({ ok: false })), null)
  assert.equal(await checkForUpdate(async () => { throw new Error("offline") }), null)
})

test("aborts a registry request that exceeds its timeout", async () => {
  const result = await checkForUpdate((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })
  }), 5)
  assert.equal(result, null)
})
