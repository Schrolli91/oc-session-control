const isColor = (value) => (typeof value === "string" && /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) ||
  (value !== null && typeof value === "object" && typeof value.toInts === "function")

const palettes = {
  dark: {
    text: { base: "#FFFFFF", muted: "#8B949E", faint: "#6E7681" },
    agentStatus: {
      working: "#58A6FF",
      complete: "#3FB950",
      question: "#D29922",
      aborted: "#D29922",
      error: "#F85149",
      idle: "#8B949E",
    },
    usage: {
      input: { cacheHit: "#79df86", cacheMiss: "#fa736c", cacheWrite: "#f8f188" },
      output: { reasoning: "#BC8CFF", response: "#58A6FF" },
    },
    contextFill: { green: "#79df86", yellow: "#f8f188", orange: "#ff9e59", red: "#fa736c" },
    cacheTTL: { fresh: "#79df86", aging: "#f8f188", stale: "#fa736c" },
    skills: { loaded: "#58A6FF", unloaded: "#8B949E" },
  },
  light: {
    text: { base: "#24292F", muted: "#57606A", faint: "#6E7781" },
    agentStatus: {
      working: "#0969DA",
      complete: "#1A7F37",
      question: "#9A6700",
      aborted: "#9A6700",
      error: "#CF222E",
      idle: "#6E7781",
    },
    usage: {
      input: { cacheHit: "#1A7F37", cacheMiss: "#CF222E", cacheWrite: "#9A6700" },
      output: { reasoning: "#8250DF", response: "#0969DA" },
    },
    contextFill: { green: "#1A7F37", yellow: "#9A6700", orange: "#BC4C00", red: "#CF222E" },
    cacheTTL: { fresh: "#1A7F37", aging: "#9A6700", stale: "#CF222E" },
    skills: { loaded: "#0969DA", unloaded: "#6E7781" },
  },
}

export function getThemeColors(theme, mode) {
  const hostText = theme?.text ?? {}
  const light = mode === "light"
  const palette = palettes[light ? "light" : "dark"]

  return {
    ...palette,
    text: {
      base: isColor(hostText.base) ? hostText.base : palette.text.base,
      muted: isColor(hostText.muted) ? hostText.muted : palette.text.muted,
      faint: isColor(hostText.faint) ? hostText.faint : palette.text.faint,
    },
  }
}

export function contextFillColor(percentage, colorMap) {
  if (percentage < 30) return colorMap.contextFill.green
  if (percentage < 50) return colorMap.contextFill.yellow
  if (percentage < 70) return colorMap.contextFill.orange
  return colorMap.contextFill.red
}
