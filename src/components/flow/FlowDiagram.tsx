/**
 * FlowDiagram -- visual diagram showing how the four financial
 * statements connect to each other with SVG curved arrows
 * and numbered connection badges.
 *
 * Layout (2×2 grid):
 *   Income Statement  ──→  Balance Sheet
 *        │                      ↑↓
 *        ↓                      │
 *   Equity Statement  ←──  Cash Flow Statement
 *
 * Uses refs to measure box positions and draws accurate SVG
 * curved arrows between the correct edges of each box.
 *
 * Animation: Play/Replay button reveals arrows one by one with
 * configurable speed. Shows how data flows step by step.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useStatements } from '../../hooks/useStatements'
import { useLedgerStore } from '../../store/ledgerStore'
import { formatCurrency } from '../shared/FormatCurrency'
import StatementPanel from '../statements/StatementPanel'

// ── Connection definitions ────────────────────────────────────────

interface ConnectionDef {
  number: number
  title: string
  label: string
  from: 'IS' | 'BS' | 'EQ' | 'CF'
  to: 'IS' | 'BS' | 'EQ' | 'CF'
  color: string
  /** Which edge of the "from" box the arrow starts from */
  fromEdge: 'right' | 'bottom' | 'left' | 'top'
  /** Which edge of the "to" box the arrow ends at */
  toEdge: 'left' | 'top' | 'right' | 'bottom'
}

const CONNECTIONS: ConnectionDef[] = [
  {
    number: 1,
    title: 'Net Income → Retained Earnings',
    label: 'Net Income from the Income Statement flows into Retained Earnings on the Balance Sheet, representing accumulated profits.',
    from: 'IS',
    to: 'BS',
    color: '#2D6A4F',
    fromEdge: 'right',
    toEdge: 'left',
  },
  {
    number: 2,
    title: 'Net Income (starting point)',
    label: 'The Cash Flow Statement (indirect method) starts with Net Income and adjusts for non-cash items.',
    from: 'IS',
    to: 'CF',
    color: '#B03A2E',
    fromEdge: 'bottom',
    toEdge: 'left',
  },
  {
    number: 3,
    title: 'Working Capital Changes',
    label: 'Changes in working capital accounts (AR, AP, Inventory) on the Balance Sheet affect Operating Cash Flow.',
    from: 'BS',
    to: 'CF',
    color: '#2563EB',
    fromEdge: 'bottom',
    toEdge: 'top',
  },
  {
    number: 4,
    title: 'Ending Cash',
    label: 'The ending cash balance from the Cash Flow Statement matches Cash on the Balance Sheet.',
    from: 'CF',
    to: 'BS',
    color: '#D97706',
    fromEdge: 'top',
    toEdge: 'bottom',
  },
  {
    number: 5,
    title: 'Net Income → Equity',
    label: 'Net Income flows into Retained Earnings in the Statement of Equity.',
    from: 'IS',
    to: 'EQ',
    color: '#2D6A4F',
    fromEdge: 'bottom',
    toEdge: 'top',
  },
  {
    number: 6,
    title: 'Total Equity',
    label: 'Total Equity from the Equity Statement flows to the Balance Sheet equity section.',
    from: 'EQ',
    to: 'BS',
    color: '#7C3AED',
    fromEdge: 'right',
    toEdge: 'bottom',
  },
  {
    number: 7,
    title: 'Dividends Paid',
    label: 'Dividends paid (from financing activities) reduce Retained Earnings in the Equity Statement.',
    from: 'CF',
    to: 'EQ',
    color: '#D97706',
    fromEdge: 'left',
    toEdge: 'right',
  },
]

// ── Color config ──────────────────────────────────────────────────

const COLORS: Record<string, { color: string; bg: string }> = {
  IS: { color: '#2D6A4F', bg: '#EAFAF1' },
  BS: { color: '#2563EB', bg: '#EBF5FB' },
  EQ: { color: '#7C3AED', bg: '#F4ECF7' },
  CF: { color: '#D97706', bg: '#FEF5E7' },
}

