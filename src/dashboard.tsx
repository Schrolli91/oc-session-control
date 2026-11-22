import { createEffect, createMemo, createSignal, For, onCleanup } from "solid-js"
import {
  AgentEntry,
  CollapsibleHeader,
  SectionDivider,
  TokenUsageBar,
  UsageStat,
} from "./dashboard-components.tsx"
import { formatModelDetails } from "./model-details.mjs"
import {
  estimateSkillTokens,
  getLoadedSkillOrder,
  getVisibleSkills,
  skillsForDisplay,
  sortSkillsByLoadOrder,
} from "./skills.mjs"
import { getSessionLocation, truncateAgentTitle } from "./agents.mjs"
import { getThemeColors } from "./theme.mjs"
import { buildDashboardRows, buildDashboardViewModel, sessionIDsForFamily } from "./view-model.mjs"
import { aggregateCosts, buildSessionCostRows, formatTotal } from "./costs.mjs"
import { cacheTtlTimerEligible, clearDashboardTimer, syncDashboardTimer } from "./dashboard-timers.mjs"
import {
  aggregateUsage,
  buildUsageBreakdown,
  cacheHitRate,
  cacheTtlStatus,
  formatElapsed,
  formatPercentage,
  formatPercentageChange,
  formatTokenCount,
  formatTokenTotal,
  formatTokenTotalWithUnit,
  lastCacheCallStats,
} from "./usage.mjs"

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const locationKey = (value) => JSON.stringify([value.directory, value.workspaceID])

