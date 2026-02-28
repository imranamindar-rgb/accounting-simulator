/**
 * FlowDiagram -- visual diagram showing how the four financial
 * statements connect to each other with numbered arrow indicators
 * and SVG connection lines.
 *
 * Layout:
 *   Income Statement  ──→  Balance Sheet
 *        │                      ↑
 *        ↓                      │
 *   Equity Statement  ←──  Cash Flow Statement
 *
 * Uses SVG overlay for connection lines to ensure they are long,
 * visible, and properly connect the statement boxes.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useStatements } from '../../hooks/useStatements'
import StatementPanel from '../statements/StatementPanel'

// ── Currency formatting ────────────────────────────────────────────

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`
  }
  return `${sign}$${abs.toFixed(0)}`
}

// ── Types ──────────────────────────────────────────────────────────

interface FlowBoxProps {
  id: string
  title: string
  color: string
  bgColor: string
  lines: { label: string; value: number }[]
  refCallback: (el: HTMLDivElement | null) => void
}

interface Connection {
  id: string
  number: number
  label: string
  from: string
  to: string
  color: string
}

// ── Connection definitions ────────────────────────────────────────

const CONNECTIONS: Connection[] = [
  {
    id: 'income-to-bs',
    number: 1,
    label: 'Net Income affects Retained Earnings in Equity',
    from: 'IS',
    to: 'BS',
    color: '#2D6A4F',
  },
  {
    id: 'is-to-eq',
    number: 2,
    label: 'Net Income flows to Equity Statement',
    from: 'IS',
    to: 'EQ',
    color: '#2D6A4F',
  },
  {
    id: 'income-to-cf',
    number: 3,
    label: 'Net Income is starting point for Operating Cash Flow',
    from: 'IS',
    to: 'CF',
    color: '#2D6A4F',
  },
  {
    id: 'bs-to-cf',
    number: 4,
    label: 'Changes in working capital adjust Operating Cash Flow',
    from: 'BS',
    to: 'CF',
    color: '#2563EB',
  },
  {
    id: 'cf-to-bs',
    number: 5,
    label: 'Net cash change updates Cash on Balance Sheet',
    from: 'CF',
    to: 'BS',
    color: '#D97706',
  },
  {
    id: 'eq-to-bs',
    number: 6,
    label: 'Total Equity ties to Balance Sheet',
    from: 'EQ',
    to: 'BS',
    color: '#7C3AED',
  },
  {
    id: 'cf-to-eq',
    number: 7,
    label: 'Dividends paid affect Equity',
    from: 'CF',
    to: 'EQ',
    color: '#D97706',
  },
]

// ── Color config ──────────────────────────────────────────────────

const COLORS = {
  IS: { color: '#2D6A4F', bg: '#EAFAF1' },
  BS: { color: '#2563EB', bg: '#EBF5FB' },
  EQ: { color: '#7C3AED', bg: '#F4ECF7' },
  CF: { color: '#D97706', bg: '#FEF5E7' },
}

// ── FlowBox component ─────────────────────────────────────────────

function FlowBox({ id, title, color, bgColor, lines, refCallback }: FlowBoxProps) {
  return (
    <div
      ref={refCallback}
      data-flow-box={id}
      className="rounded-lg p-4 relative"
      style={{
        background: bgColor,
        border: `2px solid ${color}40`,
        borderTop: `4px solid ${color}`,
        zIndex: 2,
      }}
    >
      <h3
        className="text-sm font-bold mb-3"
        style={{
          color,
          fontFamily: 'var(--font-display)',
        }}
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
              {formatCompact(line.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SVG Arrow with number badge ─────────────────────────────────

function SvgArrow({
  x1,
  y1,
  x2,
  y2,
  connection,
  showTooltip,
  onHover,
  onLeave,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  connection: Connection
  showTooltip: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  // Calculate angle for arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const arrowLen = 10
  const arrowAngle = Math.PI / 6

  const ax1 = x2 - arrowLen * Math.cos(angle - arrowAngle)
  const ay1 = y2 - arrowLen * Math.sin(angle - arrowAngle)
  const ax2 = x2 - arrowLen * Math.cos(angle + arrowAngle)
  const ay2 = y2 - arrowLen * Math.sin(angle + arrowAngle)

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: 'help' }}
    >
      {/* Line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={connection.color}
        strokeWidth={2.5}
        strokeDasharray="6 3"
        opacity={0.7}
      />

      {/* Arrowhead */}
      <polygon
        points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={connection.color}
        opacity={0.8}
      />

      {/* Number badge */}
      <circle
        cx={midX}
        cy={midY}
        r={12}
        fill={connection.color}
        stroke="white"
        strokeWidth={2}
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="var(--font-mono)"
      >
        {connection.number}
      </text>

      {/* Tooltip */}
      {showTooltip && (
        <g>
          <rect
            x={midX - 120}
            y={midY - 35}
            width={240}
            height={24}
            rx={4}
            fill="rgba(0,0,0,0.85)"
          />
          <text
            x={midX}
            y={midY - 23}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="10"
            fontFamily="var(--font-body)"
          >
            {connection.label.length > 45
              ? connection.label.slice(0, 42) + '...'
              : connection.label}
          </text>
        </g>
      )}
    </g>
  )
}

