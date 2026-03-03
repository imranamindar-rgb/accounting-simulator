import type { TAccountData } from '../TransactionAnimator'

interface TAccountStageProps {
  data: TAccountData
}

function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TAccount({
  name,
  debits,
  credits,
}: {
  name: string
  debits: number[]
  credits: number[]
}) {
  const totalDebits = debits.reduce((s, v) => s + v, 0)
  const totalCredits = credits.reduce((s, v) => s + v, 0)
  const balance = totalDebits - totalCredits
  const maxRows = Math.max(debits.length, credits.length, 1)

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        minWidth: '10rem',
        flex: '1 1 10rem',
        maxWidth: '16rem',
        background: 'var(--color-surface)',
      }}
    >
      {/* Account name header */}
      <div
        style={{
          padding: '0.5rem 0.75rem',
          borderBottom: '2px solid var(--color-accent)',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          background: 'rgba(74,10,18,0.04)',
        }}
      >
        {name}
      </div>

      {/* Dr / Cr column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-base)',
        }}
      >
        <div
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#1e3a5f',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
          }}
        >
          Dr
        </div>
        <div style={{ background: 'var(--color-border)' }} />
        <div
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#7c2d12',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
          }}
        >
          Cr
        </div>
      </div>

      {/* Values rows */}
      {Array.from({ length: maxRows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            borderBottom: i < maxRows - 1 ? '1px solid rgba(232,213,183,0.5)' : 'none',
          }}
        >
          <div
            style={{
              padding: '0.3rem 0.5rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              color: '#1e3a5f',
              textAlign: 'right',
              minHeight: '1.6rem',
            }}
          >
            {debits[i] !== undefined ? formatAmount(debits[i]) : ''}
          </div>
          <div style={{ background: 'var(--color-border)' }} />
          <div
            style={{
              padding: '0.3rem 0.5rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              color: '#7c2d12',
              textAlign: 'right',
              minHeight: '1.6rem',
            }}
          >
            {credits[i] !== undefined ? formatAmount(credits[i]) : ''}
          </div>
        </div>
      ))}

      {/* Balance footer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          borderTop: '2px solid var(--color-border)',
          background: 'var(--color-base)',
        }}
      >
        <div
          style={{
            padding: '0.3rem 0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#1e3a5f',
            textAlign: 'right',
          }}
        >
          {balance > 0 ? formatAmount(balance) : ''}
        </div>
        <div style={{ background: 'var(--color-border)' }} />
        <div
          style={{
            padding: '0.3rem 0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#7c2d12',
            textAlign: 'right',
          }}
        >
          {balance < 0 ? formatAmount(Math.abs(balance)) : ''}
        </div>
      </div>
    </div>
  )
}

export default function TAccountStage({ data }: TAccountStageProps) {
  return (
    <div style={{ padding: '1rem 0' }}>
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        T-Accounts
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {data.accounts.map((account, i) => (
          <TAccount
            key={i}
            name={account.name}
            debits={account.debits}
            credits={account.credits}
          />
        ))}
      </div>
    </div>
  )
}
