import { useMemo } from 'react'
import { useMAStore } from '../../store/maStore'
import { computeMA } from '../../engines/MAEngine'
import type { MAResult } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function StructureStep() {
  const target = useMAStore((s) => s.targetCompany)
  const acquirer = useMAStore((s) => s.acquirerCompany)
  const dealTerms = useMAStore((s) => s.dealTerms)

  const result: MAResult | null = useMemo(() => {
    if (!acquirer || !target) return null
    return computeMA(acquirer, target, dealTerms)
  }, [acquirer, target, dealTerms])

  if (!target || !acquirer) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        No companies selected. Go back to Import step.
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        Unable to compute M&A results. Check that both companies have valid share price and shares outstanding.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Deal Summary */}
      <StatementPanel title="Deal Summary" subtitle={`${acquirer.name} acquiring ${target.name}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <Row label="Offer Price per Share" value={`$${fmt(result.offerPrice)}`} />
          <Row label="Total Purchase Price" value={`$${fmt(result.purchasePrice)}`} bold />
          <Row label="Cash Used" value={`$${fmt(result.cashUsed)}`} />
          <Row label="Stock Used" value={`$${fmt(result.stockUsed)}`} />
          <Row label="Debt Used" value={`$${fmt(result.debtUsed)}`} />
          <Row label="New Shares Issued" value={fmt(result.newShares)} />
          <Row label="Goodwill Created" value={`$${fmt(result.goodwill)}`} />
          <Row label="New Interest Expense" value={`$${fmt(result.newInterest)}`} />
          <Row label="Tax Shield" value={`$${fmt(result.taxShield)}`} />
          <Row label="After-tax Interest" value={`$${fmt(result.afterTaxInterest)}`} />
        </div>
      </StatementPanel>

      {/* EPS Impact */}
      <StatementPanel
        title="EPS Impact Analysis"
        headerRight={
          <span
            className="text-xs font-bold px-3 py-1 rounded"
            style={{
              background: result.isAccretive ? 'var(--color-green)' : 'var(--color-accent-light)',
              color: '#fff',
            }}
          >
            {result.isAccretive ? 'ACCRETIVE' : 'DILUTIVE'}
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricBox
              label="Acquirer EPS"
              value={`$${fmt(result.acquirerEPS)}`}
              sublabel={acquirer.name}
            />
            <MetricBox
              label="Combined EPS"
              value={`$${fmt(result.combinedEPS)}`}
              sublabel="Pro Forma"
            />
            <MetricBox
              label="Accretion / Dilution"
              value={`${result.accretionPct >= 0 ? '+' : ''}${result.accretionPct.toFixed(1)}%`}
              sublabel={result.isAccretive ? 'Accretive' : 'Dilutive'}
              valueColor={result.isAccretive ? 'var(--color-green)' : 'var(--color-accent-light)'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <Row label="Acquirer Net Income" value={`$${fmt(result.acquirerNetIncome)}`} />
            <Row label="Target Net Income" value={`$${fmt(result.targetNetIncome)}`} />
            <Row label="Synergies" value={`$${fmt(result.synergies)}`} />
            <Row label="Combined Net Income" value={`$${fmt(result.combinedNetIncome)}`} bold />
            <Row label="Acquirer Shares" value={fmt(result.acquirerShares)} />
            <Row label="Combined Shares" value={fmt(result.combinedShares)} />
          </div>
        </div>
      </StatementPanel>

      {/* Break-even Synergies */}
      <StatementPanel title="Break-even Analysis">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Synergies needed to break even on EPS:
          </span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}
          >
            ${fmt(result.breakEvenSynergies)}
          </span>
        </div>
      </StatementPanel>

      {/* Pro-Forma Balance Sheet */}
      <StatementPanel title="Pro-Forma Balance Sheet" subtitle="Combined entity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <Row label="Combined Assets" value={`$${fmt(result.combinedAssets)}`} bold />
          <Row label="Combined Liabilities" value={`$${fmt(result.combinedLiabilities)}`} bold />
          <Row label="Combined Equity" value={`$${fmt(result.combinedEquity)}`} bold />
        </div>
      </StatementPanel>

      {/* Pro-Forma P/E */}
      <StatementPanel title="Pro-Forma Valuation">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Pro-Forma P/E:</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
          >
            {result.proFormaPE !== null ? fmt(result.proFormaPE) + 'x' : 'N/A'}
          </span>
        </div>
      </StatementPanel>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        className={`text-sm ${bold ? 'font-bold' : ''}`}
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
      >
        {value}
      </span>
    </div>
  )
}

function MetricBox({
  label,
  value,
  sublabel,
  valueColor,
}: {
  label: string
  value: string
  sublabel: string
  valueColor?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-3 rounded"
      style={{ background: 'var(--color-base)' }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <span
        className="text-xl font-bold"
        style={{ fontFamily: 'var(--font-mono)', color: valueColor ?? 'var(--color-text)' }}
      >
        {value}
      </span>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {sublabel}
      </span>
    </div>
  )
}
