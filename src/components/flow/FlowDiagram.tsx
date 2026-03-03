/**
 * FlowDiagram -- visual diagram showing how the four financial
 * statements connect to each other with SVG curved arrows
 * and numbered connection badges.
 *
 * Layout (2×2 grid):
 *   Income Statement  ──①──→  Equity Statement
 *        │                          │
 *        ②                          ③
 *        ↓                          ↓
 *   Cash Flow Statement ──④──→  Balance Sheet
 *                       ←──⑤──
 *
 * Uses refs to measure box positions and draws accurate SVG
 * curved arrows between the correct edges of each box.
 *
 * Transaction-reactive: when a transaction is recorded, the
 * affected line items glow and only the relevant arrows highlight.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useStatements } from '../../hooks/useStatements'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'
import { formatCurrency } from '../shared/FormatCurrency'
import StatementPanel from '../statements/StatementPanel'
import type { LedgerChange } from '../../engines/types'

// ── Account type lookup ──────────────────────────────────────────

const ACCOUNT_TYPE_MAP = new Map(
  CHART_OF_ACCOUNTS.map((a) => [a.name, a.type]),
)

// ── Connection definitions ────────────────────────────────────────

type StatementKey = 'IS' | 'BS' | 'EQ' | 'CF'

interface ConnectionDef {
  number: number
  title: string
  label: string
  from: StatementKey
  to: StatementKey
  color: string
  fromEdge: 'right' | 'bottom' | 'left' | 'top'
  toEdge: 'left' | 'top' | 'right' | 'bottom'
  fromOffset?: number
  toOffset?: number
}

/**
 * 5 connections with zero crossings:
 *
 *  IS ──①──→ EQ
 *  │          │
 *  ②          ③
 *  ↓          ↓
 *  CF ──④──→ BS
 *     ←──⑤──
 */
const CONNECTIONS: ConnectionDef[] = [
  {
    number: 1,
    title: 'Net Income → Retained Earnings',
    label:
      'Net Income from the Income Statement flows into Retained Earnings in the Equity Statement.',
    from: 'IS',
    to: 'EQ',
    color: '#2D6A4F',
    fromEdge: 'right',
    toEdge: 'left',
  },
  {
    number: 2,
    title: 'Net Income → Cash Flow',
    label:
      'Net Income is the starting point of the Cash Flow Statement (indirect method), then adjusted for non-cash items and working capital changes.',
    from: 'IS',
    to: 'CF',
    color: '#D97706',
    fromEdge: 'bottom',
    toEdge: 'top',
  },
  {
    number: 3,
    title: 'Ending Equity → Balance Sheet',
    label:
      'Total Ending Equity from the Equity Statement flows to the equity section of the Balance Sheet.',
    from: 'EQ',
    to: 'BS',
    color: '#7C3AED',
    fromEdge: 'bottom',
    toEdge: 'top',
  },
  {
    number: 4,
    title: 'Ending Cash → Balance Sheet',
    label:
      'The ending cash balance from the Cash Flow Statement matches the Cash asset on the Balance Sheet.',
    from: 'CF',
    to: 'BS',
    color: '#2563EB',
    fromEdge: 'right',
    toEdge: 'left',
    fromOffset: -12,
    toOffset: -12,
  },
  {
    number: 5,
    title: 'Working Capital Changes',
    label:
      'Changes in Balance Sheet accounts (AR, AP, Inventory) between periods flow back as operating adjustments in the Cash Flow Statement.',
    from: 'BS',
    to: 'CF',
    color: '#2563EB',
    fromEdge: 'left',
    toEdge: 'right',
    fromOffset: 12,
    toOffset: 12,
  },
]

// ── Color config ──────────────────────────────────────────────────