// ── Legend ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div
      className="mt-4 rounded-lg p-4"
      style={{
        background: 'var(--color-base)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h4
        className="text-xs font-semibold mb-3 uppercase tracking-wide"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
        }}
      >
        How the Statements Connect
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CONNECTIONS.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-xs">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold shrink-0 mt-0.5"
              style={{ background: c.color }}
            >
              {c.number}
            </span>
            <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
              <strong>{c.from} {'\u2192'} {c.to}:</strong> {c.label}
            </span>
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

  const containerRef = useRef<HTMLDivElement>(null)
  const boxRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)
  const [linePositions, setLinePositions] = useState<
    { conn: Connection; x1: number; y1: number; x2: number; y2: number }[]
  >([])

  const setBoxRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      boxRefs.current[id] = el
    },
    [],
  )

  // Calculate SVG line positions based on box positions
  const updatePositions = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const positions: typeof linePositions = []

    for (const conn of CONNECTIONS) {
      const fromBox = boxRefs.current[conn.from]
      const toBox = boxRefs.current[conn.to]
      if (!fromBox || !toBox) continue

      const fromRect = fromBox.getBoundingClientRect()
      const toRect = toBox.getBoundingClientRect()

      // Calculate edge midpoints based on relative position
      let x1: number, y1: number, x2: number, y2: number

      const fromCenterX = fromRect.left + fromRect.width / 2 - containerRect.left
      const fromCenterY = fromRect.top + fromRect.height / 2 - containerRect.top
      const toCenterX = toRect.left + toRect.width / 2 - containerRect.left
      const toCenterY = toRect.top + toRect.height / 2 - containerRect.top

      // Determine connection direction and pick edge points
      const dx = toCenterX - fromCenterX
      const dy = toCenterY - fromCenterY

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection
        if (dx > 0) {
          // Left to right
          x1 = fromRect.right - containerRect.left
          y1 = fromCenterY
          x2 = toRect.left - containerRect.left
          y2 = toCenterY
        } else {
          // Right to left
          x1 = fromRect.left - containerRect.left
          y1 = fromCenterY
          x2 = toRect.right - containerRect.left
          y2 = toCenterY
        }
      } else {
        // Vertical connection
        if (dy > 0) {
          // Top to bottom
          x1 = fromCenterX
          y1 = fromRect.bottom - containerRect.top
          x2 = toCenterX
          y2 = toRect.top - containerRect.top
        } else {
          // Bottom to top
          x1 = fromCenterX
          y1 = fromRect.top - containerRect.top
          x2 = toCenterX
          y2 = toRect.bottom - containerRect.top
        }
      }

      // Add small offsets for parallel arrows to avoid overlap
      const offset = conn.number * 3 - 12
      if (Math.abs(dx) > Math.abs(dy)) {
        y1 += offset
        y2 += offset
      } else {
        x1 += offset
        x2 += offset
      }

      positions.push({ conn, x1, y1, x2, y2 })
    }

    setLinePositions(positions)
  }, [])

  useEffect(() => {
    updatePositions()
    const timer = setTimeout(updatePositions, 100)
    window.addEventListener('resize', updatePositions)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePositions)
    }
  }, [updatePositions, balanceSheet, incomeStatement])

  return (
    <StatementPanel
      title="How Statements Connect"
      subtitle="Follow the numbered arrows to see how data flows between the four financial statements"
    >
      {/* Desktop: 2x2 grid layout with SVG arrows */}
      <div className="hidden md:block">
        <div ref={containerRef} className="relative">
          {/* SVG overlay for connection lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {linePositions.map(({ conn, x1, y1, x2, y2 }) => (
              <SvgArrow
                key={conn.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                connection={conn}
                showTooltip={hoveredConnection === conn.id}
                onHover={() => setHoveredConnection(conn.id)}
                onLeave={() => setHoveredConnection(null)}
              />
            ))}
          </svg>

          {/* 2x2 grid of statement boxes */}
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto auto',
              padding: '16px 0',
            }}
          >
            {/* Row 1: IS | BS */}
            <FlowBox
              id="IS"
              title="Income Statement"
              color={COLORS.IS.color}
              bgColor={COLORS.IS.bg}
              refCallback={setBoxRef('IS')}
              lines={[
                { label: 'Revenue', value: incomeStatement.totalRevenue },
                { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
                { label: 'Net Income', value: incomeStatement.netIncome },
              ]}
            />
            <FlowBox
              id="BS"
              title="Balance Sheet"
              color={COLORS.BS.color}
              bgColor={COLORS.BS.bg}
              refCallback={setBoxRef('BS')}
              lines={[
                { label: 'Assets', value: balanceSheet.totalAssets },
                { label: 'Liabilities', value: balanceSheet.totalLiabilities },
                { label: 'Equity', value: balanceSheet.totalEquity },
              ]}
            />

            {/* Row 2: EQ | CF */}
            <FlowBox
              id="EQ"
              title="Equity Statement"
              color={COLORS.EQ.color}
              bgColor={COLORS.EQ.bg}
              refCallback={setBoxRef('EQ')}
              lines={[
                { label: 'Beginning', value: equityStatement.totalBeginning },
                { label: 'Net Income', value: incomeStatement.netIncome },
                { label: 'Ending', value: equityStatement.totalEnding },
              ]}
            />
            <FlowBox
              id="CF"
              title="Cash Flow Statement"
              color={COLORS.CF.color}
              bgColor={COLORS.CF.bg}
              refCallback={setBoxRef('CF')}
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

      {/* Mobile: stacked vertical layout with simple arrows */}
      <div className="md:hidden space-y-2">
        <FlowBox
          id="IS-m"
          title="Income Statement"
          color={COLORS.IS.color}
          bgColor={COLORS.IS.bg}
          refCallback={() => {}}
          lines={[
            { label: 'Revenue', value: incomeStatement.totalRevenue },
            { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
            { label: 'Net Income', value: incomeStatement.netIncome },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {CONNECTIONS.filter((c) => c.from === 'IS').map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                style={{ background: c.color }}
              >
                {c.number}
              </span>
            ))}
            <span style={{ fontSize: '16px' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          id="BS-m"
          title="Balance Sheet"
          color={COLORS.BS.color}
          bgColor={COLORS.BS.bg}
          refCallback={() => {}}
          lines={[
            { label: 'Assets', value: balanceSheet.totalAssets },
            { label: 'Liabilities', value: balanceSheet.totalLiabilities },
            { label: 'Equity', value: balanceSheet.totalEquity },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {CONNECTIONS.filter((c) => c.from === 'BS' || c.to === 'CF').slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                style={{ background: c.color }}
              >
                {c.number}
              </span>
            ))}
            <span style={{ fontSize: '16px' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          id="CF-m"
          title="Cash Flow Statement"
          color={COLORS.CF.color}
          bgColor={COLORS.CF.bg}
          refCallback={() => {}}
          lines={[
            { label: 'Operating', value: cashFlowStatement.totalOperating },
            { label: 'Investing', value: cashFlowStatement.totalInvesting },
            { label: 'Financing', value: cashFlowStatement.totalFinancing },
            { label: 'Net Change', value: cashFlowStatement.netChange },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {CONNECTIONS.filter((c) => c.from === 'CF' || c.from === 'EQ').slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                style={{ background: c.color }}
              >
                {c.number}
              </span>
            ))}
            <span style={{ fontSize: '16px' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          id="EQ-m"
          title="Equity Statement"
          color={COLORS.EQ.color}
          bgColor={COLORS.EQ.bg}
          refCallback={() => {}}
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
