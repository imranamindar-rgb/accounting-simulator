import type { TransactionTemplate } from '../../engines/types'

interface JournalEntryPreviewProps {
  template: TransactionTemplate
  params: Record<string, number>
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function JournalEntryPreview({ template, params }: JournalEntryPreviewProps) {
  const hasValues = template.debits.some((d) => params[d.param] > 0)

  if (!hasValues) {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: 'var(--color-base)',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
        }}
      >
        Enter amounts above to preview the journal entry.
      </div>
    )
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'var(--color-base)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="mb-2 font-semibold"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.85rem',
          color: 'var(--color-text)',
        }}
      >
        Journal Entry Preview
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: '1.8',
        }}
      >
        {/* Debit entries */}
        {template.debits.map((d, i) => {
          const amount = params[d.param] || 0
          return (
            <div key={`dr-${i}`} className="flex justify-between">
              <span style={{ color: '#1a6b3c' }}>
                Dr. {d.account}
              </span>
              <span style={{ color: '#1a6b3c', fontWeight: 600 }}>
                {formatCurrency(amount)}
              </span>
            </div>
          )
        })}

        {/* Credit entries — indented */}
        {template.credits.map((c, i) => {
          const amount = params[c.param] || 0
          return (
            <div key={`cr-${i}`} className="flex justify-between" style={{ paddingLeft: '1.5rem' }}>
              <span style={{ color: '#a0522d' }}>
                Cr. {c.account}
              </span>
              <span style={{ color: '#a0522d', fontWeight: 600 }}>
                {formatCurrency(amount)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Balance check */}
      {(() => {
        const totalDebits = template.debits.reduce((sum, d) => sum + (params[d.param] || 0), 0)
        const totalCredits = template.credits.reduce((sum, c) => sum + (params[c.param] || 0), 0)
        const balanced = totalDebits === totalCredits && totalDebits > 0
        return (
          <div
            className="mt-2 pt-2 text-right"
            style={{
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: balanced ? 'var(--color-green)' : '#B91C1C',
            }}
          >
            {balanced ? 'Balanced' : `Debits ${formatCurrency(totalDebits)} / Credits ${formatCurrency(totalCredits)}`}
          </div>
        )
      })()}
    </div>
  )
}