const COLORS: Record<StatementKey, { color: string; bg: string }> = {
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

// ── Transaction highlighting helpers ─────────────────────────────

const HIGHLIGHT_DURATION_MS = 8000

function getAffectedStatements(
  changes: LedgerChange[],
): Set<StatementKey> {
  const affected = new Set<StatementKey>()
  for (const change of changes) {
    const type = ACCOUNT_TYPE_MAP.get(change.account)
    if (!type) continue
    switch (type) {
      case 'Revenue':
      case 'Expense':
        affected.add('IS')
        affected.add('EQ')
        break
      case 'Asset':
        affected.add('BS')
        if (change.account === 'Cash') affected.add('CF')
        break
      case 'Liability':
        affected.add('BS')
        break
      case 'Equity':
        affected.add('BS')
        affected.add('EQ')
        break
    }
  }
  // Net income flows IS → EQ → BS and IS → CF
  if (affected.has('IS')) {
    affected.add('EQ')
    affected.add('CF')
    affected.add('BS')
  }
  return affected
}

function getHighlightLines(
  changes: LedgerChange[],
): Record<StatementKey, Set<string>> {
  const hl: Record<StatementKey, Set<string>> = {
    IS: new Set(),
    BS: new Set(),
    EQ: new Set(),
    CF: new Set(),
  }
  for (const change of changes) {
    const type = ACCOUNT_TYPE_MAP.get(change.account)
    if (!type) continue
    switch (type) {
      case 'Revenue':
        hl.IS.add('Revenue')
        break
      case 'Expense':
        hl.IS.add('Expenses')
        break
      case 'Asset':
        hl.BS.add('Assets')
        if (change.account === 'Cash') {
          hl.CF.add('Net Change')
          hl.CF.add('Operating')
        }
        break
      case 'Liability':
        hl.BS.add('Liabilities')
        break
      case 'Equity':
        hl.BS.add('Equity')
        hl.EQ.add('Ending')
        break
    }
  }
  if (hl.IS.size > 0) {
    hl.IS.add('Net Income')
    hl.EQ.add('Net Income')
    hl.EQ.add('Ending')
    hl.CF.add('Operating') // CFS starts with Net Income (indirect method)
  }
  return hl
}

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

  let cp1x = from.x
  let cp1y = from.y
  let cp2x = to.x
  let cp2y = to.y

  const curvature = 0.5

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
  const dx = to.x - from.x
  const dy = to.y - from.y
  const curvature = 0.5

  let cp1x = from.x,
    cp1y = from.y,
    cp2x = to.x,
    cp2y = to.y

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

  const t = 0.5
  const mt = 1 - t
  const x =
    mt * mt * mt * from.x +
    3 * mt * mt * t * cp1x +
    3 * mt * t * t * cp2x +
    t * t * t * to.x
  const y =
    mt * mt * mt * from.y +
    3 * mt * mt * t * cp1y +
    3 * mt * t * t * cp2y +
    t * t * t * to.y

  return { x, y }
}

// ── FlowBox component ─────────────────────────────────────────────

