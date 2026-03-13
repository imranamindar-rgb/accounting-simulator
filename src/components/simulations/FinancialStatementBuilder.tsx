import { useState } from 'react'

type Statement = 'balance-sheet' | 'income-statement' | 'equity' | null

interface Account {
  name: string
  correctStatement: Statement
  normalBalance: 'debit' | 'credit'
  amount: number
}

const ACCOUNTS: Account[] = [
  { name: 'Cash', correctStatement: 'balance-sheet', normalBalance: 'debit', amount: 45000 },
  { name: 'Accounts Receivable', correctStatement: 'balance-sheet', normalBalance: 'debit', amount: 28000 },
  { name: 'Inventory', correctStatement: 'balance-sheet', normalBalance: 'debit', amount: 35000 },
  { name: 'Equipment', correctStatement: 'balance-sheet', normalBalance: 'debit', amount: 120000 },
  { name: 'Accum. Depreciation', correctStatement: 'balance-sheet', normalBalance: 'credit', amount: 24000 },
  { name: 'Accounts Payable', correctStatement: 'balance-sheet', normalBalance: 'credit', amount: 19000 },
  { name: 'Notes Payable', correctStatement: 'balance-sheet', normalBalance: 'credit', amount: 50000 },
  { name: 'Common Stock', correctStatement: 'equity', normalBalance: 'credit', amount: 80000 },
  { name: 'Retained Earnings', correctStatement: 'equity', normalBalance: 'credit', amount: 15000 },
  { name: 'Dividends', correctStatement: 'equity', normalBalance: 'debit', amount: 8000 },
  { name: 'Service Revenue', correctStatement: 'income-statement', normalBalance: 'credit', amount: 175000 },
  { name: 'COGS', correctStatement: 'income-statement', normalBalance: 'debit', amount: 68000 },
  { name: 'Salaries Expense', correctStatement: 'income-statement', normalBalance: 'debit', amount: 42000 },
  { name: 'Rent Expense', correctStatement: 'income-statement', normalBalance: 'debit', amount: 12000 },
  { name: 'Depreciation Expense', correctStatement: 'income-statement', normalBalance: 'debit', amount: 6000 },
  { name: 'Interest Expense', correctStatement: 'income-statement', normalBalance: 'debit', amount: 4000 },
]

const STATEMENTS: { id: Statement; label: string; color: string }[] = [
  { id: 'balance-sheet', label: 'Balance Sheet', color: '#1e3a5f' },
  { id: 'income-statement', label: 'Income Statement', color: '#7c2d12' },
  { id: 'equity', label: 'Statement of Equity', color: '#1b4332' },
]

