import type { TransactionTemplate, LedgerChange, AccountType } from '../../engines/types'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'

interface InsightPanelProps {
  template: TransactionTemplate
  params: Record<string, number>
  changes: LedgerChange[]
}

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Look up the AccountType for an account name via chart of accounts */
function getAccountType(accountName: string): AccountType | undefined {
  const def = CHART_OF_ACCOUNTS.find((a) => a.name === accountName)
  return def?.type
}

function isContra(accountName: string): boolean {
  const def = CHART_OF_ACCOUNTS.find((a) => a.name === accountName)
  return !!def?.contra
}

/** Generate human-readable statement impact narratives */
function generateStatementImpacts(
  changes: LedgerChange[],
  cashFlowCategory: string,
): string[] {
  const impacts: string[] = []

  let totalAssetChange = 0
  let totalLiabilityChange = 0
  let totalEquityChange = 0
  let revenueChange = 0
  let expenseChange = 0
  let cashChange = 0

  for (const change of changes) {
    const type = getAccountType(change.account)
    const delta = change.after - change.before
    const contra = isContra(change.account)

    if (change.account === 'Cash') {
      cashChange += delta
    }

    if (type === 'Asset') {
      totalAssetChange += contra ? -delta : delta
    } else if (type === 'Liability') {
      totalLiabilityChange += contra ? -delta : delta
    } else if (type === 'Equity') {
      totalEquityChange += contra ? -delta : delta
    } else if (type === 'Revenue') {
      revenueChange += delta
    } else if (type === 'Expense') {
      expenseChange += delta
    }
  }

  // Balance Sheet impact
  if (totalAssetChange !== 0) {
    const dir = totalAssetChange > 0 ? 'increased' : 'decreased'
    impacts.push(`Balance Sheet: Total assets ${dir} by ${formatCurrency(totalAssetChange)}`)
  }
  if (totalLiabilityChange !== 0) {
    const dir = totalLiabilityChange > 0 ? 'increased' : 'decreased'
    impacts.push(`Balance Sheet: Total liabilities ${dir} by ${formatCurrency(totalLiabilityChange)}`)
  }
  if (totalEquityChange !== 0) {
    const dir = totalEquityChange > 0 ? 'increased' : 'decreased'
    impacts.push(`Balance Sheet: Total equity ${dir} by ${formatCurrency(totalEquityChange)}`)
  }

  // Income Statement impact
  if (revenueChange !== 0) {
    impacts.push(`Income Statement: Revenue increased by ${formatCurrency(revenueChange)}, increasing net income`)
  }
  if (expenseChange !== 0) {
    impacts.push(`Income Statement: Expenses increased by ${formatCurrency(expenseChange)}, decreasing net income`)
  }

  // Cash Flow impact
  if (cashChange !== 0) {
    const flowDir = cashChange > 0 ? 'inflow' : 'outflow'
    const catLabel =
      cashFlowCategory === 'operating'
        ? 'Operating'
        : cashFlowCategory === 'investing'
          ? 'Investing'
          : cashFlowCategory === 'financing'
            ? 'Financing'
            : 'Operating'
    impacts.push(`Cash Flow: ${catLabel} cash ${flowDir} of ${formatCurrency(cashChange)}`)
  } else if (changes.length > 0) {
    impacts.push('Cash Flow: No cash impact (non-cash transaction)')
  }

  return impacts
}

export function InsightPanel({ template, params, changes }: InsightPanelProps) {
  const impacts = generateStatementImpacts(changes, template.cashFlowCategory)

  // Compute total amount for the summary
  const totalAmount = template.debits.reduce((sum, d) => sum + (params[d.param] || 0), 0)

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          color: '#FAF0D4',
        }}
      >
        <div
          className="font-semibold"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}
        >
          Transaction Recorded
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
          {template.name} &mdash; {formatCurrency(totalAmount)}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Account Changes */}
        <div>
          <div
            className="font-semibold mb-2"
            style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}
          >
            Account Changes
          </div>
          <div className="space-y-1">
            {changes.map((change, i) => {
              const delta = change.after - change.before
              const isIncrease = delta > 0
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded px-3 py-1.5"
                  style={{
                    background: 'var(--color-base)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                    {change.account}
                  </span>
                  <span className="flex items-center gap-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {formatCurrency(change.before)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {'\u2192'}
                    </span>
                    <span
                      style={{
                        color: isIncrease ? 'var(--color-green)' : '#B91C1C',
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(change.after)}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statement Impacts */}
        {impacts.length > 0 && (
          <div>
            <div
              className="font-semibold mb-2"
              style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}
            >
              Statement Impact
            </div>
            <ul className="space-y-1" style={{ fontSize: '0.8rem' }}>
              {impacts.map((impact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1 shrink-0 inline-block rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background:
                        impact.includes('Balance Sheet')
                          ? 'var(--color-accent)'
                          : impact.includes('Income')
                            ? 'var(--color-gold)'
                            : 'var(--color-green)',
                    }}
                  />
                  <span style={{ color: 'var(--color-text)' }}>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div
          className="rounded-lg p-3"
          style={{
            background: '#FFFBF0',
            border: '1px solid #E8D5B7',
            fontSize: '0.8rem',
            color: 'var(--color-text)',
            lineHeight: '1.5',
          }}
        >
          <div
            className="font-semibold mb-1"
            style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}
          >
            Why?
          </div>
          {template.explanation}
        </div>
      </div>
    </div>
  )
}