const FlowBox = ({
  title,
  color,
  bgColor,
  lines,
  scale,
  boxRef,
  highlightLines,
  isAffected,
}: {
  title: string
  color: string
  bgColor: string
  lines: FlowLine[]
  scale: 'ones' | 'millions'
  boxRef: React.RefObject<HTMLDivElement | null>
  highlightLines?: Set<string>
  isAffected?: boolean
}) => (
  <div
    ref={boxRef}
    className="rounded-lg p-4 relative z-10"
    style={{
      background: bgColor,
      border: `2px solid ${color}40`,
      borderTop: `4px solid ${color}`,
      transition: 'box-shadow 0.4s ease',
      boxShadow: isAffected
        ? `0 0 16px ${color}40, 0 0 4px ${color}25`
        : 'none',
    }}
  >
    <h3
      className="text-sm font-bold mb-3"
      style={{ color, fontFamily: 'var(--font-display)' }}
    >
      {title}
    </h3>
    <div className="space-y-1.5">
      {lines.map((line) => {
        if (line.isSection) {
          return (
            <div
              key={line.label}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color,
                opacity: 0.6,
                paddingTop: '4px',
                paddingBottom: '1px',
              }}
            >
              {line.label}
            </div>
          )
        }
        const isHighlighted = highlightLines?.has(line.label)
        return (
          <div
            key={line.label}
            className="flex items-center justify-between text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              paddingLeft: line.indent ? '0.6rem' : undefined,
              background: isHighlighted ? `${color}18` : 'transparent',
              borderRadius: isHighlighted ? 4 : 0,
              padding: isHighlighted ? '3px 8px' : line.indent ? '1px 0 1px 0.6rem' : '1px 0',
              border: isHighlighted
                ? `1px solid ${color}30`
                : '1px solid transparent',
              transition: 'all 0.4s ease',
            }}
          >
            <span
              style={{
                fontSize: line.indent ? '0.68rem' : '0.75rem',
                color: isHighlighted ? color : 'var(--color-text)',
                fontWeight: isHighlighted ? 600 : 400,
                transition: 'all 0.3s',
              }}
            >
              {line.label}
              {isHighlighted && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    marginLeft: 4,
                    opacity: 0.7,
                  }}
                >
                  ●
                </span>
              )}
            </span>
            <span
              className="font-semibold ml-2"
              style={{
                color: line.value < 0 ? '#DC2626' : 'var(--color-text)',
              }}
            >
              {formatCurrency(line.value, scale)}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)

// ── Legend ─────────────────────────────────────────────────────────

function Legend({
  activeArrows,
}: {
  activeArrows?: Set<number>
}) {
  return (
    <div
      className="mt-4 rounded-lg p-5"
      style={{
        background: 'var(--color-base)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CONNECTIONS.map((c) => {
          const isActive = activeArrows?.has(c.number)
          return (
            <div
              key={c.number}
              className="flex items-start gap-3"
              style={{
                opacity: activeArrows && activeArrows.size > 0 && !isActive ? 0.35 : 1,
                transition: 'opacity 0.4s',
              }}
            >
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
                  boxShadow: isActive
                    ? `0 0 10px ${c.color}60`
                    : 'none',
                  transition: 'box-shadow 0.3s',
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
          )
        })}

      </div>
    </div>
  )
}

// ── Hierarchical line helpers ─────────────────────────────────────

type FlowLine = { label: string; value: number; isSection?: boolean; indent?: boolean }

type ISData = {
  revenue: { name: string; balance: number }[]
  cogs: { name: string; balance: number }[]
  operatingExpenses: { name: string; balance: number }[]
  totalRevenue: number
  totalCOGS: number
  totalOperatingExpenses: number
  netIncome: number
}

type BSData = {
  currentAssets: { name: string; balance: number; contra: boolean }[]
  noncurrentAssets: { name: string; balance: number; contra: boolean }[]
  currentLiabilities: { name: string; balance: number; contra: boolean }[]
  noncurrentLiabilities: { name: string; balance: number; contra: boolean }[]
  equity: { name: string; balance: number; contra: boolean }[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

function buildFlowISLines(is: ISData): FlowLine[] {
  const hasRev  = is.revenue.some(a => a.balance !== 0)
  const hasCOGS = is.cogs.some(a => a.balance !== 0)
  const hasOpEx = is.operatingExpenses.some(a => a.balance !== 0)

  if (!hasRev && !hasCOGS && !hasOpEx) {
    return [
      { label: 'Revenue', value: is.totalRevenue },
      { label: 'Expenses', value: is.totalOperatingExpenses + is.totalCOGS },
      { label: 'Net Income', value: is.netIncome },
    ]
  }

  const lines: FlowLine[] = []

  if (hasRev) {
    lines.push({ label: 'REVENUE', value: 0, isSection: true })
    for (const a of is.revenue.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.balance, indent: true })
    }
  }
  lines.push({ label: 'Revenue', value: is.totalRevenue })

  if (hasCOGS || hasOpEx) {
    lines.push({ label: 'EXPENSES', value: 0, isSection: true })
    for (const a of is.cogs.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: -a.balance, indent: true })
    }
    for (const a of is.operatingExpenses.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: -a.balance, indent: true })
    }
  }
  lines.push({ label: 'Expenses', value: is.totalOperatingExpenses + is.totalCOGS })
  lines.push({ label: 'Net Income', value: is.netIncome })
  return lines
}

