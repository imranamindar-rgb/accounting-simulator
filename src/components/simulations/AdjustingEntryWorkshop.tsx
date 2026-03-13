import { useState } from 'react'

interface TrialBalanceAccount {
  name: string
  debit: number
  credit: number
}

interface Adjustment {
  id: number
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
  hint: string
}

const INITIAL_TB: TrialBalanceAccount[] = [
  { name: 'Cash', debit: 24500, credit: 0 },
  { name: 'Accounts Receivable', debit: 12000, credit: 0 },
  { name: 'Supplies', debit: 5200, credit: 0 },
  { name: 'Prepaid Insurance', debit: 6000, credit: 0 },
  { name: 'Equipment', debit: 48000, credit: 0 },
  { name: 'Accumulated Depreciation', debit: 0, credit: 8000 },
  { name: 'Accounts Payable', debit: 0, credit: 7200 },
  { name: 'Unearned Revenue', debit: 0, credit: 4800 },
  { name: 'Common Stock', debit: 0, credit: 50000 },
  { name: 'Retained Earnings', debit: 0, credit: 12000 },
  { name: 'Service Revenue', debit: 0, credit: 38700 },
  { name: 'Salaries Expense', debit: 18000, credit: 0 },
  { name: 'Rent Expense', debit: 7000, credit: 0 },
]

const ADDITIONAL_ACCOUNTS = [
  'Supplies Expense',
  'Insurance Expense',
  'Depreciation Expense',
  'Salaries Payable',
]

const ADJUSTMENTS: Adjustment[] = [
  {
    id: 1,
    description: 'Supplies on hand at end of period: $2,000 (started with $5,200)',
    debitAccount: 'Supplies Expense',
    creditAccount: 'Supplies',
    amount: 3200,
    hint: 'Supplies used = Beginning supplies - Ending supplies on hand',
  },
  {
    id: 2,
    description: 'Accrued salaries owed but not yet paid: $4,500',
    debitAccount: 'Salaries Expense',
    creditAccount: 'Salaries Payable',
    amount: 4500,
    hint: 'Debit the expense, credit the liability for wages earned but unpaid',
  },
  {
    id: 3,
    description: 'Depreciation on equipment for the period: $2,000',
    debitAccount: 'Depreciation Expense',
    creditAccount: 'Accumulated Depreciation',
    amount: 2000,
    hint: 'Debit Depreciation Expense, credit the contra-asset Accumulated Depreciation',
  },
  {
    id: 4,
    description: 'Insurance expired during the period: $1,500',
    debitAccount: 'Insurance Expense',
    creditAccount: 'Prepaid Insurance',
    amount: 1500,
    hint: 'Move the expired portion from the asset to the expense',
  },
  {
    id: 5,
    description: 'Earned $1,800 of previously unearned revenue',
    debitAccount: 'Unearned Revenue',
    creditAccount: 'Service Revenue',
    amount: 1800,
    hint: 'Reduce the liability (debit) and recognize the revenue (credit)',
  },
]

const ALL_ACCOUNT_NAMES = [
  ...INITIAL_TB.map(a => a.name),
  ...ADDITIONAL_ACCOUNTS,
]

interface PostedEntry {
  adjustmentId: number
  debitAccount: string
  creditAccount: string
  amount: number
  correct: boolean
}

