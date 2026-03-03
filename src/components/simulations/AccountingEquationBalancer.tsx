import { useState } from 'react'

const ALL_ACCOUNTS = [
  { name: 'Cash', cat: 'asset' as const },
  { name: 'Accounts Receivable', cat: 'asset' as const },
  { name: 'Inventory', cat: 'asset' as const },
  { name: 'PP&E', cat: 'asset' as const },
  { name: 'Prepaid Expenses', cat: 'asset' as const },
  { name: 'Accounts Payable', cat: 'liability' as const },
  { name: 'Deferred Revenue', cat: 'liability' as const },
  { name: 'Notes Payable', cat: 'liability' as const },
  { name: 'Common Stock', cat: 'equity' as const },
  { name: 'Retained Earnings', cat: 'equity' as const },
]

type Cat = 'asset' | 'liability' | 'equity'
const accountMap: Record<string, Cat> = Object.fromEntries(ALL_ACCOUNTS.map(a => [a.name, a.cat]))

const PRESETS = [
  { label: 'Issue Stock', debit: 'Cash', credit: 'Common Stock', amount: 100000 },
  { label: 'Bank Loan', debit: 'Cash', credit: 'Notes Payable', amount: 200000 },
  { label: 'Buy Inventory', debit: 'Inventory', credit: 'Accounts Payable', amount: 50000 },
  { label: 'Buy PP&E (cash)', debit: 'PP&E', credit: 'Cash', amount: 80000 },
  { label: 'Earn Revenue', debit: 'Cash', credit: 'Retained Earnings', amount: 30000 },
  { label: 'Pay AP', debit: 'Accounts Payable', credit: 'Cash', amount: 20000 },
]

interface JEntry { id: number; debit: string; credit: string; amount: number }

export default function AccountingEquationBalancer() {
  const [entries, setEntries] = useState<JEntry[]>([])
  const [debit, setDebit] = useState('Cash')
  const [credit, setCredit] = useState('Common Stock')
  const [amount, setAmount] = useState(100000)

  const balances: Record<string, number> = Object.fromEntries(ALL_ACCOUNTS.map(a => [a.name, 0]))
  entries.forEach(e => {
    const dc = accountMap[e.debit], cc = accountMap[e.credit]
    balances[e.debit] += e.amount * (dc === 'asset' ? 1 : -1)
    balances[e.credit] += e.amount * (cc === 'asset' ? -1 : 1)
  })

  const assets = ALL_ACCOUNTS.filter(a => a.cat === 'asset').reduce((s, a) => s + balances[a.name], 0)
  const liabilities = ALL_ACCOUNTS.filter(a => a.cat === 'liability').reduce((s, a) => s + balances[a.name], 0)
  const equity = ALL_ACCOUNTS.filter(a => a.cat === 'equity').reduce((s, a) => s + balances[a.name], 0)
  const balanced = entries.length === 0 || Math.abs(assets - (liabilities + equity)) < 0.01

  const post = (da = debit, ca = credit, amt = amount) => {
    if (da === ca || amt <= 0) return
    setEntries(es => [...es, { id: es.length + 1, debit: da, credit: ca, amount: amt }])
  }

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString()}`
  const formatNum = (n: number) => `$${n.toLocaleString()}`

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setDebit(p.debit); setCredit(p.credit); setAmount(p.amount) }}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px auto', gap: '0.75rem', alignItems: 'end', marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        {[{ label: 'Debit (Dr)', val: debit, set: setDebit }, { label: 'Credit (Cr)', val: credit, set: setCredit }].map(({ label, val, set }) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
            <select value={val} onChange={e => set(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
              {ALL_ACCOUNTS.map(a => <option key={a.name}>{a.name}</option>)}
            </select>
          </div>
        ))}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Amount $</div>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
        </div>
        <button onClick={() => post()} style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          Post
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { label: 'Assets', accounts: ALL_ACCOUNTS.filter(a => a.cat === 'asset'), total: assets, color: '#1e3a5f' },
          { label: 'Liabilities', accounts: ALL_ACCOUNTS.filter(a => a.cat === 'liability'), total: liabilities, color: '#7c2d12' },
          { label: 'Equity', accounts: ALL_ACCOUNTS.filter(a => a.cat === 'equity'), total: equity, color: '#1b4332' },
        ].map(({ label, accounts, total, color }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: `1px solid ${color}30`, borderRadius: '0.625rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>{label}</div>
            {accounts.map(a => (
              <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{a.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: balances[a.name] !== 0 ? 700 : 400, color: balances[a.name] !== 0 ? color : 'var(--color-text-muted)' }}>
                  {balances[a.name] !== 0 ? fmt(balances[a.name]) : '—'}
                </span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${color}30`, marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.875rem 1.25rem', background: balanced ? '#1b433212' : '#dc262612', border: `1px solid ${balanced ? '#1b433240' : '#dc262640'}`, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: balanced ? '#1b4332' : '#dc2626' }}>
          {formatNum(assets)} Assets = {formatNum(liabilities + equity)} L + E
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: balanced ? '#1b4332' : '#dc2626' }}>
          {entries.length === 0 ? 'Post entries to begin' : balanced ? '✓ BALANCED' : '✗ OUT OF BALANCE'}
        </span>
      </div>

      {entries.length > 0 && (
        <div style={{ padding: '0.875rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Journal Entries ({entries.length})</span>
            <button onClick={() => setEntries([])} style={{ padding: '0.15rem 0.6rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>
          </div>
          {entries.map((e, i) => (
            <div key={e.id} style={{ fontSize: '0.78rem', color: 'var(--color-text)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>#{i + 1}</span> Dr {e.debit} / Cr {e.credit} — {fmt(e.amount)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