function buildFlowBSLines(bs: BSData): FlowLine[] {
  const hasCurrA  = bs.currentAssets.some(a => a.balance !== 0)
  const hasNcurrA = bs.noncurrentAssets.some(a => a.balance !== 0)
  const hasCurrL  = bs.currentLiabilities.some(a => a.balance !== 0)
  const hasNcurrL = bs.noncurrentLiabilities.some(a => a.balance !== 0)
  const hasEq     = bs.equity.some(a => a.balance !== 0)

  if (!hasCurrA && !hasNcurrA && !hasCurrL && !hasNcurrL && !hasEq) {
    return [
      { label: 'Assets', value: bs.totalAssets },
      { label: 'Liabilities', value: bs.totalLiabilities },
      { label: 'Equity', value: bs.totalEquity },
    ]
  }

  const lines: FlowLine[] = []

  if (hasCurrA) {
    lines.push({ label: 'CURRENT ASSETS', value: 0, isSection: true })
    for (const a of bs.currentAssets.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.contra ? -a.balance : a.balance, indent: true })
    }
  }
  if (hasNcurrA) {
    lines.push({ label: 'LONG-TERM ASSETS', value: 0, isSection: true })
    for (const a of bs.noncurrentAssets.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.contra ? -a.balance : a.balance, indent: true })
    }
  }
  lines.push({ label: 'Assets', value: bs.totalAssets })

  if (hasCurrL) {
    lines.push({ label: 'CURRENT LIABILITIES', value: 0, isSection: true })
    for (const a of bs.currentLiabilities.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.balance, indent: true })
    }
  }
  if (hasNcurrL) {
    lines.push({ label: 'LONG-TERM LIABILITIES', value: 0, isSection: true })
    for (const a of bs.noncurrentLiabilities.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.balance, indent: true })
    }
  }
  lines.push({ label: 'Liabilities', value: bs.totalLiabilities })

  if (hasEq) {
    lines.push({ label: 'EQUITY', value: 0, isSection: true })
    for (const a of bs.equity.filter(a => a.balance !== 0)) {
      lines.push({ label: a.name, value: a.balance, indent: true })
    }
  }
  lines.push({ label: 'Equity', value: bs.totalEquity })
  return lines
}

// ── Main component ────────────────────────────────────────────────

