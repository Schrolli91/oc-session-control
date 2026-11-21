export function getModelName(modelRef, models) {
  if (!modelRef) return "unavailable"
  const model = findModel(modelRef, models)
  return model?.name ?? modelRef.id
}

export function findModel(modelRef, models) {
  if (!modelRef || !Array.isArray(models)) return undefined
  return models.find((entry) =>
    entry?.providerID === modelRef.providerID &&
    (entry?.modelID === modelRef.id || entry?.id === modelRef.id),
  )
}

export function getModelCostTiers(model) {
  if (Array.isArray(model?.cost)) return model.cost
  return model?.cost ? [model.cost] : []
}

export function getModelBaseCost(model) {
  const tiers = getModelCostTiers(model)
  return tiers.find((entry) => !entry.tier) ?? tiers[0]
}

export function formatModelRate(value) {
  if (!Number.isFinite(value) || value < 0) return "unavailable"
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value)}/M`
}
