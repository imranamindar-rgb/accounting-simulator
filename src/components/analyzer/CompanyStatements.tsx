/**
 * CompanyStatements -- two-column financial statements display.
 *
 * Reads bs and is from useAnalyzerStore and renders:
 *   Left:  Balance Sheet (Current Assets, Non-Current Assets, Total Assets,
 *          Current Liabilities, Non-Current Liabilities, Equity, Total L+E)
 *   Right: Income Statement (Revenue, COGS, Gross Profit, Operating Expenses,
 *          Operating Income, Net Income)
 *
 * Large numbers are formatted as $XXX.XM (millions).
 */

import type { AccountLine } from '../../engines/types'
import { useAnalyzerStore } from '../../store/analyzerStore'

// ── Formatting ───────────────────────────────────────────────────────

function fmt(n: number): string {
  const m = n / 1_000_000
  return `$${m.toFixed(1)}M`
}

// ── Section sub-component ────────────────────────────────────────────

interface SectionProps {
  title: string
  lines: AccountLine[]
  totalLabel: string
  totalValue: number
  titleColor?: string
}

function Section({ title, lines, totalLabel, totalValue, titleColor }: SectionProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section title */}
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: titleColor ?? 'var(--color-text-muted)',
          marginBottom: 6,
          paddingBottom: 4,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {title}
      </div>

      {/* Line items */}
      {lines.length > 0 ? (
        lines.map((line) => (
          <div
            key={line.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '3px 0',
            }}
          >
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text)',
                paddingLeft: 8,
              }}
            >
              {line.name}
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text)',
              }}
            >
              {fmt(line.balance)}
            </span>
          </div>
        ))
      ) : (
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            paddingLeft: 8,
            paddingTop: 2,
          }}
        >
          No items
        </div>
      )}

      {/* Total row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '5px 0 0',
          marginTop: 4,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          {totalLabel}
        </span>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
          }}
        >
          {fmt(totalValue)}
        </span>
      </div>
    </div>
  )
}

// ── Helper: derived income statement lines ───────────────────────────

interface FlatLineProps {
  label: string
  value: number
  bold?: boolean
  indent?: boolean
  accent?: boolean
}

function FlatLine({ label, value, bold, indent, accent }: FlatLineProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '3px 0',
        borderTop: bold ? '1px solid var(--color-border)' : undefined,
        marginTop: bold ? 4 : undefined,
        paddingTop: bold ? 5 : undefined,
      }}
    >
      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: bold ? 700 : 400,
          color: accent ? 'var(--color-accent)' : 'var(--color-text)',
          paddingLeft: indent ? 8 : 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: bold ? 700 : 400,
          fontFamily: 'var(--font-mono)',
          color: accent ? 'var(--color-accent)' : value < 0 ? '#C0392B' : 'var(--color-text)',
        }}
      >
        {fmt(value)}
      </span>
    </div>
  )
}

// ── Statement panels ─────────────────────────────────────────────────

function StatementPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '18px 20px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 16,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export default function CompanyStatements() {
  const bs = useAnalyzerStore((s) => s.bs)
  const is = useAnalyzerStore((s) => s.is)

  if (!bs || !is) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {/* ── Balance Sheet ── */}
      <StatementPanel title="Balance Sheet">
        <Section
          title="Current Assets"
          lines={bs.currentAssets}
          totalLabel="Total Current Assets"
          totalValue={bs.totalCurrentAssets}
        />
        <Section
          title="Non-Current Assets"
          lines={bs.noncurrentAssets}
          totalLabel="Total Non-Current Assets"
          totalValue={bs.totalNoncurrentAssets}
        />

        {/* Total Assets — standalone bold row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            marginBottom: 16,
            borderTop: '2px solid var(--color-text)',
            borderBottom: '2px solid var(--color-text)',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Total Assets
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text)',
            }}
          >
            {fmt(bs.totalAssets)}
          </span>
        </div>

        <Section
          title="Current Liabilities"
          lines={bs.currentLiabilities}
          totalLabel="Total Current Liabilities"
          totalValue={bs.totalCurrentLiabilities}
        />
        <Section
          title="Non-Current Liabilities"
          lines={bs.noncurrentLiabilities}
          totalLabel="Total Non-Current Liabilities"
          totalValue={bs.totalNoncurrentLiabilities}
        />
        <Section
          title="Equity"
          lines={bs.equity}
          totalLabel="Total Equity"
          totalValue={bs.totalEquity}
        />

        {/* Total L+E */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderTop: '2px solid var(--color-text)',
            borderBottom: '2px solid var(--color-text)',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Total Liabilities + Equity
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text)',
            }}
          >
            {fmt(bs.totalLiabilitiesAndEquity)}
          </span>
        </div>

        {/* Balance check badge */}
        {!bs.isBalanced && (
          <div
            style={{
              marginTop: 10,
              padding: '4px 10px',
              borderRadius: 4,
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.75rem',
            }}
          >
            Note: Balance sheet does not balance — SEC data may be incomplete.
          </div>
        )}
      </StatementPanel>

      {/* ── Income Statement ── */}
      <StatementPanel title="Income Statement">
        {/* Revenue */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            Revenue
          </div>
          {is.revenue.map((line) => (
            <FlatLine key={line.name} label={line.name} value={line.balance} indent />
          ))}
          <FlatLine label="Total Revenue" value={is.totalRevenue} bold />
        </div>

        {/* Cost of Revenue */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            Cost of Revenue
          </div>
          {is.cogs.map((line) => (
            <FlatLine key={line.name} label={line.name} value={line.balance} indent />
          ))}
          <FlatLine label="Total COGS" value={is.totalCOGS} bold />
        </div>

        {/* Gross Profit */}
        <FlatLine label="Gross Profit" value={is.grossProfit} bold />

        {/* Operating Expenses */}
        <div style={{ margin: '16px 0' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            Operating Expenses
          </div>
          {is.operatingExpenses.map((line) => (
            <FlatLine key={line.name} label={line.name} value={line.balance} indent />
          ))}
        </div>

        {/* Operating Income */}
        <FlatLine label="Operating Income" value={is.operatingIncome} bold />

        {/* Other / Interest */}
        {is.otherExpenses.length > 0 && (
          <div style={{ margin: '12px 0' }}>
            {is.otherExpenses.map((line) => (
              <FlatLine key={line.name} label={line.name} value={line.balance} indent />
            ))}
          </div>
        )}

        {/* Net Income */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            marginTop: 8,
            borderTop: '2px solid var(--color-text)',
            borderBottom: '2px solid var(--color-text)',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Net Income
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
              color: is.netIncome < 0 ? '#C0392B' : '#2D6A4F',
            }}
          >
            {fmt(is.netIncome)}
          </span>
        </div>
      </StatementPanel>
    </div>
  )
}
