export function cacheTtlTimerEligible(collapsed, timestamp) {
  return !collapsed && Number.isFinite(timestamp)
}

export function syncDashboardTimer(timer, scope, eligible, callback, delay) {
  if (timer && (!eligible || timer.scope !== scope)) {
    clearInterval(timer.handle)
    timer = undefined
  }
  if (eligible && !timer) timer = { scope, handle: setInterval(callback, delay) }
  return timer
}

export function clearDashboardTimer(timer) {
  if (timer) clearInterval(timer.handle)
}