export default function FinancialStatementBuilder() {
  const [assignments, setAssignments] = useState<Record<string, Statement>>(
    Object.fromEntries(ACCOUNTS.map(a => [a.name, null]))
  )
  const [checked, setChecked] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const assign = (accountName: string, statement: Statement) => {
    setAssignments(prev => ({ ...prev, [accountName]: statement }))
    setSelectedAccount(null)
    setChecked(false)
  }

  const unassign = (accountName: string) => {
    setAssignments(prev => ({ ...prev, [accountName]: null }))
    setChecked(false)
  }

  const getStatus = (accountName: string): 'correct' | 'incorrect' | 'unassigned' => {
    const assigned = assignments[accountName]
    if (!assigned) return 'unassigned'
    const account = ACCOUNTS.find(a => a.name === accountName)!
    return assigned === account.correctStatement ? 'correct' : 'incorrect'
  }

  const totalAssigned = ACCOUNTS.filter(a => assignments[a.name] !== null).length
  const totalCorrect = ACCOUNTS.filter(a => getStatus(a.name) === 'correct').length
  const allAssigned = totalAssigned === ACCOUNTS.length
  const score = Math.round((totalCorrect / ACCOUNTS.length) * 100)

  const bsAccounts = ACCOUNTS.filter(a => assignments[a.name] === 'balance-sheet')
  const bsAssets = bsAccounts.filter(a => a.normalBalance === 'debit').reduce((s, a) => s + a.amount, 0)
  const bsContraAssets = bsAccounts.filter(a => a.name === 'Accum. Depreciation').reduce((s, a) => s + a.amount, 0)
  const bsLiabilities = bsAccounts.filter(a => a.normalBalance === 'credit' && !['Accum. Depreciation'].includes(a.name)).reduce((s, a) => s + a.amount, 0)
  const totalAssets = bsAssets - bsContraAssets
  const equityTotal = bsLiabilities > 0 ? totalAssets - bsLiabilities : 0

  const unassignedAccounts = ACCOUNTS.filter(a => assignments[a.name] === null)

  const fmt = (n: number) => `$${n.toLocaleString()}`

  const statusColor = (name: string) => {
    if (!checked) return 'var(--color-text)'
    const s = getStatus(name)
    if (s === 'correct') return '#16a34a'
    if (s === 'incorrect') return '#dc2626'
    return 'var(--color-text-muted)'
  }

  const statusBg = (name: string) => {
    if (!checked) return 'transparent'
    const s = getStatus(name)
    if (s === 'correct') return '#16a34a12'
    if (s === 'incorrect') return '#dc262612'
    return 'transparent'
  }

  return (
    <div>
      {/* Unassigned accounts */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Accounts to Classify ({unassignedAccounts.length} remaining)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {unassignedAccounts.map(a => (
            <button
              key={a.name}
              onClick={() => setSelectedAccount(selectedAccount === a.name ? null : a.name)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                border: selectedAccount === a.name ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: selectedAccount === a.name ? 'var(--color-accent)' : 'var(--color-surface)',
                color: selectedAccount === a.name ? '#fff' : 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {a.name} <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6, fontSize: '0.7rem' }}>{fmt(a.amount)}</span>
            </button>
          ))}
          {unassignedAccounts.length === 0 && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>All accounts assigned</span>
          )}
        </div>
      </div>

      {/* Statement target areas */}
      {selectedAccount && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text)' }}>
            Assign <strong>{selectedAccount}</strong> to:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {STATEMENTS.map(st => (
              <button
                key={st.id}
                onClick={() => assign(selectedAccount, st.id)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${st.color}40`,
                  background: `${st.color}12`,
                  color: st.color,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Three statement columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {STATEMENTS.map(st => {
          const assigned = ACCOUNTS.filter(a => assignments[a.name] === st.id)
          return (
            <div key={st.id} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: `1px solid ${st.color}30`, borderRadius: '0.625rem', minHeight: '120px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: st.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                {st.label}
              </div>
              {assigned.length === 0 && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  Click an account above, then assign it here
                </div>
              )}
              {assigned.map(a => (
                <div
                  key={a.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    marginBottom: '0.25rem',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '0.25rem',
                    background: statusBg(a.name),
                  }}
                >
                  <span style={{ color: statusColor(a.name), fontFamily: 'var(--font-body)' }}>
                    {checked && getStatus(a.name) === 'correct' && '~ '}
                    {checked && getStatus(a.name) === 'incorrect' && 'x '}
                    {a.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: statusColor(a.name) }}>
                      {fmt(a.amount)}
                    </span>
                    <button
                      onClick={() => unassign(a.name)}
                      style={{
                        padding: '0 0.3rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Accounting equation bar */}
      <div style={{
        padding: '0.875rem 1.25rem',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
          A = L + E
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {fmt(totalAssets)} = {fmt(bsLiabilities)} + {fmt(equityTotal)}
        </span>
      </div>

      {/* Check and score */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={() => setChecked(true)}
          disabled={!allAssigned}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: allAssigned ? 'var(--color-accent)' : 'var(--color-border)',
            color: allAssigned ? '#fff' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: allAssigned ? 'pointer' : 'not-allowed',
          }}
        >
          Check Answers
        </button>
        <button
          onClick={() => {
            setAssignments(Object.fromEntries(ACCOUNTS.map(a => [a.name, null])))
            setChecked(false)
            setSelectedAccount(null)
          }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        {checked && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: score === 100 ? '#16a34a' : score >= 70 ? 'var(--color-gold)' : '#dc2626',
          }}>
            Score: {totalCorrect}/{ACCOUNTS.length} ({score}%)
          </span>
        )}
      </div>

      {checked && score === 100 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#16a34a12',
          border: '1px solid #16a34a40',
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          color: '#16a34a',
          fontWeight: 600,
        }}>
          Perfect! Every account is on the correct financial statement.
        </div>
      )}
    </div>
  )
}