// ── Animation speed presets ──────────────────────────────────────

const ANIM_SPEEDS = [
  { label: '0.5×', ms: 4000 },
  { label: '1×', ms: 2000 },
  { label: '1.5×', ms: 1200 },
  { label: '2×', ms: 800 },
] as const

// ── Relative rect helper ─────────────────────────────────────────

interface RelRect {
  left: number
  top: number
  right: number
  bottom: number
  cx: number
  cy: number
  width: number
  height: number
}

function relativeRect(el: HTMLElement, container: HTMLElement): RelRect {
  const c = container.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return {
    left: r.left - c.left,
    top: r.top - c.top,
    right: r.right - c.left,
    bottom: r.bottom - c.top,
    cx: r.left - c.left + r.width / 2,
    cy: r.top - c.top + r.height / 2,
    width: r.width,
    height: r.height,
  }
}

function edgePoint(
  rect: RelRect,
  edge: 'top' | 'bottom' | 'left' | 'right',
  offset = 0,
): { x: number; y: number } {
  switch (edge) {
    case 'top':
      return { x: rect.cx + offset, y: rect.top }
    case 'bottom':
      return { x: rect.cx + offset, y: rect.bottom }
    case 'left':
      return { x: rect.left, y: rect.cy + offset }
    case 'right':
      return { x: rect.right, y: rect.cy + offset }
  }
}

// ── FlowBox component ─────────────────────────────────────────────