export function Dashboard(props) {
  const { context, location, sessionFamily, executingSessionIDs, executionResults, refreshSession, insertSkill } = props
  const sessionID = () => props.sessionID
  const sessionLocation = (id) => getSessionLocation(context.data.session.get(id), location)
  const colors = createMemo(() => getThemeColors(context.theme, context.themeMode))
  const currentSession = createMemo(() => context.data.session.get(sessionID()))
  const skillLocation = createMemo(() => currentSession()?.location ?? location)
  const agents = createMemo(() => context.data.location.agent.list(skillLocation()) ?? [])
  const registeredSkills = createMemo(() => context.data.location.skill.list(skillLocation()) ?? [])
  const visibleSkills = createMemo(() => {
    const agent = currentSession()?.agent === undefined
      ? agents()[0]
      : agents().find((entry) => entry.id === currentSession()?.agent)
    return getVisibleSkills(registeredSkills(), [
      ...(agent?.permissions ?? []),
      ...(currentSession()?.permissions ?? []),
    ])
  })
  const loadedSkillOrder = createMemo(() =>
    getLoadedSkillOrder(context.data.session.message.list(sessionID()) ?? []),
  )
  const loadedSkillIDs = createMemo(() => new Set(loadedSkillOrder()))
  const orderedSkills = createMemo(() => sortSkillsByLoadOrder(visibleSkills(), loadedSkillOrder()))
  const [skillsCollapsed, setSkillsCollapsed] = createSignal(true)
  const [sessionUsageCollapsed, setSessionUsageCollapsed] = createSignal(false)
  const [sessionTotalCollapsed, setSessionTotalCollapsed] = createSignal(false)
  const [cacheCollapsed, setCacheCollapsed] = createSignal(false)
  const displayedSkills = createMemo(() =>
    skillsForDisplay(orderedSkills(), loadedSkillIDs(), skillsCollapsed()),
  )
  const sessionIDs = createMemo(() => {
    const id = sessionID()
    return sessionIDsForFamily(id, sessionFamily(id))
  })
  // The host's cost() helper already rolls the whole family into the root
  // session, so rows and the family total read the raw per-session record instead.
  const ownCost = (id) => context.data.session.get(id)?.cost
  const modelsForSession = (id) => context.data.location.model.list(sessionLocation(id)) ?? []
  const providersForSession = (id) => context.data.location.provider.list(sessionLocation(id)) ?? []
  createEffect(() => {
    const locations = new Map(sessionIDs().map((id) => {
      const targetLocation = sessionLocation(id)
      return [locationKey(targetLocation), targetLocation]
    }))
    void Promise.all([...locations.values()].flatMap((targetLocation) => [
      context.data.location.skill.sync(targetLocation),
      context.data.location.agent.sync(targetLocation),
      context.data.location.model.sync(targetLocation),
      context.data.location.provider.sync(targetLocation),
    ])).catch(() => {})
  })
  const rows = createMemo(() => buildDashboardRows({
    sessionIDs: sessionIDs(),
    getSession: (id) => context.data.session.get(id),
    getCost: (id) => ownCost(id),
    getMessages: (id) => context.data.session.message.list(id),
    getModels: modelsForSession,
    getStatus: (id) => context.data.session.status(id),
    hasPendingQuestion: (id) =>
      (context.data.session.permission.list(id) ?? []).length > 0 ||
      (context.data.session.form.list(id, sessionLocation(id)) ?? []).length > 0,
    isExecuting: (id) => executingSessionIDs().has(id),
    getExecutionResult: (id) => executionResults().get(id),
    skillCatalog: registeredSkills(),
  }))
  const viewModel = createMemo(() => buildDashboardViewModel(rows(), orderedSkills(), loadedSkillIDs()))
  const mainRow = () => viewModel().mainRow
  const subagentRows = () => viewModel().subagentRows
  const subagentIDs = () => viewModel().subagentIDs
  const loadedVisibleSkillCount = () => viewModel().skillSummary.loadedCount
  const loadedVisibleSkillTokens = () => viewModel().skillSummary.loadedTokens
  const usage = createMemo(() => aggregateUsage(
    sessionIDs(),
    (id) => context.data.session.get(id),
    (id) => context.data.session.message.list(id),
    modelsForSession,
  ))
  const usageBreakdown = createMemo(() => usage() ? buildUsageBreakdown(usage()) : undefined)
  const cacheCalls = createMemo(() => lastCacheCallStats(
    sessionIDs(),
    (id) => context.data.session.message.list(id),
  ))
  const [now, setNow] = createSignal(Date.now())
  const cacheAge = () => Number.isFinite(cacheCalls()?.timestamp)
    ? Math.max(0, now() - cacheCalls().timestamp)
    : undefined
  const costs = createMemo(() =>
    aggregateCosts(sessionIDs(), (id) => ownCost(id)),
  )
  const subagentCosts = createMemo(() =>
    aggregateCosts(subagentRows().map((row) => row.sessionID), (id) => ownCost(id)),
  )
  const [spinnerFrame, setSpinnerFrame] = createSignal(0)
  let ttlTimer
  let spinnerTimer
  createEffect(() => {
    ttlTimer = syncDashboardTimer(
      ttlTimer,
      sessionID(),
      cacheTtlTimerEligible(cacheCollapsed(), cacheCalls()?.timestamp),
      () => setNow(Date.now()),
      1_000,
    )
  })
  createEffect(() => {
    spinnerTimer = syncDashboardTimer(
      spinnerTimer,
      sessionID(),
      rows().some((row) => row.status === "working"),
      () => setSpinnerFrame((frame) => (frame + 1) % SPINNER_FRAMES.length),
      90,
    )
  })
  onCleanup(() => {
    clearDashboardTimer(spinnerTimer)
    clearDashboardTimer(ttlTimer)
  })
  const refreshFamily = async (id) => {
    if (!id) return
    await context.data.session.sync(id)
    const ids = sessionIDsForFamily(id, sessionFamily(id))
    await Promise.all(ids.map((familyID) => refreshSession(familyID)))
  }
  createEffect(() => {
    const id = sessionID()
    if (id) void refreshFamily(id).catch(() => {})
  })

  const openModelDetails = (model, modelRef, id) => {
    const provider = providersForSession(id).find((entry) => entry.id === modelRef.providerID)
    void context.ui.dialog.alert({
      title: "Model information",
      message: formatModelDetails(model, modelRef, provider),
    })
  }

  return (
    <box
      width="100%"
      flexDirection="column"
    >
      <CollapsibleHeader
        colors={colors}
        label="Session usage"
        summary={formatTotal(costs())}
        collapsed={sessionUsageCollapsed()}
        onToggle={() => setSessionUsageCollapsed((collapsed) => !collapsed)}
      />
      {!sessionUsageCollapsed() ? (
        <box width="100%" flexDirection="column" paddingLeft={2}>
          <For each={buildSessionCostRows(
            mainRow()?.cost,
            subagentCosts(),
            viewModel().subagentCount,
            usage()?.saved,
          )}>
            {(row) => <UsageStat colors={colors} label={row.label} value={row.value} />}
          </For>
        </box>
      ) : null}
      {usage() ? (
        <box width="100%" flexDirection="column">
          <text> </text>
          <CollapsibleHeader
            colors={colors}
            label="Session Total"
            summary={formatTokenTotalWithUnit(usageBreakdown().sessionTotal)}
            collapsed={sessionTotalCollapsed()}
            onToggle={() => setSessionTotalCollapsed((collapsed) => !collapsed)}
          />
          {!sessionTotalCollapsed() ? (
            <box width="100%" flexDirection="column" paddingLeft={2}>
              <TokenUsageBar segments={[
                { value: usageBreakdown().input.cacheHit, color: colors().usage.input.cacheHit },
                { value: usageBreakdown().input.cacheMiss, color: colors().usage.input.cacheMiss },
                { value: usageBreakdown().input.cacheWrite, color: colors().usage.input.cacheWrite },
              ]} />
              <UsageStat
                colors={colors}
                label="↓ Input"
                value={formatTokenTotalWithUnit(usageBreakdown().input.total)}
                labelColor={colors().text.base}
                valueColor={colors().text.base}
              />
              <box width="100%" flexDirection="column">
                {usageBreakdown().input.cacheHit !== undefined ? (
                  <UsageStat colors={colors} label="Cache Hit" markerColor={colors().usage.input.cacheHit} value={`${formatTokenTotal(usageBreakdown().input.cacheHit)} tok`} />
                ) : null}
                {usageBreakdown().input.cacheMiss !== undefined ? (
                  <UsageStat colors={colors} label="Cache Miss" markerColor={colors().usage.input.cacheMiss} value={`${formatTokenTotal(usageBreakdown().input.cacheMiss)} tok`} />
                ) : null}
                {usageBreakdown().input.cacheWrite !== undefined ? (
                  <UsageStat colors={colors} label="Cache Write" markerColor={colors().usage.input.cacheWrite} value={`${formatTokenTotal(usageBreakdown().input.cacheWrite)} tok`} />
                ) : null}
              </box>
              <TokenUsageBar segments={[
                { value: usageBreakdown().output.reasoning, color: colors().usage.output.reasoning },
                { value: usageBreakdown().output.response, color: colors().usage.output.response },
              ]} />
              <UsageStat
                colors={colors}
                label="↑ Output"
                value={formatTokenTotalWithUnit(usageBreakdown().output.total)}
                labelColor={colors().text.base}
                valueColor={colors().text.base}
              />
              <box width="100%" flexDirection="column">
                {usageBreakdown().output.reasoning !== undefined ? (
                  <UsageStat colors={colors} label="Reasoning" markerColor={colors().usage.output.reasoning} value={`${formatTokenTotal(usageBreakdown().output.reasoning)} tok`} />
                ) : null}
                {usageBreakdown().output.response !== undefined ? (
                  <UsageStat colors={colors} label="Response" markerColor={colors().usage.output.response} value={`${formatTokenTotal(usageBreakdown().output.response)} tok`} />
                ) : null}
              </box>
            </box>
          ) : null}
        </box>
      ) : null}
      {usage() || cacheCalls() ? (
        <box width="100%" flexDirection="column">
          <text> </text>
          <CollapsibleHeader
            colors={colors}
            label="Cache"
            summary={formatPercentage(cacheHitRate(usage()?.input, usage()?.cacheRead, usage()?.cacheWrite))}
            collapsed={cacheCollapsed()}
            onToggle={() => setCacheCollapsed((collapsed) => !collapsed)}
          />
          {!cacheCollapsed() ? (
            <box width="100%" flexDirection="column" paddingLeft={2}>
              <box width="100%" flexDirection="row" justifyContent="space-between">
                <text fg={colors().text.muted}>Last call:</text>
                <box flexDirection="row">
                  <text fg={colors().text.muted}>{formatPercentageChange(cacheCalls()?.change)} </text>
                  <text fg={colors().text.muted}>{formatPercentage(cacheCalls()?.rate)}</text>
                </box>
              </box>
              <box width="100%" flexDirection="row" justifyContent="space-between">
                <text fg={colors().text.muted}>TTL:</text>
                <box flexDirection="row">
                  <text fg={cacheCalls()?.timestamp === undefined
                    ? colors().text.muted
                    : colors().cacheTTL[cacheTtlStatus(cacheAge())]}>●</text>
                  <text fg={colors().text.muted}> {formatElapsed(cacheAge())}</text>
                </box>
              </box>
            </box>
          ) : null}
        </box>
      ) : null}
      {usage() || cacheCalls() ? <text> </text> : null}
      {usage() || cacheCalls() ? <SectionDivider colors={colors} label="Mainagent" /> : null}
      {mainRow() ? <AgentEntry
        row={mainRow()}
        spinnerFrame={spinnerFrame()}
        spinnerFrames={SPINNER_FRAMES}
        colors={colors}
        onModelClick={openModelDetails}
        onSessionClick={(id) => context.ui.router.navigate({ type: "session", sessionID: id })}
      /> : null}
      {orderedSkills().length > 0 ? (
        <box width="100%" flexDirection="column" paddingLeft={2}>
          <CollapsibleHeader
            colors={colors}
            label="Skills"
            detail={` (${loadedVisibleSkillCount()}/${orderedSkills().length})`}
            summary={loadedVisibleSkillTokens() === undefined
              ? "—"
              : `~${formatTokenCount(loadedVisibleSkillTokens())} tok`}
            summaryColor={colors().text.muted}
            collapsed={skillsCollapsed()}
            onToggle={() => setSkillsCollapsed((collapsed) => !collapsed)}
          />
          <For each={displayedSkills()}>
            {(skill) => {
              const tokens = estimateSkillTokens(skill.content)
              const [nameWidth, setNameWidth] = createSignal(1)
              return (
                <box
                  width="100%"
                  flexDirection="row"
                  onMouseDown={(event) => {
                    event.stopPropagation()
                  }}
                  onMouseUp={(event) => {
                    event.stopPropagation()
                    if (event.button === 0) insertSkill(skill, sessionID(), skillLocation())
                  }}
                >
                  <box width={2} flexShrink={0}>
                    <text fg={loadedSkillIDs().has(skill.id) ? colors().skills.loaded : colors().skills.unloaded}>
                      {loadedSkillIDs().has(skill.id) ? "●" : "○"}
                    </text>
                  </box>
                  <box
                    flexBasis={0}
                    flexGrow={1}
                    minWidth={0}
                    overflow="hidden"
                    onSizeChange={function () { setNameWidth(this.width) }}
                  >
                    <text
                      fg={loadedSkillIDs().has(skill.id) ? colors().skills.loaded : colors().skills.unloaded}
                      wrapMode="none"
                    >{truncateAgentTitle(skill.name || skill.id, nameWidth())}</text>
                  </box>
                  <text fg={colors().text.muted} flexShrink={0} wrapMode="none">
                    {` ${tokens === undefined ? "— tok" : `~${formatTokenCount(tokens)} tok`}`}
                  </text>
                </box>
              )
            }}
          </For>
        </box>
      ) : null}
      {subagentIDs().length > 0 ? (
        <box width="100%" flexDirection="column">
          {mainRow() ? <text> </text> : null}
          {mainRow() ? <SectionDivider colors={colors} label={`Subagents (${subagentIDs().length})`} /> : null}
          <For each={subagentIDs()}>
            {(id) => {
              const row = createMemo(() => viewModel().rowBySessionID.get(id))
              return row() ? <AgentEntry
                  row={row()}
                  spinnerFrame={spinnerFrame()}
                  spinnerFrames={SPINNER_FRAMES}
                  colors={colors}
                  onModelClick={openModelDetails}
                  onSessionClick={(sessionID) => context.ui.router.navigate({ type: "session", sessionID })}
                /> : null
            }}
          </For>
        </box>
      ) : null}
    </box>
  )
}
