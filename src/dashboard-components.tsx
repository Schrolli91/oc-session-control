import { TextAttributes } from "@opentui/core"
import { createMemo, createSignal, For } from "solid-js"
import { formatLoadedSkillNames } from "./skills.mjs"
import { contextFillColor, truncateAgentTitle } from "./agents.mjs"
import { usageBarWidths } from "./usage.mjs"

const statusIcons = { question: "?", complete: "✓", aborted: "●", error: "×", idle: "●" }

function BarLegend(props) {
  return (
    <box width="100%" flexDirection="row" flexWrap="wrap">
      <For each={props.items}>
        {(item) => (
          <box flexDirection="row">
            <text fg={item.color}>■</text>
            <text fg={props.colors().text.muted}> {item.label} </text>
          </box>
        )}
      </For>
    </box>
  )
}

export function UsageStat(props) {
  return (
    <box width="100%" flexDirection="row" justifyContent="space-between">
      <box flexDirection="row">
        {props.markerColor ? <text fg={props.markerColor}>■ </text> : null}
        <text fg={props.labelColor ?? props.colors().text.muted}>{props.label}</text>
      </box>
      <text fg={props.valueColor ?? props.colors().text.muted} wrapMode="none">{props.value}</text>
    </box>
  )
}

export function CollapsibleHeader(props) {
  return (
    <box
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      onMouseDown={(event) => {
        event.stopPropagation()
      }}
      onMouseUp={(event) => {
        event.stopPropagation()
        if (event.button === 0) props.onToggle()
      }}
    >
      <box flexDirection="row" flexBasis={0} flexGrow={1} minWidth={0} overflow="hidden">
        <text fg={props.colors().text.muted}>{props.collapsed ? "▸ " : "▾ "}</text>
        <text
          fg={props.colors().text.base}
          wrapMode="none"
        >{props.label}</text>
        {props.detail ? <text fg={props.colors().text.muted} wrapMode="none">{props.detail}</text> : null}
      </box>
      {props.summary !== undefined ? (
        <text fg={props.summaryColor ?? props.colors().text.base} flexShrink={0} wrapMode="none">
          {props.summary}
        </text>
      ) : null}
    </box>
  )
}

export function TokenUsageBar(props) {
  const [width, setWidth] = createSignal(0)
  const widths = createMemo(() => usageBarWidths(
    props.segments.map((segment) => segment.value),
    width(),
  ))
  return (
    <box
      width="100%"
      height={1}
      flexDirection="row"
      overflow="hidden"
      onSizeChange={function () { setWidth(this.width) }}
    >
      <For each={widths()}>
        {(segmentWidth, index) => (
          <box width={segmentWidth} minWidth={0} height={1} overflow="hidden">
            <text fg={props.segments[index()].color} attributes={props.segments[index()].attributes} wrapMode="none">{"━".repeat(segmentWidth)}</text>
          </box>
        )}
      </For>
    </box>
  )
}