const FlowBox = ({
  title,
  color,
  bgColor,
  lines,
  scale,
  boxRef,
}: {
  title: string
  color: string
  bgColor: string
  lines: { label: string; value: number }[]
  scale: 'ones' | 'millions'
  boxRef: React.RefObject<HTMLDivElement | null>
}) => (
  <div
    ref={boxRef}
    className="rounded-lg p-4 relative z-10"
    style={{
      background: bgColor,
      border: `2px solid ${color}40`,
      borderTop: `4px solid ${color}`,
    }}
  >
    <h3
      className="text-sm font-bold mb-3"
      style={{ color, fontFamily: 'var(--font-display)' }}
    >
      {title}
    </h3>
    <div className="space-y-1.5">
      {lines.map((line) => (
        <div
          key={line.label}
          className="flex items-center justify-between text-xs"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span style={{ color: 'var(--color-text)' }}>{line.label}</span>
          <span
            className="font-semibold ml-2"
            style={{ color: line.value < 0 ? '#DC2626' : 'var(--color-text)' }}
          >
            {formatCurrency(line.value, scale)}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// ── SVG Arrow with curve and arrowhead ────────────────────────────

interface ArrowData {
  conn: ConnectionDef
  path: string
  midX: number
  midY: number
}

function buildCurvePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEdge: string,
  toEdge: string,
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y

  // Determine control point offsets based on edge directions
  let cp1x = from.x
  let cp1y = from.y
  let cp2x = to.x
  let cp2y = to.y

  const curvature = 0.55

  // From edge determines initial direction
  switch (fromEdge) {
    case 'right':
      cp1x = from.x + Math.abs(dx) * curvature
      break
    case 'left':
      cp1x = from.x - Math.abs(dx) * curvature
      break
    case 'bottom':
      cp1y = from.y + Math.abs(dy) * curvature
      break
    case 'top':
      cp1y = from.y - Math.abs(dy) * curvature
      break
  }

  // To edge determines arrival direction
  switch (toEdge) {
    case 'left':
      cp2x = to.x - Math.abs(dx) * curvature
      break
    case 'right':
      cp2x = to.x + Math.abs(dx) * curvature
      break
    case 'top':
      cp2y = to.y - Math.abs(dy) * curvature
      break
    case 'bottom':
      cp2y = to.y + Math.abs(dy) * curvature
      break
  }

  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`
}

function pathMidpoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEdge: string,
  toEdge: string,
): { x: number; y: number } {
  // Approximate midpoint of the bezier curve using t=0.5
  const dx = to.x - from.x
  const dy = to.y - from.y
  const curvature = 0.55

  let cp1x = from.x, cp1y = from.y, cp2x = to.x, cp2y = to.y

  switch (fromEdge) {
    case 'right': cp1x = from.x + Math.abs(dx) * curvature; break
    case 'left': cp1x = from.x - Math.abs(dx) * curvature; break
    case 'bottom': cp1y = from.y + Math.abs(dy) * curvature; break
    case 'top': cp1y = from.y - Math.abs(dy) * curvature; break
  }
  switch (toEdge) {
    case 'left': cp2x = to.x - Math.abs(dx) * curvature; break
    case 'right': cp2x = to.x + Math.abs(dx) * curvature; break
    case 'top': cp2y = to.y - Math.abs(dy) * curvature; break
    case 'bottom': cp2y = to.y + Math.abs(dy) * curvature; break
  }

  // Cubic bezier at t=0.5
  const t = 0.5
  const mt = 1 - t
  const x = mt * mt * mt * from.x + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * to.x
  const y = mt * mt * mt * from.y + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * to.y

  return { x, y }
}

// ── Legend ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div
      className="mt-4 rounded-lg p-5"
      style={{
        background: 'var(--color-base)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CONNECTIONS.map((c) => (
          <div key={c.number} className="flex items-start gap-3">
            <span
              className="inline-flex items-center justify-center shrink-0 mt-0.5"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c.color,
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {c.number}
            </span>
            <div>
              <div
                className="font-bold text-sm mb-0.5"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text)',
                }}
              >
                {c.title}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.6,
                }}
              >
                {c.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function FlowDiagram() {
  const { balanceSheet, incomeStatement, cashFlowStatement, equityStatement } =
    useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')

  const containerRef = useRef<HTMLDivElement>(null)
  const isRef = useRef<HTMLDivElement>(null)
  const bsRef = useRef<HTMLDivElement>(null)
  const eqRef = useRef<HTMLDivElement>(null)
  const cfRef = useRef<HTMLDivElement>(null)

  const [arrows, setArrows] = useState<ArrowData[]>([])
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [hoveredArrow, setHoveredArrow] = useState<number | null>(null)

  // ── Animation state ──
  /** How many arrows are currently visible (0 = none shown, CONNECTIONS.length = all shown) */
  const [visibleCount, setVisibleCount] = useState(CONNECTIONS.length)
  /** Whether animation is currently playing */
  const [isPlaying, setIsPlaying] = useState(false)
  /** Speed index into ANIM_SPEEDS */
  const [speedIdx, setSpeedIdx] = useState(1) // 1× default
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animation step logic
  const advanceAnimation = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1
      if (next > CONNECTIONS.length) {
        // All arrows shown, stop
        setIsPlaying(false)
        return CONNECTIONS.length
      }
      return next
    })
  }, [])

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      animTimerRef.current = setTimeout(advanceAnimation, ANIM_SPEEDS[speedIdx].ms)
    }
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [isPlaying, visibleCount, speedIdx, advanceAnimation])

  const handlePlay = useCallback(() => {
    // Start from scratch
    setVisibleCount(0)
    setIsPlaying(true)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleResume = useCallback(() => {
    if (visibleCount < CONNECTIONS.length) {
      setIsPlaying(true)
    }
  }, [visibleCount])

  const handleShowAll = useCallback(() => {
    setIsPlaying(false)
    setVisibleCount(CONNECTIONS.length)
  }, [])

  const calculateArrows = useCallback(() => {
    const container = containerRef.current
    if (!container || !isRef.current || !bsRef.current || !eqRef.current || !cfRef.current)
      return

    const cRect = container.getBoundingClientRect()
    setContainerSize({ w: cRect.width, h: cRect.height })

    const rects: Record<string, RelRect> = {
      IS: relativeRect(isRef.current, container),
      BS: relativeRect(bsRef.current, container),
      EQ: relativeRect(eqRef.current, container),
      CF: relativeRect(cfRef.current, container),
    }

    const newArrows: ArrowData[] = []

    // Offset connections sharing the same edge
    // Group connections by (box, edge) to add spacing
    const edgeUsage = new Map<string, number>()

    for (const conn of CONNECTIONS) {
      const fromRect = rects[conn.from]
      const toRect = rects[conn.to]
      if (!fromRect || !toRect) continue

      // Calculate offset for shared edges
      const fromKey = `${conn.from}-${conn.fromEdge}`
      const toKey = `${conn.to}-${conn.toEdge}`
      const fromCount = edgeUsage.get(fromKey) ?? 0
      const toCount = edgeUsage.get(toKey) ?? 0

      const offsetSpacing = 14
      const fromOffset = fromCount * offsetSpacing
      const toOffset = toCount * offsetSpacing

      edgeUsage.set(fromKey, fromCount + 1)
      edgeUsage.set(toKey, toCount + 1)

      const from = edgePoint(fromRect, conn.fromEdge, fromOffset)
      const to = edgePoint(toRect, conn.toEdge, toOffset)

      const path = buildCurvePath(from, to, conn.fromEdge, conn.toEdge)
      const mid = pathMidpoint(from, to, conn.fromEdge, conn.toEdge)

      newArrows.push({ conn, path, midX: mid.x, midY: mid.y })
    }

    setArrows(newArrows)
  }, [])

  useEffect(() => {
    // Initial calculation after render
    const timer = setTimeout(calculateArrows, 50)

    // Recalculate on resize
    const observer = new ResizeObserver(() => {
      calculateArrows()
    })
    if (containerRef.current) observer.observe(containerRef.current)

    window.addEventListener('resize', calculateArrows)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('resize', calculateArrows)
    }
  }, [calculateArrows])

  // Recalculate when statement data changes (box heights may shift)
  useEffect(() => {
    const timer = setTimeout(calculateArrows, 100)
    return () => clearTimeout(timer)
  }, [
    balanceSheet.totalAssets,
    incomeStatement.netIncome,
    cashFlowStatement.netChange,
    equityStatement.totalEnding,
    calculateArrows,
  ])

  // Determine which arrows are visible based on animation state
  const visibleArrows = arrows.filter((a) => a.conn.number <= visibleCount)
  const animationDone = visibleCount >= CONNECTIONS.length

  // Active connection info (the one currently being animated in)
  const activeConnection = !animationDone && visibleCount > 0
    ? CONNECTIONS[visibleCount - 1]
    : null

  return (
    <StatementPanel
      title="How Statements Connect"
      subtitle="Follow the numbered arrows to see how data flows between the four financial statements"
      collapsible
      headerRight={
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {ANIM_SPEEDS.map((sp, idx) => (
              <button
                key={sp.label}
                type="button"
                className="px-1.5 py-0.5 rounded text-xs cursor-pointer transition-colors"
                style={{
                  background: idx === speedIdx ? 'var(--color-text)' : 'var(--color-border)',
                  color: idx === speedIdx ? 'var(--color-surface)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  border: 'none',
                }}
                onClick={() => setSpeedIdx(idx)}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Play / Pause / Replay / Show All */}
          {isPlaying ? (
            <button
              type="button"
              className="px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: '#D97706',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={handlePause}
            >
              ⏸ Pause
            </button>
          ) : animationDone ? (
            <button
              type="button"
              className="px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: '#2D6A4F',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={handlePlay}
            >
              🔄 Replay
            </button>
          ) : visibleCount === 0 ? (
            <button
              type="button"
              className="px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: '#2D6A4F',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={handlePlay}
            >
              ▶ Play
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-mono)',
              }}
              onClick={handleResume}
            >
              ▶ Resume
            </button>
          )}

          {!animationDone && visibleCount > 0 && (
            <button
              type="button"
              className="px-2 py-1 rounded text-xs cursor-pointer transition-colors"
              style={{
                background: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
              }}
              onClick={handleShowAll}
            >
              Show All
            </button>
          )}
        </div>
      }
    >
      {/* Active connection caption during animation */}
      {activeConnection && (
        <div
          className="mb-3 px-4 py-2.5 rounded-lg flex items-center gap-3"
          style={{
            background: `${activeConnection.color}12`,
            border: `1px solid ${activeConnection.color}30`,
          }}
        >
          <span
            className="inline-flex items-center justify-center shrink-0"
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: activeConnection.color,
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {activeConnection.number}
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: activeConnection.color, fontFamily: 'var(--font-display)' }}>
              {activeConnection.title}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
              {activeConnection.label}
            </div>
          </div>
        </div>
      )}

      {/* Animation progress indicator */}
      {!animationDone && (
        <div className="mb-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(visibleCount / CONNECTIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, #2D6A4F, #2563EB)',
            }}
          />
        </div>
      )}

      {/* Desktop: 2×2 grid with SVG arrows */}
      <div className="hidden md:block">
        <div
          ref={containerRef}
          style={{ position: 'relative' }}
        >
          {/* SVG arrow overlay */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: containerSize.w || '100%',
              height: containerSize.h || '100%',
              pointerEvents: 'none',
              zIndex: 5,
              overflow: 'visible',
            }}
          >
            <defs>
              {CONNECTIONS.map((c) => (
                <marker
                  key={`arrow-${c.number}`}
                  id={`arrowhead-${c.number}`}
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <path
                    d="M 0 0 L 10 4 L 0 8 Z"
                    fill={c.color}
                    opacity={hoveredArrow === c.number ? 1 : 0.8}
                  />
                </marker>
              ))}
            </defs>

            {visibleArrows.map((a) => {
              const isHovered = hoveredArrow === a.conn.number
              return (
                <g key={a.conn.number}>
                  {/* Arrow path */}
                  <path
                    d={a.path}
                    fill="none"
                    stroke={a.conn.color}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                    strokeDasharray={isHovered ? 'none' : '8 4'}
                    opacity={isHovered ? 1 : 0.7}
                    markerEnd={`url(#arrowhead-${a.conn.number})`}
                    style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                  />
                  {/* Invisible wider path for hover target */}
                  <path
                    d={a.path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredArrow(a.conn.number)}
                    onMouseLeave={() => setHoveredArrow(null)}
                  />
                </g>
              )
            })}

            {/* Numbered badges on arrow midpoints */}
            {visibleArrows.map((a) => {
              const isHovered = hoveredArrow === a.conn.number
              return (
                <g
                  key={`badge-${a.conn.number}`}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredArrow(a.conn.number)}
                  onMouseLeave={() => setHoveredArrow(null)}
                >
                  {/* White background circle */}
                  <circle
                    cx={a.midX}
                    cy={a.midY}
                    r={isHovered ? 16 : 13}
                    fill="white"
                    stroke={a.conn.color}
                    strokeWidth={2}
                    style={{ transition: 'r 0.2s' }}
                  />
                  {/* Colored inner circle */}
                  <circle
                    cx={a.midX}
                    cy={a.midY}
                    r={isHovered ? 13 : 11}
                    fill={a.conn.color}
                    style={{ transition: 'r 0.2s' }}
                  />
                  {/* Number text */}
                  <text
                    x={a.midX}
                    y={a.midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontWeight={700}
                    fontSize={isHovered ? 12 : 10}
                    fontFamily="var(--font-mono)"
                    style={{ transition: 'font-size 0.2s' }}
                  >
                    {a.conn.number}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip for hovered arrow */}
          {hoveredArrow != null && (() => {
            const a = visibleArrows.find((ar) => ar.conn.number === hoveredArrow)
            if (!a) return null
            return (
              <div
                style={{
                  position: 'absolute',
                  left: a.midX,
                  top: a.midY - 20,
                  transform: 'translate(-50%, -100%)',
                  background: 'rgba(0,0,0,0.92)',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-body)',
                  maxWidth: 280,
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  zIndex: 30,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 3, color: a.conn.color === '#2D6A4F' ? '#6EE7B7' : a.conn.color === '#2563EB' ? '#93C5FD' : a.conn.color === '#D97706' ? '#FCD34D' : a.conn.color === '#B03A2E' ? '#FCA5A5' : '#C4B5FD' }}>
                  {a.conn.title}
                </strong>
                {a.conn.label}
              </div>
            )
          })()}

          {/* Grid with statement boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px 80px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <FlowBox
              title="Income Statement"
              color={COLORS.IS.color}
              bgColor={COLORS.IS.bg}
              scale={scale}
              boxRef={isRef}
              lines={[
                { label: 'Revenue', value: incomeStatement.totalRevenue },
                { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
                { label: 'Net Income', value: incomeStatement.netIncome },
              ]}
            />
            <FlowBox
              title="Balance Sheet"
              color={COLORS.BS.color}
              bgColor={COLORS.BS.bg}
              scale={scale}
              boxRef={bsRef}
              lines={[
                { label: 'Assets', value: balanceSheet.totalAssets },
                { label: 'Liabilities', value: balanceSheet.totalLiabilities },
                { label: 'Equity', value: balanceSheet.totalEquity },
              ]}
            />
            <FlowBox
              title="Equity Statement"
              color={COLORS.EQ.color}
              bgColor={COLORS.EQ.bg}
              scale={scale}
              boxRef={eqRef}
              lines={[
                { label: 'Beginning', value: equityStatement.totalBeginning },
                { label: 'Net Income', value: incomeStatement.netIncome },
                { label: 'Ending', value: equityStatement.totalEnding },
              ]}
            />
            <FlowBox
              title="Cash Flow Statement"
              color={COLORS.CF.color}
              bgColor={COLORS.CF.bg}
              scale={scale}
              boxRef={cfRef}
              lines={[
                { label: 'Operating', value: cashFlowStatement.totalOperating },
                { label: 'Investing', value: cashFlowStatement.totalInvesting },
                { label: 'Financing', value: cashFlowStatement.totalFinancing },
                { label: 'Net Change', value: cashFlowStatement.netChange },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Mobile: stacked vertical layout with simple indicators */}
      <div className="md:hidden space-y-3">
        <FlowBox
          title="Income Statement"
          color={COLORS.IS.color}
          bgColor={COLORS.IS.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={[
            { label: 'Revenue', value: incomeStatement.totalRevenue },
            { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
            { label: 'Net Income', value: incomeStatement.netIncome },
          ]}
        />
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div style={{ width: 3, height: 20, background: '#2D6A4F', borderRadius: 2 }} />
            <span style={{ color: '#2D6A4F', fontSize: 14 }}>▼</span>
          </div>
        </div>
        <FlowBox
          title="Balance Sheet"
          color={COLORS.BS.color}
          bgColor={COLORS.BS.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={[
            { label: 'Assets', value: balanceSheet.totalAssets },
            { label: 'Liabilities', value: balanceSheet.totalLiabilities },
            { label: 'Equity', value: balanceSheet.totalEquity },
          ]}
        />
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div style={{ width: 3, height: 20, background: '#2563EB', borderRadius: 2 }} />
            <span style={{ color: '#2563EB', fontSize: 14 }}>▼</span>
          </div>
        </div>
        <FlowBox
          title="Cash Flow Statement"
          color={COLORS.CF.color}
          bgColor={COLORS.CF.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={[
            { label: 'Operating', value: cashFlowStatement.totalOperating },
            { label: 'Investing', value: cashFlowStatement.totalInvesting },
            { label: 'Financing', value: cashFlowStatement.totalFinancing },
            { label: 'Net Change', value: cashFlowStatement.netChange },
          ]}
        />
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div style={{ width: 3, height: 20, background: '#7C3AED', borderRadius: 2 }} />
            <span style={{ color: '#7C3AED', fontSize: 14 }}>▼</span>
          </div>
        </div>
        <FlowBox
          title="Equity Statement"
          color={COLORS.EQ.color}
          bgColor={COLORS.EQ.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={[
            { label: 'Beginning', value: equityStatement.totalBeginning },
            { label: 'Net Income', value: incomeStatement.netIncome },
            { label: 'Ending', value: equityStatement.totalEnding },
          ]}
        />
      </div>

      {/* Legend */}
      <Legend />
    </StatementPanel>
  )
}
