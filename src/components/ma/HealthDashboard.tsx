import { useMemo } from 'react'
import { computeHealthMetrics } from '../../engines/MAEngine'
import type { MACompanyInput, HealthMetrics } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

interface Props {
  company: MACompanyInput
}

function fmtRatio(v: number | null): string {
  if (v === null) return 'N/A'
  return v.toFixed(2)
}

function fmtPct(v: number | null): string {
  if (v === null) return 'N/A'
  return (v * 100).toFixed(1) + '%'
}

type HealthColor = 'green' | 'yellow' | 'red' | 'muted'

/**
 * Simple heuristic-based health indicator. Returns green/yellow/red
 * depending on the metric name and value.
 */
function getHealthColor(metric: string, value: number | null): HealthColor {
  if (value === null) return 'muted'

  // Profitability metrics (higher is better)
  if (['grossMargin', 'operatingMargin', 'netMargin', 'roe', 'roa'].includes(metric)) {
    if (value > 0.15) return 'green'
    if (value > 0.05) return 'yellow'
    return 'red'
  }

  // Leverage: debt ratios (lower is better)
  if (['debtToEquity', 'debtToAssets'].includes(metric)) {
    if (value < 0.5) return 'green'
    if (value < 1.5) return 'yellow'
    return 'red'
  }
  if (metric === 'longTermDebtToEquity') {
    if (value < 0.4) return 'green'
    if (value < 1.0) return 'yellow'
    return 'red'
  }
  // Interest coverage (higher is better)
  if (metric === 'interestCoverage') {
    if (value > 5) return 'green'
    if (value > 2) return 'yellow'
    return 'red'
  }

  // Liquidity ratios (higher is better)
  if (metric === 'currentRatio') {
    if (value > 2) return 'green'
    if (value >= 1) return 'yellow'
    return 'red'
  }
  if (metric === 'quickRatio') {
    if (value > 1.5) return 'green'
    if (value >= 0.8) return 'yellow'
    return 'red'
  }
  if (metric === 'cashRatio') {
    if (value > 0.5) return 'green'
    if (value >= 0.2) return 'yellow'
    return 'red'
  }

  // Efficiency (higher is better generally)
  if (['assetTurnover', 'equityTurnover'].includes(metric)) {
    if (value > 1) return 'green'
    if (value > 0.5) return 'yellow'
    return 'red'
  }

  return 'muted'
}

const COLOR_MAP: Record<HealthColor, string> = {
  green: 'var(--color-green)',
  yellow: 'var(--color-gold)',
  red: 'var(--color-accent-light)',
  muted: 'var(--color-text-muted)',
}

const METRIC_LABELS: Record<string, string> = {
  grossMargin: 'Gross Margin',
  operatingMargin: 'Operating Margin',
  netMargin: 'Net Margin',
  roe: 'Return on Equity',
  roa: 'Return on Assets',
  debtToEquity: 'Debt / Equity',
  debtToAssets: 'Debt / Assets',
  longTermDebtToEquity: 'LT Debt / Equity',
  interestCoverage: 'Interest Coverage',
  currentRatio: 'Current Ratio',
  quickRatio: 'Quick Ratio',
  cashRatio: 'Cash Ratio',
  assetTurnover: 'Asset Turnover',
  equityTurnover: 'Equity Turnover',
}

function MetricCard({ name, value, isPercent }: { name: string; value: number | null; isPercent: boolean }) {
  const color = getHealthColor(name, value)
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded"
      style={{ background: 'var(--color-base)' }}
    >
      <span className="text-sm" style={{ color: 'var(--color-text)' }}>
        {METRIC_LABELS[name] ?? name}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-mono)', color: COLOR_MAP[color] }}
        >
          {isPercent ? fmtPct(value) : fmtRatio(value)}
        </span>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ background: COLOR_MAP[color] }}
        />
      </div>
    </div>
  )
}

function MetricSection({
  title,
  metrics,
  isPercent,
}: {
  title: string
  metrics: Record<string, number | null>
  isPercent: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {title}
      </h3>
      {Object.entries(metrics).map(([key, val]) => (
        <MetricCard key={key} name={key} value={val} isPercent={isPercent} />
      ))}
    </div>
  )
}

export default function HealthDashboard({ company }: Props) {
  const metrics: HealthMetrics = useMemo(() => computeHealthMetrics(company), [company])

  return (
    <StatementPanel title="Financial Health Dashboard" subtitle={company.name}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MetricSection title="Profitability" metrics={metrics.profitability} isPercent={true} />
        <MetricSection title="Leverage" metrics={metrics.leverage} isPercent={false} />
        <MetricSection title="Liquidity" metrics={metrics.liquidity} isPercent={false} />
        <MetricSection title="Efficiency" metrics={metrics.efficiency} isPercent={false} />
      </div>
    </StatementPanel>
  )
}
