import type { JournalData } from '../TransactionAnimator'

interface JournalStageProps {
  data: JournalData
}

function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function JournalStage({ data }: JournalStageProps) {
  const totalDebits = data.entries.reduce((sum, e) => sum + (e.debit ?? 0), 0)
  const totalCredits = data.entries.reduce((sum, e) => sum + (e.credit ?? 0), 0)

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Date */}
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          marginBottom: '0.75rem',
          letterSpacing: '0.05em',
        }}
      >
        {data.date}
      </div>

      {/* Journal table */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 7rem 7rem',
            background: 'var(--color-base)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0.5rem 1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Account
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1e3a5f',
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
            }}
          >
            Debit
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#7c2d12',
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
            }}
          >
            Credit
          </div>
        </div>

        {/* Entry rows */}
        {data.entries.map((entry, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 7rem 7rem',
              padding: '0.5rem 1rem',
              borderBottom:
                i < data.entries.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                paddingLeft: entry.credit !== undefined ? '1.5rem' : 0,
              }}
            >
              {entry.account}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: '#1e3a5f',
                textAlign: 'right',
                fontWeight: entry.debit !== undefined ? 600 : 400,
              }}
            >
              {entry.debit !== undefined ? formatAmount(entry.debit) : ''}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: '#7c2d12',
                textAlign: 'right',
                fontWeight: entry.credit !== undefined ? 600 : 400,
              }}
            >
              {entry.credit !== undefined ? formatAmount(entry.credit) : ''}
            </div>
          </div>
        ))}

        {/* Totals row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 7rem 7rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-base)',
            borderTop: '2px solid var(--color-border)',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              color: '#1e3a5f',
              textAlign: 'right',
              fontWeight: 700,
            }}
          >
            {formatAmount(totalDebits)}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              color: '#7c2d12',
              textAlign: 'right',
              fontWeight: 700,
            }}
          >
            {formatAmount(totalCredits)}
          </div>
        </div>
      </div>

      {/* Memo */}
      <div
        style={{
          marginTop: '0.625rem',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.5,
        }}
      >
        Memo: {data.memo}
      </div>
    </div>
  )
}
