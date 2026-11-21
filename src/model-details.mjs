import { formatModelRate, getModelCostTiers } from "./models.mjs"
import { formatTokenTotal } from "./usage.mjs"

export function formatModelDetails(model, modelRef, provider) {
  const details = model ?? {}
  const inputCapabilities = Array.isArray(details.capabilities?.input)
    ? details.capabilities.input.filter((value) => typeof value === "string")
    : []
  const outputCapabilities = Array.isArray(details.capabilities?.output)
    ? details.capabilities.output.filter((value) => typeof value === "string")
    : []
  const capabilities = [
    ...inputCapabilities.map((value) => `Input ${value}`),
    ...outputCapabilities.map((value) => `Output ${value}`),
    details.capabilities?.tools === true ? "Tools" : undefined,
  ].filter(Boolean).join(" · ")
  const detailRow = (label, value) => `${label.padEnd(19)}${value}`
  const rateRows = getModelCostTiers(model).flatMap((cost) => [
    ...(cost.tier?.type === "context" ? [`Context > ${formatTokenTotal(cost.tier.size)} tok`] : []),
    detailRow("  ↑ Input:", formatModelRate(cost.input)),
    detailRow("  ↻ Cached input:", formatModelRate(cost.cache?.read)),
    detailRow("  + Cache writes:", formatModelRate(cost.cache?.write)),
    detailRow("  ↓ Output:", formatModelRate(cost.output)),
  ])

  if (rateRows.length === 0) {
    rateRows.push(
      detailRow("  ↑ Input:", "unavailable"),
      detailRow("  ↻ Cached input:", "unavailable"),
      detailRow("  + Cache writes:", "unavailable"),
      detailRow("  ↓ Output:", "unavailable"),
    )
  }

  return [
    detailRow("Name:", details.name ?? modelRef.id),
    detailRow("Model:", `${details.modelID ?? modelRef.id} #${modelRef.variant ?? "default"}`),
    detailRow("Provider:", `${provider?.name ?? modelRef.providerID} · ${modelRef.providerID}`),
    detailRow(
      "Limits:",
      `↕${formatTokenTotal(details.limit?.context)} ↑${formatTokenTotal(details.limit?.input)} ↓${formatTokenTotal(details.limit?.output)}`,
    ),
    ...(details.family ? [detailRow("Family:", details.family)] : []),
    ...(details.type || capabilities
      ? [detailRow("Capabilities:", [details.type, capabilities].filter(Boolean).join(" · "))]
      : []),
    "",
    "Rate:",
    ...rateRows,
  ].join("\n")
}
