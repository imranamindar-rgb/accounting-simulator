/**
 * FlowDiagram -- visual diagram showing how the four financial
 * statements connect to each other with numbered connection indicators
 * and clean CSS-based dashed lines.
 *
 * Layout (2×2 grid):
 *   Income Statement  ──→  Balance Sheet
 *        │                      ↑
 *        ↓                      │
 *   Equity Statement  ←──  Cash Flow Statement
 *
 * Between each pair of boxes, a labelled arrow bar shows the numbered
 * connections with hover tooltips explaining the relationship.
 */

import { useState } from 'react'
import { useStatements } from '../../hooks/useStatements'
import { useLedgerStore } from '../../store/ledgerStore'
import { formatCurrency } from '../shared/FormatCurrency'
import StatementPanel from '../statements/StatementPanel'

// ── Connection definitions ────────────────────────────────────────

interface ConnectionDef {
  number: number
  title: string
  label: string
  from: string
  to: string
  color: string
}

const CONNECTIONS: ConnectionDef[] = [
  {
    number: 1,
    title: 'Net Income \u2192 Retained Earnings',
    label: 'Net Income from the Income Statement flows into Retained Earnings on the Balance Sheet, representing accumulated profits.',
    from: 'IS',
    to: 'BS',
    color: '#2D6A4F',
  },
  {
    number: 2,
    title: 'Net Income (starting point)',
    label: 'The Cash Flow Statement (indirect method) starts with Net Income and adjusts for non-cash items.',
    from: 'IS',
    to: 'CF',
    color: '#2D6A4F',
  },
  {
    number: 3,
    title: 'Working Capital Changes',
    label: 'Changes in working capital accounts (AR, AP, Inventory) on the Balance Sheet affect Operating Cash Flow.',
    from: 'BS',
    to: 'CF',
    color: '#2563EB',
  },
  {
    number: 4,
    title: 'Ending Cash',
    label: 'The ending cash balance from the Cash Flow Statement matches Cash on the Balance Sheet.',
    from: 'CF',
    to: 'BS',
    color: '#D97706',
  },
  {
    number: 5,
    title: 'Net Income \u2192 Equity',
    label: 'Net Income flows into Retained Earnings in the Statement of Equity.',
    from: 'IS',
    to: 'EQ',
    color: '#2D6A4F',
  },
  {
    number: 6,
    title: 'Total Equity',
    label: 'Total Equity from the Equity Statement flows to the Balance Sheet equity section.',
    from: 'EQ',
    to: 'BS',
    color: '#7C3AED',
  },
  {
    number: 7,
    title: 'Dividends Paid',
    label: 'Dividends paid (from financing activities) reduce Retained Earnings in the Equity Statement.',
    from: 'CF',
    to: 'EQ',
    color: '#D97706',
  },
]

// ── Color config ──────────────────────────────────────────────────

const COLORS: Record<string, { color: string; bg: string }> = {
  IS: { color: '#2D6A4F', bg: '#EAFAF1' },
  BS: { color: '#2563EB', bg: '#EBF5FB' },
  EQ: { color: '#7C3AED', bg: '#F4ECF7' },
  CF: { color: '#D97706', bg: '#FEF5E7' },
}

// ── FlowBox component ─────────────────────────────────────────────

