import { transformAsync } from "@babel/core"
import moduleResolver from "babel-plugin-module-resolver"
import solid from "babel-preset-solid"
import ts from "@babel/preset-typescript"
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const sourceDirectory = path.join(root, "src")
const outputDirectory = path.join(root, "dist")

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })

const moduleResolverOptions = {
  resolvePath(sourcePath) {
    if (!sourcePath.startsWith(".")) return null
    if (!/\.(tsx?|mts|cts)$/.test(sourcePath)) return null
    return sourcePath.replace(/\.(tsx?|mts|cts)$/, ".js")
  },
}

const entries = await readdir(sourceDirectory, { withFileTypes: true })

for (const entry of entries) {
  if (!entry.isFile()) continue
  if (/\.test\.[cm]?[jt]s$/.test(entry.name)) continue

  const sourcePath = path.join(sourceDirectory, entry.name)
  const outputPath = path.join(outputDirectory, entry.name.replace(/\.tsx?$/, ".js"))

  if (!/\.(ts|tsx)$/.test(entry.name)) {
    await cp(sourcePath, outputPath)
    continue
  }

  const result = await transformAsync(await readFile(sourcePath, "utf8"), {
    filename: sourcePath,
    configFile: false,
    babelrc: false,
    presets: [
      [solid, { moduleName: "@opentui/solid", generate: "universal" }],
      [ts, { allExtensions: true, isTSX: true }],
    ],
    plugins: [[moduleResolver, moduleResolverOptions]],
  })

  if (!result?.code) throw new Error(`Failed to transform ${entry.name}`)

  await writeFile(outputPath, result.code)
}
