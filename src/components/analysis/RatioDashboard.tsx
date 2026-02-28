/**
 * RatioDashboard -- 23-ratio financial analysis dashboard.
 *
 * Reads live ratios from the ledger store and renders them in five
 * collapsible sections: Profitability, Liquidity, Solvency,
 * Efficiency, and Analytical (including DuPont decomposition).
 */

import { useState } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useRatios } from '../../hooks/useStatements'
import RatioCard from './RatioCard'
import type { RatioCardProps } from './RatioCard'
import DuPontChart from './DuPontChart'
import type { FinancialRatios } from '../../engines/RatioCalculator'

// ── Section configuration ───────────────────────────────────────────

interface RatioEntry {
  key: keyof FinancialRatios
  name: string
  format: RatioCardProps['format']
  description: string
  benchmark?: RatioCardProps['benchmark']
}

interface SectionConfig {
  title: string
  entries: RatioEntry[]
}

const SECTIONS: SectionConfig[] = [
  {
    title: 'Profitability',
    entries: [
      {
        key: 'grossProfitMargin',
        name: 'Gross Profit Margin',
        format: 'percent',
        description: 'Revenue remaining after cost of goods sold',
        benchmark: { good: 0.30, warning: 0.15 },
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin',
        format: 'percent',
        description: 'Operating income as a share of revenue',
        benchmark: { good: 0.15, warning: 0.05 },
      },
      {
        key: 'ebitda',
        name: 'EBITDA',
        format: 'currency',
        description: 'Earnings before interest, taxes, depreciation & amortization',
      },
      {
        key: 'ebitdaMargin',
        name: 'EBITDA Margin',
        format: 'percent',
        description: 'EBITDA as a share of revenue',
        benchmark: { good: 0.20, warning: 0.10 },
      },
      {
        key: 'netProfitMargin',
        name: 'Net Profit Margin',
        format: 'percent',
        description: 'Bottom-line profit as a share of revenue',
        benchmark: { good: 0.10, warning: 0.03 },
      },
      {
        key: 'roa',
        name: 'ROA',
        format: 'percent',
        description: 'Return on total assets',
        benchmark: { good: 0.05, warning: 0.02 },
      },
      {
        key: 'roe',
        name: 'ROE',
        format: 'percent',
        description: 'Return on shareholders\' equity',
        benchmark: { good: 0.15, warning: 0.05 },
      },
      {
        key: 'roic',
        name: 'ROIC',
        format: 'percent',
        description: 'Return on invested capital (NOPAT / invested capital)',
        benchmark: { good: 0.10, warning: 0.05 },
      },
    ],
  },
  {
    title: 'Liquidity',
    entries: [
      {
        key: 'currentRatio',
        name: 'Current Ratio',
        format: 'ratio',
        description: 'Current assets / current liabilities',
        benchmark: { good: 1.5, warning: 1.0 },
      },
      {
        key: 'quickRatio',
        name: 'Quick Ratio',
        format: 'ratio',
        description: '(Current assets - inventory) / current liabilities',
        benchmark: { good: 1.0, warning: 0.5 },
      },
      {
        key: 'cashRatio',
        name: 'Cash Ratio',
        format: 'ratio',
        description: 'Cash / current liabilities',
        benchmark: { good: 0.5, warning: 0.2 },
      },
    ],
  },
  {
    title: 'Solvency',
    entries: [
      {
        key: 'debtToEquity',
        name: 'Debt-to-Equity',
        format: 'ratio',
        description: 'Total liabilities / total equity',
        benchmark: { good: 1.0, warning: 2.0, inverse: true },
      },
      {
        key: 'debtToAssets',
        name: 'Debt-to-Assets',
        format: 'ratio',
        description: 'Total liabilities / total assets',
        benchmark: { good: 0.5, warning: 0.7, inverse: true },
      },
      {
        key: 'interestCoverage',
        name: 'Interest Coverage',
        format: 'ratio',
        description: 'Operating income / interest expense',
        benchmark: { good: 3.0, warning: 1.5 },
      },
    ],
  },
  {
    title: 'Efficiency',
    entries: [
      {
        key: 'assetTurnover',
        name: 'Asset Turnover',
        format: 'ratio',
        description: 'Revenue / total assets',
        benchmark: { good: 0.5, warning: 0.2 },
      },
      {
        key: 'receivablesTurnover',
        name: 'Receivables Turnover',
        format: 'ratio',
        description: 'Revenue / accounts receivable',
      },
      {
        key: 'dso',
        name: 'DSO',
        format: 'days',
        description: 'Days sales outstanding',
        benchmark: { good: 30, warning: 60, inverse: true },
      },
      {
        key: 'inventoryTurnover',
        name: 'Inventory Turnover',
        format: 'ratio',
        description: 'COGS / inventory',
      },
      {
        key: 'dio',
        name: 'DIO',
        format: 'days',
        description: 'Days inventory outstanding',
        benchmark: { good: 30, warning: 90, inverse: true },
      },
      {
        key: 'payablesTurnover',
        name: 'Payables Turnover',
        format: 'ratio',
        description: 'COGS / accounts payable',
      },
      {
        key: 'dpo',
        name: 'DPO',
        format: 'days',
        description: 'Days payable outstanding',
      },
    ],
  },
]