function FlowBox({
  title,
  color,
  bgColor,
  lines,
  scale,
}: {
  title: string
  color: string
  bgColor: string
  lines: { label: string; value: number }[]
  scale: 'ones' | 'millions'
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: bgColor,
        border: `2px solid ${color}40`,
        borderTop: `4px solid ${color}`,
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
              {formatCurrency(line.value, scale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Numbered Badge ───────────────────────────────────────────────

function Badge({
  conn,
  hovered,
  onEnter,
  onLeave,
}: {
  conn: ConnectionDef
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0 cursor-help"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: conn.color,
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        boxShadow: hovered ? `0 0 0 3px ${conn.color}40` : 'none',
        transition: 'box-shadow 0.2s',
      }}
    >
      {conn.number}
      {/* Tooltip */}
      {hovered && (
        <span
          className="absolute z-30 pointer-events-none"
          style={{
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: '0.7rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            maxWidth: 260,
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ display: 'block', marginBottom: 2 }}>{conn.title}</strong>
          {conn.label}
        </span>
      )}
    </span>
  )
}

// ── Horizontal Arrow ────────────────────────────────────────────

function HArrow({
  connections,
  direction = 'right',
}: {
  connections: ConnectionDef[]
  direction?: 'left' | 'right'
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1 px-1" style={{ minWidth: 80 }}>
      {direction === 'left' && (
        <span style={{ color: connections[0]?.color ?? '#888', fontSize: 18 }}>◀</span>
      )}
      <div
        className="flex-1 relative flex items-center justify-center gap-1"
        style={{ minHeight: 28 }}
      >
        {/* Dashed line background */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: '50%',
            height: 3,
            transform: 'translateY(-50%)',
            background: `repeating-linear-gradient(
              ${direction === 'right' ? '90deg' : '270deg'},
              ${connections[0]?.color ?? '#888'} 0px,
              ${connections[0]?.color ?? '#888'} 8px,
              transparent 8px,
              transparent 14px
            )`,
            opacity: 0.5,
          }}
        />
        {/* Badges */}
        {connections.map((c) => (
          <Badge
            key={c.number}
            conn={c}
            hovered={hovered === c.number}
            onEnter={() => setHovered(c.number)}
            onLeave={() => setHovered(null)}
          />
        ))}
      </div>
      {direction === 'right' && (
        <span style={{ color: connections[0]?.color ?? '#888', fontSize: 18 }}>▶</span>
      )}
    </div>
  )
}

// ── Vertical Arrow ──────────────────────────────────────────────

function VArrow({
  connections,
  direction = 'down',
}: {
  connections: ConnectionDef[]
  direction?: 'up' | 'down'
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div
      className="flex flex-col items-center gap-1 py-1"
      style={{ minHeight: 60 }}
    >
      {direction === 'up' && (
        <span style={{ color: connections[0]?.color ?? '#888', fontSize: 18, lineHeight: 1 }}>▲</span>
      )}
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-1"
        style={{ minWidth: 28 }}
      >
        {/* Dashed line background */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: '50%',
            width: 3,
            transform: 'translateX(-50%)',
            background: `repeating-linear-gradient(
              ${direction === 'down' ? '180deg' : '0deg'},
              ${connections[0]?.color ?? '#888'} 0px,
              ${connections[0]?.color ?? '#888'} 8px,
              transparent 8px,
              transparent 14px
            )`,
            opacity: 0.5,
          }}
        />
        {/* Badges */}
        {connections.map((c) => (
          <Badge
            key={c.number}
            conn={c}
            hovered={hovered === c.number}
            onEnter={() => setHovered(c.number)}
            onLeave={() => setHovered(null)}
          />
        ))}
      </div>
      {direction === 'down' && (
        <span style={{ color: connections[0]?.color ?? '#888', fontSize: 18, lineHeight: 1 }}>▼</span>
      )}
    </div>
  )
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

  // Filter connections by position in the layout
  const isToBS = CONNECTIONS.filter((c) => c.from === 'IS' && c.to === 'BS') // #1: right
  const isToCF = CONNECTIONS.filter((c) => c.from === 'IS' && c.to === 'CF') // #3: diagonal -> shown vertically on IS side
  const isToEQ = CONNECTIONS.filter((c) => c.from === 'IS' && c.to === 'EQ') // #2: down
  const bsToCF = CONNECTIONS.filter((c) => c.from === 'BS' && c.to === 'CF') // #4: down
  const cfToBS = CONNECTIONS.filter((c) => c.from === 'CF' && c.to === 'BS') // #5: up/right
  const eqToBS = CONNECTIONS.filter((c) => c.from === 'EQ' && c.to === 'BS') // #6: right
  const cfToEQ = CONNECTIONS.filter((c) => c.from === 'CF' && c.to === 'EQ') // #7: left

  return (
    <StatementPanel
      title="How Statements Connect"
      subtitle="Follow the numbered arrows to see how data flows between the four financial statements"
    >
      {/* Desktop: 2×2 grid with arrows between boxes */}
      <div className="hidden md:block">
        {/*
         * Grid layout:
         *   [IS]   →arrows→   [BS]
         *    ↓                  ↑↓
         *   [EQ]   ←arrows←   [CF]
         */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gridTemplateRows: 'auto auto auto',
            gap: 0,
            alignItems: 'center',
          }}
        >
          {/* Row 1: IS | horizontal arrows | BS */}
          <FlowBox
            title="Income Statement"
            color={COLORS.IS.color}
            bgColor={COLORS.IS.bg}
            scale={scale}
            lines={[
              { label: 'Revenue', value: incomeStatement.totalRevenue },
              { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
              { label: 'Net Income', value: incomeStatement.netIncome },
            ]}
          />
          <HArrow
            connections={[...isToBS, ...isToCF]}
            direction="right"
          />
          <FlowBox
            title="Balance Sheet"
            color={COLORS.BS.color}
            bgColor={COLORS.BS.bg}
            scale={scale}
            lines={[
              { label: 'Assets', value: balanceSheet.totalAssets },
              { label: 'Liabilities', value: balanceSheet.totalLiabilities },
              { label: 'Equity', value: balanceSheet.totalEquity },
            ]}
          />

          {/* Row 2: vertical arrows down from IS | center (empty) | vertical arrows down from BS */}
          <VArrow connections={isToEQ} direction="down" />
          <div />
          <VArrow connections={[...bsToCF, ...cfToBS]} direction="down" />

          {/* Row 3: EQ | horizontal arrows | CF */}
          <FlowBox
            title="Equity Statement"
            color={COLORS.EQ.color}
            bgColor={COLORS.EQ.bg}
            scale={scale}
            lines={[
              { label: 'Beginning', value: equityStatement.totalBeginning },
              { label: 'Net Income', value: incomeStatement.netIncome },
              { label: 'Ending', value: equityStatement.totalEnding },
            ]}
          />
          <HArrow
            connections={[...eqToBS, ...cfToEQ]}
            direction="left"
          />
          <FlowBox
            title="Cash Flow Statement"
            color={COLORS.CF.color}
            bgColor={COLORS.CF.bg}
            scale={scale}
            lines={[
              { label: 'Operating', value: cashFlowStatement.totalOperating },
              { label: 'Investing', value: cashFlowStatement.totalInvesting },
              { label: 'Financing', value: cashFlowStatement.totalFinancing },
              { label: 'Net Change', value: cashFlowStatement.netChange },
            ]}
          />
        </div>
      </div>

      {/* Mobile: stacked vertical layout */}
      <div className="md:hidden space-y-2">
        <FlowBox
          title="Income Statement"
          color={COLORS.IS.color}
          bgColor={COLORS.IS.bg}
          scale={scale}
          lines={[
            { label: 'Revenue', value: incomeStatement.totalRevenue },
            { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
            { label: 'Net Income', value: incomeStatement.netIncome },
          ]}
        />
        <div className="flex justify-center">
          <VArrow connections={[...isToBS, ...isToEQ, ...isToCF]} direction="down" />
        </div>
        <FlowBox
          title="Balance Sheet"
          color={COLORS.BS.color}
          bgColor={COLORS.BS.bg}
          scale={scale}
          lines={[
            { label: 'Assets', value: balanceSheet.totalAssets },
            { label: 'Liabilities', value: balanceSheet.totalLiabilities },
            { label: 'Equity', value: balanceSheet.totalEquity },
          ]}
        />
        <div className="flex justify-center">
          <VArrow connections={[...bsToCF, ...cfToBS]} direction="down" />
        </div>
        <FlowBox
          title="Cash Flow Statement"
          color={COLORS.CF.color}
          bgColor={COLORS.CF.bg}
          scale={scale}
          lines={[
            { label: 'Operating', value: cashFlowStatement.totalOperating },
            { label: 'Investing', value: cashFlowStatement.totalInvesting },
            { label: 'Financing', value: cashFlowStatement.totalFinancing },
            { label: 'Net Change', value: cashFlowStatement.netChange },
          ]}
        />
        <div className="flex justify-center">
          <VArrow connections={[...eqToBS, ...cfToEQ]} direction="down" />
        </div>
        <FlowBox
          title="Equity Statement"
          color={COLORS.EQ.color}
          bgColor={COLORS.EQ.bg}
          scale={scale}
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