export function SectionDivider(props) {
  const [width, setWidth] = createSignal(0)
  const contentWidth = () => (props.icon?.length ? props.icon.length + 1 : 0) + (props.label?.length ?? 0)
  const hasLabel = () => width() >= contentWidth() + 2
  const labelWidth = () => hasLabel() ? contentWidth() + 2 : 0
  const leftWidth = () => Math.max(0, Math.floor((width() - labelWidth()) / 2))
  const rightWidth = () => Math.max(0, width() - leftWidth() - labelWidth())
  return (
    <box
      width="100%"
      height={1}
      flexDirection="row"
      justifyContent="center"
      overflow="hidden"
      onSizeChange={function () { setWidth(this.width) }}
    >
      <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none">{"─".repeat(leftWidth())}</text>
      {hasLabel() ? (
        <>
          <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none"> </text>
          {props.icon ? <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none">{props.icon}</text> : null}
          {props.icon ? <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none"> </text> : null}
          <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none">{props.label}</text>
          <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none"> </text>
        </>
      ) : null}
      <text fg={props.colors().text.faint} attributes={TextAttributes.DIM} wrapMode="none">{"─".repeat(rightWidth())}</text>
    </box>
  )
}

export function AgentEntry(props) {
  const row = () => props.row
  const colors = () => props.colors()
  const [titleWidth, setTitleWidth] = createSignal(1)
  const contextFill = () => row().contextPercentage
  const contextBarFill = () => Math.min(100, Math.max(0, contextFill() ?? 0))
  const contextColor = () => contextFillColor(contextFill(), colors())
  return (
    <box
      width="100%"
      flexDirection="column"
      onMouseDown={(event) => {
        if (!row().isMain && event.button === 0) props.onSessionClick(row().sessionID)
      }}
    >
      <box width="100%" flexDirection="row" justifyContent="space-between">
        <box flexDirection="row" flexBasis={0} flexGrow={1} minWidth={0}>
          <box width={2} flexShrink={0}>
            <text fg={colors().agentStatus[row().status]}>
              {row().status === "working" ? props.spinnerFrames[props.spinnerFrame] : statusIcons[row().status]}
            </text>
          </box>
          <box
            flexBasis={0}
            flexGrow={1}
            minWidth={0}
            overflow="hidden"
            onSizeChange={function () { setTitleWidth(this.width) }}
          >
            <text
              fg={colors().text.base}
              wrapMode="none"
            >
              {truncateAgentTitle(row().label, titleWidth() - 1)}
            </text>
          </box>
        </box>
        <text fg={row().cost === "unavailable" ? colors().text.muted : colors().cost} flexShrink={0}>{row().cost}</text>
      </box>
      <box width="100%" flexDirection="row" justifyContent="space-between" paddingLeft={2}>
        <text fg={colors().text.muted} flexShrink={0}>Model:</text>
        <text
          fg={colors().text.muted}
          wrapMode="none"
          attributes={row().modelRef ? TextAttributes.UNDERLINE : TextAttributes.NONE}
          onMouseDown={(event) => event.stopPropagation()}
          onMouseUp={(event) => {
            event.stopPropagation()
            if (event.button === 0 && row().modelRef) {
              props.onModelClick(row().modelInfo, row().modelRef, row().sessionID)
            }
          }}
        >{row().modelName}</text>
      </box>
      <box width="100%" flexDirection="row" justifyContent="space-between" paddingLeft={2}>
        {row().contextPercentage !== undefined ? (
          <>
            <text fg={colors().text.muted}>Context: {row().contextPercentage.toFixed(1)}%</text>
            <text fg={colors().text.muted}>{row().context}</text>
          </>
        ) : (
          <text fg={colors().text.muted}>Context: unavailable</text>
        )}
      </box>
      {!row().isMain && row().loadedSkills.length > 0 ? (
        <box
          width="100%"
          paddingLeft={2}
          onMouseDown={(event) => event.stopPropagation()}
          onMouseUp={(event) => event.stopPropagation()}
        >
          <text fg={colors().text.muted} wrapMode="char">
            Skills: {formatLoadedSkillNames(row().loadedSkillOrder, row().skillCatalog)}
          </text>
        </box>
      ) : null}
      {row().isMain && contextFill() !== undefined ? (
        <box width="100%" flexDirection="column" paddingLeft={2}>
          <TokenUsageBar segments={[
            { value: contextBarFill(), color: contextColor() },
            { value: 100 - contextBarFill(), color: colors().text.faint, attributes: TextAttributes.DIM },
          ]} />
          <BarLegend items={[
            { color: colors().contextFill.green, label: "<30%" },
            { color: colors().contextFill.yellow, label: "<50%" },
            { color: colors().contextFill.orange, label: "<70%" },
            { color: colors().contextFill.red, label: "≥70%" },
          ]} colors={props.colors} />
        </box>
      ) : null}
    </box>
  )
}