// Analytical section is handled separately because of the DuPont chart

const ANALYTICAL_ENTRIES: RatioEntry[] = [
  {
    key: 'cashConversionCycle',
    name: 'Cash Conversion Cycle',
    format: 'days',
    description: 'DSO + DIO - DPO',
    benchmark: { good: 30, warning: 90, inverse: true },
  },
  {
    key: 'freeCashFlow',
    name: 'Free Cash Flow',
    format: 'currency',
    description: 'Operating cash flow less capital expenditures',
  },
]

// ── Collapsible section component ───────────────────────────────────

function SectionHeader({
  title,
  count,
  expanded,
  onToggle,
}: {
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 py-3 px-1 text-left cursor-pointer"
      style={{ background: 'none', border: 'none' }}
    >
      <span
        className="text-sm transition-transform"
        style={{
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          color: 'var(--color-text-muted)',
        }}
      >
        &#9654;
      </span>
      <span
        className="text-base font-semibold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </span>
      <span
        className="text-xs"
        style={{ color: 'var(--color-text-muted)' }}
      >
        ({count})
      </span>
    </button>
  )
}

// ── Main dashboard ──────────────────────────────────────────────────

export default function RatioDashboard() {
  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const ratios = useRatios()

  // All sections start expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const s of SECTIONS) map[s.title] = true
    map['Analytical'] = true
    return map
  })

  if (!selectedCompany) return null

  function toggle(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function getRatioValue(key: keyof FinancialRatios): number | null {
    const val = ratios[key]
    // dupont is an object, not a number -- skip it
    if (typeof val === 'object' && val !== null) return null
    return val
  }

  return (
    <div
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Dashboard header */}
      <div
        className="px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Financial Ratios
        </h2>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          23 ratios across 5 categories
        </p>
      </div>

      <div className="px-5 py-4 space-y-2">
        {/* Standard sections: Profitability, Liquidity, Solvency, Efficiency */}
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <SectionHeader
              title={section.title}
              count={section.entries.length}
              expanded={!!expanded[section.title]}
              onToggle={() => toggle(section.title)}
            />
            {expanded[section.title] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
                {section.entries.map((entry) => (
                  <RatioCard
                    key={entry.key}
                    name={entry.name}
                    value={getRatioValue(entry.key)}
                    format={entry.format}
                    description={entry.description}
                    benchmark={entry.benchmark}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Analytical section (custom layout for DuPont) */}
        <div>
          <SectionHeader
            title="Analytical"
            count={3}
            expanded={!!expanded['Analytical']}
            onToggle={() => toggle('Analytical')}
          />
          {expanded['Analytical'] && (
            <div className="space-y-3 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {ANALYTICAL_ENTRIES.map((entry) => (
                  <RatioCard
                    key={entry.key}
                    name={entry.name}
                    value={getRatioValue(entry.key)}
                    format={entry.format}
                    description={entry.description}
                    benchmark={entry.benchmark}
                  />
                ))}
              </div>
              <DuPontChart dupont={ratios.dupont} roe={ratios.roe} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
