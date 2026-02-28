/**
 * FlowDiagram -- visual 2x2 grid showing how the four financial
 * statements connect to each other with numbered arrow indicators.
 *
 * Layout:
 *   Income Statement  -->  Balance Sheet
 *        |                      ^
 *        v                      |
 *   Equity Statement  -->  Cash Flow Statement
 *
 * Uses pure CSS/HTML (no SVG) for simplicity and accessibility.
 */

import { useState } from 'react'
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
  title: string
  color: string
  bgColor: string
  lines: { label: string; value: number }[]
}

interface Connection {
  id: string
  number: number
  label: string
  from: string
  to: string
}

// ── Connection definitions ────────────────────────────────────────

const CONNECTIONS: Connection[] = [
  {
    id: 'income-to-bs',
    number: 1,
    label: 'Net Income affects Retained Earnings in Equity',
    from: 'IS',
    to: 'BS',
  },
  {
    id: 'is-to-eq',
    number: 2,
    label: 'Net Income flows to Equity Statement',
    from: 'IS',
    to: 'EQ',
  },
  {
    id: 'income-to-cf',
    number: 3,
    label: 'Net Income is starting point for Operating Cash Flow',
    from: 'IS',
    to: 'CF',
  },
  {
    id: 'bs-to-cf',
    number: 4,
    label: 'Changes in working capital adjust Operating Cash Flow',
    from: 'BS',
    to: 'CF',
  },
  {
    id: 'cf-to-bs',
    number: 5,
    label: 'Net cash change updates Cash on Balance Sheet',
    from: 'CF',
    to: 'BS',
  },
  {
    id: 'eq-to-bs',
    number: 6,
    label: 'Total Equity ties to Balance Sheet',
    from: 'EQ',
    to: 'BS',
  },
  {
    id: 'cf-to-eq',
    number: 7,
    label: 'Dividends paid affect Equity',
    from: 'CF',
    to: 'EQ',
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

function FlowBox({ title, color, bgColor, lines }: FlowBoxProps) {
  return (
    <div
      className="rounded-lg p-4 relative"
      style={{
        background: bgColor,
        borderTop: `3px solid ${color}`,
        border: `1px solid ${color}20`,
        borderTopWidth: '3px',
        borderTopColor: color,
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

// ── Arrow badge (numbered circle with tooltip) ────────────────────

function ArrowBadge({
  number,
  color,
  label,
}: {
  number: number
  color: string
  label: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <span
      className="relative inline-flex items-center justify-center cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="img"
      aria-label={`Connection ${number}: ${label}`}
    >
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
        style={{ background: color }}
      >
        {number}
      </span>
      {showTooltip && (
        <span
          className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded shadow-lg text-xs whitespace-nowrap pointer-events-none"
          style={{
            background: 'var(--color-text)',
            color: 'var(--color-surface)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}

// ── Arrow row between top/bottom boxes ────────────────────────────

function HorizontalArrow({
  connections,
  direction,
}: {
  connections: Connection[]
  direction: 'right' | 'left'
}) {
  return (
    <div className="flex items-center gap-1">
      {direction === 'right' && (
        <>
          <span
            className="flex-1 h-px"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="flex items-center gap-0.5">
            {connections.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {'\u2192'}
          </span>
        </>
      )}
      {direction === 'left' && (
        <>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {'\u2190'}
          </span>
          <div className="flex items-center gap-0.5">
            {connections.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
          </div>
          <span
            className="flex-1 h-px"
            style={{ background: 'var(--color-border)' }}
          />
        </>
      )}
    </div>
  )
}

function VerticalArrow({
  connections,
  direction,
}: {
  connections: Connection[]
  direction: 'down' | 'up'
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      {direction === 'down' && (
        <>
          <div className="flex items-center gap-0.5">
            {connections.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {'\u2193'}
          </span>
        </>
      )}
      {direction === 'up' && (
        <>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {'\u2191'}
          </span>
          <div className="flex items-center gap-0.5">
            {connections.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Legend ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div
      className="mt-6 rounded-lg p-4"
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
              style={{
                background: COLORS[c.from as keyof typeof COLORS].color,
              }}
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

  // Group connections by their position in the grid
  const topHorizontal = CONNECTIONS.filter((c) => c.from === 'IS' && c.to === 'BS')
  const leftVertical = CONNECTIONS.filter((c) => c.from === 'IS' && c.to === 'EQ')
  const bottomHorizontal = CONNECTIONS.filter(
    (c) =>
      (c.from === 'EQ' && c.to === 'BS') ||
      (c.from === 'CF' && c.to === 'EQ')
  )
  const rightVertical = CONNECTIONS.filter(
    (c) =>
      (c.from === 'BS' && c.to === 'CF') ||
      (c.from === 'CF' && c.to === 'BS')
  )
  const diagonal = CONNECTIONS.filter(
    (c) => c.from === 'IS' && c.to === 'CF'
  )

  return (
    <StatementPanel
      title="How Statements Connect"
      subtitle="Follow the numbered arrows to see how data flows between the four financial statements"
    >
      {/* Desktop: 2x2 grid layout with arrows */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto_auto] gap-y-2 gap-x-3 items-center">
          {/* Row 1: IS -- arrows --> BS */}
          <FlowBox
            title="Income Statement"
            color={COLORS.IS.color}
            bgColor={COLORS.IS.bg}
            lines={[
              { label: 'Revenue', value: incomeStatement.totalRevenue },
              { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
              { label: 'Net Income', value: incomeStatement.netIncome },
            ]}
          />
          <div className="flex flex-col items-center gap-2 px-1">
            <HorizontalArrow connections={topHorizontal} direction="right" />
            {diagonal.length > 0 && (
              <div className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {diagonal.map((c) => (
                  <ArrowBadge
                    key={c.id}
                    number={c.number}
                    color={COLORS[c.from as keyof typeof COLORS].color}
                    label={c.label}
                  />
                ))}
                <span>{'\u2198'}</span>
              </div>
            )}
          </div>
          <FlowBox
            title="Balance Sheet"
            color={COLORS.BS.color}
            bgColor={COLORS.BS.bg}
            lines={[
              { label: 'Assets', value: balanceSheet.totalAssets },
              { label: 'Liabilities', value: balanceSheet.totalLiabilities },
              { label: 'Equity', value: balanceSheet.totalEquity },
            ]}
          />

          {/* Row 2: vertical arrows */}
          <div className="flex justify-center">
            <VerticalArrow connections={leftVertical} direction="down" />
          </div>
          <div /> {/* center cell empty */}
          <div className="flex justify-center">
            <VerticalArrow
              connections={rightVertical}
              direction={rightVertical.some((c) => c.from === 'CF') ? 'up' : 'down'}
            />
          </div>

          {/* Row 3: EQ -- arrows --> CF */}
          <FlowBox
            title="Equity Statement"
            color={COLORS.EQ.color}
            bgColor={COLORS.EQ.bg}
            lines={[
              { label: 'Beginning', value: equityStatement.totalBeginning },
              { label: 'Net Income', value: incomeStatement.netIncome },
              { label: 'Ending', value: equityStatement.totalEnding },
            ]}
          />
          <div className="flex flex-col items-center gap-2 px-1">
            {bottomHorizontal
              .filter((c) => c.from === 'EQ' && c.to === 'BS')
              .length > 0 && (
              <div className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {bottomHorizontal
                  .filter((c) => c.from === 'EQ' && c.to === 'BS')
                  .map((c) => (
                    <ArrowBadge
                      key={c.id}
                      number={c.number}
                      color={COLORS[c.from as keyof typeof COLORS].color}
                      label={c.label}
                    />
                  ))}
                <span>{'\u2197'}</span>
              </div>
            )}
            {bottomHorizontal
              .filter((c) => c.from === 'CF' && c.to === 'EQ')
              .length > 0 && (
              <div className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span>{'\u2190'}</span>
                {bottomHorizontal
                  .filter((c) => c.from === 'CF' && c.to === 'EQ')
                  .map((c) => (
                    <ArrowBadge
                      key={c.id}
                      number={c.number}
                      color={COLORS[c.from as keyof typeof COLORS].color}
                      label={c.label}
                    />
                  ))}
              </div>
            )}
          </div>
          <FlowBox
            title="Cash Flow Statement"
            color={COLORS.CF.color}
            bgColor={COLORS.CF.bg}
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
      <div className="md:hidden space-y-3">
        <FlowBox
          title="Income Statement"
          color={COLORS.IS.color}
          bgColor={COLORS.IS.bg}
          lines={[
            { label: 'Revenue', value: incomeStatement.totalRevenue },
            { label: 'Expenses', value: incomeStatement.totalOperatingExpenses + incomeStatement.totalCOGS },
            { label: 'Net Income', value: incomeStatement.netIncome },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2">
            {[...topHorizontal, ...leftVertical, ...diagonal].map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
            <span style={{ color: 'var(--color-text-muted)' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          title="Balance Sheet"
          color={COLORS.BS.color}
          bgColor={COLORS.BS.bg}
          lines={[
            { label: 'Assets', value: balanceSheet.totalAssets },
            { label: 'Liabilities', value: balanceSheet.totalLiabilities },
            { label: 'Equity', value: balanceSheet.totalEquity },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2">
            {rightVertical.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
            <span style={{ color: 'var(--color-text-muted)' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          title="Cash Flow Statement"
          color={COLORS.CF.color}
          bgColor={COLORS.CF.bg}
          lines={[
            { label: 'Operating', value: cashFlowStatement.totalOperating },
            { label: 'Investing', value: cashFlowStatement.totalInvesting },
            { label: 'Financing', value: cashFlowStatement.totalFinancing },
            { label: 'Net Change', value: cashFlowStatement.netChange },
          ]}
        />
        <div className="flex justify-center py-1">
          <div className="flex items-center gap-2">
            {bottomHorizontal.map((c) => (
              <ArrowBadge
                key={c.id}
                number={c.number}
                color={COLORS[c.from as keyof typeof COLORS].color}
                label={c.label}
              />
            ))}
            <span style={{ color: 'var(--color-text-muted)' }}>{'\u2193'}</span>
          </div>
        </div>
        <FlowBox
          title="Equity Statement"
          color={COLORS.EQ.color}
          bgColor={COLORS.EQ.bg}
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