export default function FlowDiagram() {
  const { balanceSheet, incomeStatement, cashFlowStatement, equityStatement } =
    useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')
  const lastTransaction = useUIStore((s) => s.lastTransaction)

  const containerRef = useRef<HTMLDivElement>(null)
  const isRef = useRef<HTMLDivElement>(null)
  const bsRef = useRef<HTMLDivElement>(null)
  const eqRef = useRef<HTMLDivElement>(null)
  const cfRef = useRef<HTMLDivElement>(null)

  const [arrows, setArrows] = useState<ArrowData[]>([])
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [hoveredArrow, setHoveredArrow] = useState<number | null>(null)

  // ── Transaction highlight state ──
  const [highlightActive, setHighlightActive] = useState(false)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When a new transaction comes in, activate highlighting
  useEffect(() => {
    if (lastTransaction && lastTransaction.changes.length > 0) {
      setHighlightActive(true)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = setTimeout(() => {
        setHighlightActive(false)
      }, HIGHLIGHT_DURATION_MS)
    }
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    }
  }, [lastTransaction?.timestamp]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute highlight data
  const { affectedStatements, highlightLines: hlLines, activeArrows } = useMemo(() => {
    if (!highlightActive || !lastTransaction) {
      return {
        affectedStatements: new Set<StatementKey>(),
        highlightLines: { IS: new Set<string>(), BS: new Set<string>(), EQ: new Set<string>(), CF: new Set<string>() },
        activeArrows: new Set<number>(),
      }
    }
    const affected = getAffectedStatements(lastTransaction.changes)
    const hl = getHighlightLines(lastTransaction.changes)

    // Determine which arrows connect affected statements
    const active = new Set<number>()
    for (const conn of CONNECTIONS) {
      if (affected.has(conn.from) && affected.has(conn.to)) {
        active.add(conn.number)
      }
    }
    return { affectedStatements: affected, highlightLines: hl, activeArrows: active }
  }, [highlightActive, lastTransaction])

  // Hierarchical lines for IS and BS (shared by desktop + mobile)
  const isLines = useMemo(() => buildFlowISLines(incomeStatement), [incomeStatement])
  const bsLines = useMemo(() => buildFlowBSLines(balanceSheet), [balanceSheet])

  // ── Animation state ──
  const [visibleCount, setVisibleCount] = useState(CONNECTIONS.length)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advanceAnimation = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1
      if (next > CONNECTIONS.length) {
        setIsPlaying(false)
        return CONNECTIONS.length
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (isPlaying) {
      animTimerRef.current = setTimeout(
        advanceAnimation,
        ANIM_SPEEDS[speedIdx].ms,
      )
    }
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [isPlaying, visibleCount, speedIdx, advanceAnimation])

  const handlePlay = useCallback(() => {
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
    if (
      !container ||
      !isRef.current ||
      !bsRef.current ||
      !eqRef.current ||
      !cfRef.current
    )
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

    for (const conn of CONNECTIONS) {
      const fromRect = rects[conn.from]
      const toRect = rects[conn.to]
      if (!fromRect || !toRect) continue

      const fromOff = conn.fromOffset ?? 0
      const toOff = conn.toOffset ?? 0

      const from = edgePoint(fromRect, conn.fromEdge, fromOff)
      const to = edgePoint(toRect, conn.toEdge, toOff)

      const path = buildCurvePath(from, to, conn.fromEdge, conn.toEdge)
      const mid = pathMidpoint(from, to, conn.fromEdge, conn.toEdge)

      newArrows.push({ conn, path, midX: mid.x, midY: mid.y })
    }

    setArrows(newArrows)
  }, [])

  useEffect(() => {
    const timer = setTimeout(calculateArrows, 50)
    const observer = new ResizeObserver(() => calculateArrows())
    if (containerRef.current) observer.observe(containerRef.current)
    window.addEventListener('resize', calculateArrows)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('resize', calculateArrows)
    }
  }, [calculateArrows])

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

  const visibleArrows = arrows.filter((a) => a.conn.number <= visibleCount)
  const animationDone = visibleCount >= CONNECTIONS.length

  const activeConnection =
    !animationDone && visibleCount > 0
      ? CONNECTIONS[visibleCount - 1]
      : null

  // Transaction highlight banner
  const txBanner = highlightActive && lastTransaction && (
    <div
      className="mb-3 px-4 py-2.5 rounded-lg flex items-center gap-3"
      style={{
        background: 'rgba(45, 106, 79, 0.08)',
        border: '1px solid rgba(45, 106, 79, 0.2)',
      }}
    >
      <span
        style={{
          fontSize: '1.1rem',
          lineHeight: 1,
        }}
      >
        ⚡
      </span>
      <div>
        <div
          className="text-sm font-semibold"
          style={{
            color: '#2D6A4F',
            fontFamily: 'var(--font-display)',
          }}
        >
          {lastTransaction.template.name}
        </div>
        <div
          className="text-xs"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.4,
          }}
        >
          {lastTransaction.changes
            .map(
              (c) =>
                `${c.account}: ${c.after > c.before ? '↑' : '↓'} $${Math.abs(c.after - c.before).toLocaleString()}`,
            )
            .join(' · ')}
        </div>
      </div>
    </div>
  )

  return (
    <StatementPanel
      title="How Statements Connect"
      subtitle="Follow the numbered arrows to see how data flows between the four financial statements"
      collapsible
      headerRight={
        <div
          className="flex items-center gap-2 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {ANIM_SPEEDS.map((sp, idx) => (
              <button
                key={sp.label}
                type="button"
                className="px-1.5 py-0.5 rounded text-xs cursor-pointer transition-colors"
                style={{
                  background:
                    idx === speedIdx
                      ? 'var(--color-text)'
                      : 'var(--color-border)',
                  color:
                    idx === speedIdx
                      ? 'var(--color-surface)'
                      : 'var(--color-text-muted)',
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
              ↻ Replay
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
      {/* Transaction highlight banner */}
      {txBanner}

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
            <div
              className="text-sm font-semibold"
              style={{
                color: activeConnection.color,
                fontFamily: 'var(--font-display)',
              }}
            >
              {activeConnection.title}
            </div>
            <div
              className="text-xs"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
              }}
            >
              {activeConnection.label}
            </div>
          </div>
        </div>
      )}

      {/* Animation progress indicator */}
      {!animationDone && (
        <div
          className="mb-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--color-border)' }}
        >
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
        <div ref={containerRef} style={{ position: 'relative' }}>
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
                  <path d="M 0 0 L 10 4 L 0 8 Z" fill={c.color} />
                </marker>
              ))}
            </defs>

            {visibleArrows.map((a) => {
              const isHovered = hoveredArrow === a.conn.number
              const isTxActive =
                highlightActive && activeArrows.has(a.conn.number)
              const isTxDimmed =
                highlightActive &&
                activeArrows.size > 0 &&
                !activeArrows.has(a.conn.number)

              return (
                <g key={a.conn.number}>
                  {/* Arrow path */}
                  <path
                    d={a.path}
                    fill="none"
                    stroke={a.conn.color}
                    strokeWidth={
                      isTxActive ? 3.5 : isHovered ? 3 : isTxDimmed ? 1.5 : 2
                    }
                    strokeDasharray={
                      isTxActive || isHovered ? 'none' : '8 4'
                    }
                    opacity={
                      isTxActive
                        ? 1
                        : isTxDimmed
                          ? 0.15
                          : isHovered
                            ? 0.9
                            : 0.55
                    }
                    markerEnd={`url(#arrowhead-${a.conn.number})`}
                    style={{
                      transition:
                        'opacity 0.4s, stroke-width 0.3s, stroke-dasharray 0.3s',
                    }}
                  />
                  {/* Invisible wider path for hover */}
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
              const isTxActive =
                highlightActive && activeArrows.has(a.conn.number)
              const isTxDimmed =
                highlightActive &&
                activeArrows.size > 0 &&
                !activeArrows.has(a.conn.number)

              return (
                <g
                  key={`badge-${a.conn.number}`}
                  style={{
                    pointerEvents: 'all',
                    cursor: 'pointer',
                    opacity: isTxDimmed ? 0.2 : 1,
                    transition: 'opacity 0.4s',
                  }}
                  onMouseEnter={() => setHoveredArrow(a.conn.number)}
                  onMouseLeave={() => setHoveredArrow(null)}
                >
                  <circle
                    cx={a.midX}
                    cy={a.midY}
                    r={isTxActive ? 15 : isHovered ? 15 : 12}
                    fill="white"
                    stroke={a.conn.color}
                    strokeWidth={isTxActive ? 2.5 : 1.5}
                    style={{ transition: 'r 0.2s' }}
                  />
                  <circle
                    cx={a.midX}
                    cy={a.midY}
                    r={isTxActive ? 12 : isHovered ? 12 : 10}
                    fill={a.conn.color}
                    style={{ transition: 'r 0.2s' }}
                  />
                  <text
                    x={a.midX}
                    y={a.midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontWeight={700}
                    fontSize={isHovered || isTxActive ? 11 : 9}
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
          {hoveredArrow != null &&
            (() => {
              const a = visibleArrows.find(
                (ar) => ar.conn.number === hoveredArrow,
              )
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
                  <strong
                    style={{
                      display: 'block',
                      marginBottom: 3,
                      color:
                        a.conn.color === '#2D6A4F'
                          ? '#6EE7B7'
                          : a.conn.color === '#2563EB'
                            ? '#93C5FD'
                            : a.conn.color === '#D97706'
                              ? '#FCD34D'
                              : '#C4B5FD',
                    }}
                  >
                    {a.conn.title}
                  </strong>
                  {a.conn.label}
                </div>
              )
            })()}

          {/* Grid with statement boxes — IS/EQ top row, CF/BS bottom row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '44px 70px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Top-left: Income Statement */}
            <FlowBox
              title="Income Statement"
              color={COLORS.IS.color}
              bgColor={COLORS.IS.bg}
              scale={scale}
              boxRef={isRef}
              highlightLines={hlLines.IS}
              isAffected={highlightActive && affectedStatements.has('IS')}
              lines={isLines}
            />
            {/* Top-right: Equity Statement */}
            <FlowBox
              title="Equity Statement"
              color={COLORS.EQ.color}
              bgColor={COLORS.EQ.bg}
              scale={scale}
              boxRef={eqRef}
              highlightLines={hlLines.EQ}
              isAffected={highlightActive && affectedStatements.has('EQ')}
              lines={[
                {
                  label: 'Beginning',
                  value: equityStatement.totalBeginning,
                },
                {
                  label: 'Net Income',
                  value: incomeStatement.netIncome,
                },
                { label: 'Ending', value: equityStatement.totalEnding },
              ]}
            />
            {/* Bottom-left: Cash Flow Statement */}
            <FlowBox
              title="Cash Flow Statement"
              color={COLORS.CF.color}
              bgColor={COLORS.CF.bg}
              scale={scale}
              boxRef={cfRef}
              highlightLines={hlLines.CF}
              isAffected={highlightActive && affectedStatements.has('CF')}
              lines={[
                {
                  label: 'Operating',
                  value: cashFlowStatement.totalOperating,
                },
                {
                  label: 'Investing',
                  value: cashFlowStatement.totalInvesting,
                },
                {
                  label: 'Financing',
                  value: cashFlowStatement.totalFinancing,
                },
                {
                  label: 'Net Change',
                  value: cashFlowStatement.netChange,
                },
              ]}
            />
            {/* Bottom-right: Balance Sheet */}
            <FlowBox
              title="Balance Sheet"
              color={COLORS.BS.color}
              bgColor={COLORS.BS.bg}
              scale={scale}
              boxRef={bsRef}
              highlightLines={hlLines.BS}
              isAffected={highlightActive && affectedStatements.has('BS')}
              lines={bsLines}
            />
          </div>
        </div>
      </div>

      {/* Mobile: stacked vertical layout — IS → EQ → CF → BS */}
      <div className="md:hidden space-y-3">
        <FlowBox
          title="Income Statement"
          color={COLORS.IS.color}
          bgColor={COLORS.IS.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={isLines}
        />
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div
              style={{
                width: 3,
                height: 20,
                background: '#2D6A4F',
                borderRadius: 2,
              }}
            />
            <span style={{ color: '#2D6A4F', fontSize: 14 }}>▼</span>
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
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div
              style={{
                width: 3,
                height: 20,
                background: '#D97706',
                borderRadius: 2,
              }}
            />
            <span style={{ color: '#D97706', fontSize: 14 }}>▼</span>
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
            <div
              style={{
                width: 3,
                height: 20,
                background: '#2563EB',
                borderRadius: 2,
              }}
            />
            <span style={{ color: '#2563EB', fontSize: 14 }}>▼</span>
          </div>
        </div>
        <FlowBox
          title="Balance Sheet"
          color={COLORS.BS.color}
          bgColor={COLORS.BS.bg}
          scale={scale}
          boxRef={{ current: null }}
          lines={bsLines}
        />
      </div>

      {/* Legend */}
      <Legend activeArrows={highlightActive ? activeArrows : undefined} />
    </StatementPanel>
  )
}
