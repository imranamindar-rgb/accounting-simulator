/**
 * CompanyRatios -- financial ratios grouped into 4 sections.
 *
 * Reads ratios from useAnalyzerStore and renders:
 *   Profitability, Liquidity, Leverage, Efficiency
 * using the existing RatioCard component.
 */

import RatioCard from '../analysis/RatioCard'
import type { RatioCardProps } from '../analysis/RatioCard'
import { useAnalyzerStore } from '../../store/analyzerStore'
import type { FinancialRatios } from '../../engines/RatioCalculator'

// ── Section configuration ────────────────────────────────────────────

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
        description: "Return on shareholders' equity",
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
    title: 'Leverage',
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

// ── Helpers ──────────────────────────────────────────────────────────

function getRatioValue(ratios: FinancialRatios, key: keyof FinancialRatios): number | null {
  const val = ratios[key]
  // dupont is an object, not a number — skip it
  if (typeof val === 'object' && val !== null) return null
  return val
}

// ── Component ────────────────────────────────────────────────────────

export default function CompanyRatios() {
  const ratios = useAnalyzerStore((s) => s.ratios)

  if (!ratios) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              paddingBottom: 6,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              {section.title}
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
              }}
            >
              ({section.entries.length})
            </span>
          </div>

          {/* Ratio cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {section.entries.map((entry) => (
              <RatioCard
                key={entry.key}
                name={entry.name}
                value={getRatioValue(ratios, entry.key)}
                format={entry.format}
                description={entry.description}
                benchmark={entry.benchmark}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
