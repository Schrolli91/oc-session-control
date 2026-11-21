import assert from "node:assert/strict"
import test from "node:test"
import {
  countLoadedSkills,
  estimateSkillTokens,
  formatLoadedSkillNames,
  getLoadedSkillOrder,
  getVisibleSkills,
  skillsForDisplay,
  sortSkillsByLoadOrder,
  sumSkillTokens,
} from "./skills.mjs"

test("lists host-visible skills and respects agent and session permission rules", () => {
  const skills = [
    { id: "alpha", name: "Alpha", description: "Visible" },
    { id: "beta", name: "Beta", description: "Denied" },
    { id: "hidden", name: "Hidden", description: "Not discoverable", autoinvoke: false },
    { id: "missing-description", name: "Missing" },
  ]
  assert.deepEqual(
    getVisibleSkills(skills, [
      { action: "skill", resource: "*", effect: "allow" },
      { action: "skill", resource: "beta", effect: "deny" },
    ]).map((skill) => skill.id),
    ["alpha"],
  )
  assert.deepEqual(getVisibleSkills(), [])
})

test("ignores malformed skill permissions", () => {
  assert.deepEqual(
    getVisibleSkills(
      [{ id: "alpha", name: "Alpha", description: "Visible" }],
      [null, { action: "skill", resource: 42, effect: "deny" }],
    ).map((skill) => skill.id),
    ["alpha"],
  )
})

test("ignores malformed message shapes", () => {
  assert.deepEqual(getLoadedSkillOrder([
    null,
    "not a message",
    { type: "assistant", parts: [null, { type: "tool", name: "skill", state: "invalid" }] },
    { type: "user", skills: "invalid" },
    { type: "skill", skill: "valid" },
  ]), ["valid"])
})

test("tracks successful skill loads in order, ignores incomplete loads, and resets at compaction", () => {
  const load = (id, status = "completed", time = 0) => ({
    type: "assistant",
    time: { created: time },
    parts: [{
      type: "tool",
      name: "skill",
      state: {
        status,
        input: { id },
        content: [{ text: '<skill_content name="Test">' }],
      },
    }],
  })
  const messages = [
    load("skill-b", "completed", 2),
    load("skill-a", "completed", 1),
    load("skill-b", "completed", 3),
    load("failed", "error", 4),
    load("running", "running", 5),
    { type: "compaction", status: "completed", time: { created: 6 } },
    { type: "skill", skill: "skill-c", time: { created: 7 } },
  ]
  assert.deepEqual(getLoadedSkillOrder(messages), ["skill-c"])
  assert.deepEqual(getLoadedSkillOrder(messages.slice(0, 5)), ["skill-a", "skill-b"])
  assert.deepEqual(getLoadedSkillOrder([load("subagent-only")]), ["subagent-only"])
})

test("sorts timestamped skill loads while keeping undated entries in place", () => {
  const load = (id, time) => ({
    type: "skill",
    skill: id,
    ...(time === undefined ? {} : { time: { created: time } }),
  })
  assert.deepEqual(getLoadedSkillOrder([
    load("latest", 30),
    load("undated"),
    load("earliest", 10),
    load("middle", 20),
  ]), ["earliest", "undated", "middle", "latest"])
})

test("uses valid skill output when content is malformed and ignores invalid content", () => {
  const load = (id, content, output) => ({
    type: "assistant",
    parts: [{
      type: "tool",
      name: "skill",
      state: { status: "completed", input: { id }, content, output },
    }],
  })
  assert.deepEqual(getLoadedSkillOrder([
    load("valid-output", { text: "invalid content shape" }, [{ text: '<skill_content name="Test">' }]),
    load("invalid-content", { text: "not a skill" }, { text: "not a skill" }),
  ]), ["valid-output"])
})

test("resets skill loads at compaction with mixed timestamped and undated messages", () => {
  const load = (id, time) => ({
    type: "skill",
    skill: id,
    ...(time === undefined ? {} : { time: { created: time } }),
  })
  assert.deepEqual(getLoadedSkillOrder([
    load("after-compaction", 30),
    load("undated-before-compaction"),
    { type: "compaction", status: "completed", time: { created: 20 } },
    load("before-compaction", 10),
  ]), ["after-compaction"])
})

test("sorts loaded skills before catalog-order unloaded skills and formats loaded names", () => {
  const skills = [
    { id: "unloaded-a", name: "Unloaded A" },
    { id: "loaded-b", name: "Loaded B" },
    { id: "unloaded-b", name: "Unloaded B" },
    { id: "loaded-a", name: "Loaded A" },
  ]
  const ordered = sortSkillsByLoadOrder(skills, ["loaded-a", "loaded-b", "missing", "loaded-a"])
  assert.deepEqual(ordered.map((skill) => skill.id), ["loaded-a", "loaded-b", "unloaded-a", "unloaded-b"])
  assert.deepEqual(skillsForDisplay(ordered, new Set(["loaded-a", "loaded-b"]), true).map((skill) => skill.id), ["loaded-a", "loaded-b"])
  assert.deepEqual(skillsForDisplay(ordered, new Set(["loaded-a"]), false), ordered)
  assert.equal(formatLoadedSkillNames(["loaded-a", "missing", "loaded-b"], skills), "Loaded A, missing, Loaded B")
  assert.equal(countLoadedSkills(ordered, new Set(["loaded-a", "hidden"])), 1)
})

test("estimates skill load tokens from UTF-8 bytes and sums loaded skills", () => {
  assert.equal(estimateSkillTokens("a".repeat(5_600)), 1_400)
  assert.equal(estimateSkillTokens("é"), 1)
  assert.equal(estimateSkillTokens("😀"), 1)
  assert.equal(estimateSkillTokens("é😀"), 2)
  assert.equal(estimateSkillTokens(undefined), undefined)
  assert.equal(sumSkillTokens([{ content: "abcd" }, { content: "abcde" }]), 3)
  assert.equal(sumSkillTokens([{ content: "😀" }, { content: "é😀" }]), 3)
  assert.equal(sumSkillTokens([{ content: undefined }]), undefined)
})