export default function AdjustingEntryWorkshop() {
  const [postedEntries, setPostedEntries] = useState<PostedEntry[]>([])
  const [currentAdj, setCurrentAdj] = useState(0)
  const [debitAcct, setDebitAcct] = useState(ALL_ACCOUNT_NAMES[0])
  const [creditAcct, setCreditAcct] = useState(ALL_ACCOUNT_NAMES[1])
  const [entryAmount, setEntryAmount] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [error, setError] = useState('')

  // Build adjusted trial balance
  const adjustedTB: Record<string, { debit: number; credit: number }> = {}
  INITIAL_TB.forEach(a => { adjustedTB[a.name] = { debit: a.debit, credit: a.credit } })
  ADDITIONAL_ACCOUNTS.forEach(name => { adjustedTB[name] = { debit: 0, credit: 0 } })

  postedEntries.forEach(e => {
    if (adjustedTB[e.debitAccount]) adjustedTB[e.debitAccount].debit += e.amount
    if (adjustedTB[e.creditAccount]) adjustedTB[e.creditAccount].credit += e.amount
  })

  const totalDebits = Object.values(adjustedTB).reduce((s, a) => s + a.debit, 0)
  const totalCredits = Object.values(adjustedTB).reduce((s, a) => s + a.credit, 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  const correctCount = postedEntries.filter(e => e.correct).length
  const allDone = currentAdj >= ADJUSTMENTS.length

  const postEntry = () => {
    setError('')
    const amt = Number(entryAmount)
    if (!amt || amt <= 0) { setError('Enter a positive amount'); return }
    if (debitAcct === creditAcct) { setError('Debit and credit accounts must differ'); return }

    const adj = ADJUSTMENTS[currentAdj]
    const correct = debitAcct === adj.debitAccount && creditAcct === adj.creditAccount && Math.abs(amt - adj.amount) < 0.01

    setPostedEntries(prev => [...prev, {
      adjustmentId: adj.id,
      debitAccount: debitAcct,
      creditAccount: creditAcct,
      amount: amt,
      correct,
    }])

    setCurrentAdj(prev => prev + 1)
    setEntryAmount('')
    setShowHint(false)
    setDebitAcct(ALL_ACCOUNT_NAMES[0])
    setCreditAcct(ALL_ACCOUNT_NAMES[1])
  }

  const reset = () => {
    setPostedEntries([])
    setCurrentAdj(0)
    setEntryAmount('')
    setShowHint(false)
    setError('')
    setDebitAcct(ALL_ACCOUNT_NAMES[0])
    setCreditAcct(ALL_ACCOUNT_NAMES[1])
  }

  const fmt = (n: number) => n === 0 ? '—' : `$${n.toLocaleString()}`

  return (
    <div>
      {/* Current adjustment scenario */}
      {!allDone && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            Adjustment {currentAdj + 1} of {ADJUSTMENTS.length}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.75rem' }}>
            {ADJUSTMENTS[currentAdj].description}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: '0.75rem', alignItems: 'end', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Debit (Dr)</div>
              <select value={debitAcct} onChange={e => setDebitAcct(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                {ALL_ACCOUNT_NAMES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Credit (Cr)</div>
              <select value={creditAcct} onChange={e => setCreditAcct(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                {ALL_ACCOUNT_NAMES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Amount $</div>
              <input type="number" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={postEntry} style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Post Entry
            </button>
            <button onClick={() => setShowHint(!showHint)} style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', cursor: 'pointer' }}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#dc2626' }}>{error}</div>
          )}
          {showHint && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--color-gold)', borderRadius: '0.375rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.85 }}>
              {ADJUSTMENTS[currentAdj].hint}
            </div>
          )}
        </div>
      )}

      {/* Posted entries log */}
      {postedEntries.length > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Posted Adjustments ({correctCount}/{postedEntries.length} correct)
            </span>
            <button onClick={reset} style={{ padding: '0.15rem 0.6rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', cursor: 'pointer' }}>
              Reset All
            </button>
          </div>
          {postedEntries.map((e, i) => (
            <div key={i} style={{
              fontSize: '0.78rem',
              marginBottom: '0.3rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              background: e.correct ? '#16a34a12' : '#dc262612',
              color: e.correct ? '#16a34a' : '#dc2626',
            }}>
              <span style={{ opacity: 0.6 }}>#{i + 1}</span>{' '}
              {e.correct ? '~' : 'x'} Dr {e.debitAccount} / Cr {e.creditAccount} — ${e.amount.toLocaleString()}
              {!e.correct && (
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  {' '}(expected: Dr {ADJUSTMENTS[i].debitAccount} / Cr {ADJUSTMENTS[i].creditAccount} — ${ADJUSTMENTS[i].amount.toLocaleString()})
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Adjusted Trial Balance */}
      <div style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
          {postedEntries.length > 0 ? 'Adjusted' : 'Unadjusted'} Trial Balance
        </div>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', marginBottom: '0.35rem', paddingBottom: '0.35rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Account</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Debit</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Credit</span>
        </div>

        {/* Account rows */}
        {ALL_ACCOUNT_NAMES.map(name => {
          const row = adjustedTB[name]
          if (!row || (row.debit === 0 && row.credit === 0)) return null
          return (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text)' }}>{name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text)', textAlign: 'right' }}>{row.debit > 0 ? fmt(row.debit) : ''}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text)', textAlign: 'right' }}>{row.credit > 0 ? fmt(row.credit) : ''}</span>
            </div>
          )
        })}

        {/* Totals row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--color-border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>Totals</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: isBalanced ? '#1b4332' : '#dc2626', textAlign: 'right' }}>{fmt(totalDebits)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: isBalanced ? '#1b4332' : '#dc2626', textAlign: 'right' }}>{fmt(totalCredits)}</span>
        </div>
      </div>

      {/* Balance indicator */}
      <div style={{
        padding: '0.75rem 1rem',
        background: isBalanced ? '#1b433212' : '#dc262612',
        border: `1px solid ${isBalanced ? '#1b433240' : '#dc262640'}`,
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: isBalanced ? '#1b4332' : '#dc2626' }}>
          Debits: {fmt(totalDebits)} | Credits: {fmt(totalCredits)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: isBalanced ? '#1b4332' : '#dc2626' }}>
          {isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
        </span>
      </div>

      {allDone && (
        <div style={{
          padding: '0.75rem 1rem',
          background: correctCount === ADJUSTMENTS.length ? '#16a34a12' : '#7c2d1212',
          border: `1px solid ${correctCount === ADJUSTMENTS.length ? '#16a34a40' : '#7c2d1240'}`,
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: correctCount === ADJUSTMENTS.length ? '#16a34a' : '#7c2d12',
        }}>
          {correctCount === ADJUSTMENTS.length
            ? 'All adjusting entries posted correctly! The adjusted trial balance is complete.'
            : `${correctCount} of ${ADJUSTMENTS.length} adjustments correct. Click Reset All to try again.`}
        </div>
      )}
    </div>
  )
}
