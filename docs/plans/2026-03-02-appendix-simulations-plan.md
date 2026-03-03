# Appendix + Chapter Simulations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic SimulationPlayer stubs in ch1–7 Zone2 with 7 dedicated interactive simulations, extract ch8–10 Zone2 content into reusable components, add a 3-part Appendix (all sims / all cases / statements simulator), and add "Designed by Imran Dar" attribution to Home and a global footer.

**Architecture:** Each new simulation is a self-contained React component in `src/components/simulations/` with no routing dependency. Zone2 files wrap them in SimulationWrapper. AppendixPage imports all 10 simulation components directly for A1. A2 maps over FRAUD_CASES. A3 renders StatementsPage inline.

**Tech Stack:** React 19, TypeScript, React Router DOM 7, Zustand 5, Vite 7. CSS via inline styles using existing custom properties (`--color-base`, `--color-accent`, etc.).

---

### Task 1: Ch1 Simulation — AccountingEquationBalancer

**Files:**
- Create: `src/components/simulations/AccountingEquationBalancer.tsx`

**Step 1: Create the component**

```tsx
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
  const [nextId, setNextId] = useState(1)

  // Compute running balances
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
    setEntries(es => [...es, { id: nextId, debit: da, credit: ca, amount: amt }])
    setNextId(n => n + 1)
  }

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString()}`

  return (
    <div>
      {/* Presets */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setDebit(p.debit); setCredit(p.credit); setAmount(p.amount) }}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Entry form */}
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

      {/* Balance sheet columns */}
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

      {/* Equation banner */}
      <div style={{ padding: '0.875rem 1.25rem', background: balanced ? '#1b433212' : '#dc262612', border: `1px solid ${balanced ? '#1b433240' : '#dc262640'}`, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: balanced ? '#1b4332' : '#dc2626' }}>
          {fmt(assets)} Assets = {fmt(liabilities)} Liabilities + {fmt(equity)} Equity
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: balanced ? '#1b4332' : '#dc2626' }}>
          {entries.length === 0 ? 'Post entries to begin' : balanced ? '✓ BALANCED' : '✗ OUT OF BALANCE'}
        </span>
      </div>

      {/* Entry log */}
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
```

**Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 2: Ch2 Simulation — RevenueRecognitionTimer

**Files:**
- Create: `src/components/simulations/RevenueRecognitionTimer.tsx`

```tsx
import { useState } from 'react'

type ScenarioKey = 'product' | 'subscription' | 'construction'

const SCENARIOS: Record<ScenarioKey, { label: string; description: string; periods: number; periodLabel: string }> = {
  product: {
    label: 'Product Sale',
    description: 'Customer pays upfront ($100K), product ships in period 2. Revenue recognized at delivery (point-in-time).',
    periods: 2,
    periodLabel: 'Period',
  },
  subscription: {
    label: 'Annual Subscription',
    description: 'Customer pays $120K upfront for 12-month SaaS license. Revenue recognized $10K/month (over-time).',
    periods: 12,
    periodLabel: 'Month',
  },
  construction: {
    label: 'Construction Contract',
    description: '$15M fixed-price contract. Recognized by percentage of completion each year.',
    periods: 3,
    periodLabel: 'Year',
  },
}

function getState(scenario: ScenarioKey, period: number) {
  if (scenario === 'product') {
    return {
      cash: 100000,
      revenue: period >= 2 ? 100000 : 0,
      deferred: period < 2 ? 100000 : 0,
    }
  }
  if (scenario === 'subscription') {
    return {
      cash: 120000,
      revenue: period * 10000,
      deferred: 120000 - period * 10000,
    }
  }
  // construction: cumulative % per year: 30%, 80%, 100%
  const pcts = [0.3, 0.8, 1.0]
  const revenue = 15000000 * pcts[Math.min(period - 1, 2)]
  const billedCumulative = [5000000, 11000000, 15000000][Math.min(period - 1, 2)]
  return {
    cash: billedCumulative,
    revenue,
    deferred: 0,
  }
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{fmt(value)}</span>
      </div>
      <div style={{ height: '12px', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '6px', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

export default function RevenueRecognitionTimer() {
  const [scenario, setScenario] = useState<ScenarioKey>('product')
  const [period, setPeriod] = useState(1)
  const s = SCENARIOS[scenario]
  const st = getState(scenario, period)
  const maxVal = scenario === 'construction' ? 15000000 : scenario === 'subscription' ? 120000 : 100000

  const handleScenarioChange = (k: ScenarioKey) => { setScenario(k); setPeriod(1) }

  return (
    <div>
      {/* Scenario tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map(k => (
          <button key={k} onClick={() => handleScenarioChange(k)}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: scenario === k ? 'var(--color-accent)' : 'var(--color-surface)', color: scenario === k ? '#fff' : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}>
            {SCENARIOS[k].label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {s.description}
      </div>

      {/* Period slider */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.periodLabel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>{period} of {s.periods}</span>
        </div>
        <input type="range" min={1} max={s.periods} value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
      </div>

      {/* Bars */}
      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <Bar label="Cash Received" value={st.cash} max={maxVal} color="#1e3a5f" />
        <Bar label="Revenue Recognized (P&L)" value={st.revenue} max={maxVal} color="#1b4332" />
        <Bar label="Deferred Revenue (Liability)" value={st.deferred} max={maxVal} color="#7c2d12" />
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Key insight: </strong>
        {st.deferred > 0
          ? `$${(st.deferred / 1000).toFixed(0)}K of cash received has NOT yet been earned — it sits on the balance sheet as Deferred Revenue (a liability).`
          : `All cash received has been earned and recognized as revenue. The P&L matches economic reality.`}
      </div>
    </div>
  )
}
```

**Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 3: Ch3 Simulation — InventoryCostComparator

**Files:**
- Create: `src/components/simulations/InventoryCostComparator.tsx`

```tsx
import { useState } from 'react'

interface Lot { qty: number; price: number }

const DEFAULT_LOTS: Lot[] = [
  { qty: 100, price: 10 },
  { qty: 150, price: 12 },
  { qty: 80, price: 15 },
  { qty: 0, price: 0 },
  { qty: 0, price: 0 },
]

function calcFIFO(lots: Lot[], sold: number) {
  let remaining = sold; let cogs = 0
  const end = lots.map(l => ({ ...l }))
  for (let i = 0; i < end.length && remaining > 0; i++) {
    const take = Math.min(remaining, end[i].qty)
    cogs += take * end[i].price; end[i].qty -= take; remaining -= take
  }
  return { cogs, ending: end.reduce((s, l) => s + l.qty * l.price, 0) }
}

function calcLIFO(lots: Lot[], sold: number) {
  let remaining = sold; let cogs = 0
  const end = lots.map(l => ({ ...l }))
  for (let i = end.length - 1; i >= 0 && remaining > 0; i--) {
    const take = Math.min(remaining, end[i].qty)
    cogs += take * end[i].price; end[i].qty -= take; remaining -= take
  }
  return { cogs, ending: end.reduce((s, l) => s + l.qty * l.price, 0) }
}

function calcWAC(lots: Lot[], sold: number) {
  const totalUnits = lots.reduce((s, l) => s + l.qty, 0)
  const totalCost = lots.reduce((s, l) => s + l.qty * l.price, 0)
  const wac = totalUnits > 0 ? totalCost / totalUnits : 0
  return { cogs: sold * wac, ending: (totalUnits - sold) * wac, wac }
}

export default function InventoryCostComparator() {
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS)
  const [sold, setSold] = useState(200)
  const [sellingPrice, setSellingPrice] = useState(20)

  const activeLots = lots.filter(l => l.qty > 0 && l.price > 0)
  const totalUnits = activeLots.reduce((s, l) => s + l.qty, 0)
  const maxSold = Math.min(sold, totalUnits)

  const fifo = calcFIFO(activeLots, maxSold)
  const lifo = calcLIFO(activeLots, maxSold)
  const wac = calcWAC(activeLots, maxSold)

  const revenue = maxSold * sellingPrice
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const updateLot = (i: number, field: keyof Lot, val: number) => {
    setLots(ls => ls.map((l, j) => j === i ? { ...l, [field]: val } : l))
  }

  return (
    <div>
      {/* Lot inputs */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Purchase Lots (qty + unit cost)</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {lots.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>L{i + 1}</span>
              <input type="number" value={l.qty || ''} placeholder="qty" onChange={e => updateLot(i, 'qty', Number(e.target.value))}
                style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--color-base)', color: 'var(--color-text)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@</span>
              <input type="number" value={l.price || ''} placeholder="$" onChange={e => updateLot(i, 'price', Number(e.target.value))}
                style={{ width: '55px', padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--color-base)', color: 'var(--color-text)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: `Units Sold (max ${totalUnits})`, val: sold, set: setSold, min: 0, max: totalUnits || 999 },
          { label: 'Selling Price / unit ($)', val: sellingPrice, set: setSellingPrice, min: 1, max: 500 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{label}</div>
            <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)', marginBottom: '0.25rem' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {[
          { label: 'FIFO', sub: 'First In, First Out', data: fifo, color: '#1e3a5f' },
          { label: 'LIFO', sub: 'Last In, First Out', data: lifo, color: '#7c2d12' },
          { label: 'WAC', sub: 'Weighted Average Cost', data: wac, color: '#1b4332' },
        ].map(({ label, sub, data, color }) => {
          const gp = revenue - data.cogs
          return (
            <div key={label} style={{ padding: '1rem', background: 'var(--color-surface)', border: `1px solid ${color}30`, borderRadius: '0.625rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '0.125rem' }}>{label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{sub}</div>
              {[
                { label: 'Revenue', val: revenue, bold: false },
                { label: 'COGS', val: data.cogs, bold: false },
                { label: 'Gross Profit', val: gp, bold: true },
                { label: 'Ending Inventory', val: data.ending, bold: false },
              ].map(({ label: l, val, bold }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem', borderTop: bold ? `1px solid ${color}20` : 'none', paddingTop: bold ? '0.3rem' : 0 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: bold ? 700 : 400, color: bold ? color : 'var(--color-text)' }}>{fmt(val)}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Forensic note: </strong>
        {fifo.cogs > lifo.cogs
          ? `In rising price environments, LIFO produces higher COGS (${fmt(lifo.cogs)}) vs FIFO (${fmt(fifo.cogs)}), conserving cash via lower taxes but reporting lower profits. LIFO is banned under IFRS.`
          : `Cost flow assumptions produce identical inventory values when prices are flat.`}
      </div>
    </div>
  )
}
```

---

### Task 4: Ch4 Simulation — DepreciationScheduleBuilder

**Files:**
- Create: `src/components/simulations/DepreciationScheduleBuilder.tsx`

```tsx
import { useState } from 'react'

function calcSL(cost: number, salvage: number, life: number) {
  const ann = (cost - salvage) / life
  let bv = cost
  return Array.from({ length: life }, (_, i) => { bv -= ann; return { year: i + 1, dep: ann, bv: Math.max(salvage, bv) } })
}

function calcDDB(cost: number, salvage: number, life: number) {
  const rate = 2 / life; let bv = cost
  return Array.from({ length: life }, (_, i) => {
    const dep = Math.max(0, Math.min(bv * rate, bv - salvage))
    bv -= dep
    return { year: i + 1, dep, bv }
  })
}

function calcSYD(cost: number, salvage: number, life: number) {
  const syd = life * (life + 1) / 2; let bv = cost
  return Array.from({ length: life }, (_, i) => {
    const dep = (cost - salvage) * (life - i) / syd
    bv -= dep
    return { year: i + 1, dep, bv: Math.max(salvage, bv) }
  })
}

export default function DepreciationScheduleBuilder() {
  const [cost, setCost] = useState(240000)
  const [salvage, setSalvage] = useState(15000)
  const [life, setLife] = useState(10)

  const sl = calcSL(cost, salvage, life)
  const ddb = calcDDB(cost, salvage, life)
  const syd = calcSYD(cost, salvage, life)

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`

  return (
    <div>
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Asset Cost', val: cost, set: setCost, min: 10000, max: 5000000, step: 10000, fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: 'Salvage Value', val: salvage, set: setSalvage, min: 0, max: cost * 0.5, step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: 'Useful Life (years)', val: life, set: setLife, min: 2, max: 30, step: 1, fmt: (v: number) => `${v} yrs` },
        ].map(({ label, val, set, min, max, step, fmt: f }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)' }}>{f(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>

      {/* Method legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
        {[['Straight-Line', '#1e3a5f'], ['Double-Declining Balance', '#7c2d12'], ['Sum-of-Years Digits', '#1b4332']].map(([label, color]) => (
          <span key={label} style={{ fontSize: '0.75rem', color, fontFamily: 'var(--font-mono)' }}>■ {label}</span>
        ))}
      </div>

      {/* Schedule table */}
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>Year</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>SL Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>SL BV</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#7c2d12', fontWeight: 600 }}>DDB Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#7c2d12', fontWeight: 600 }}>DDB BV</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1b4332', fontWeight: 600 }}>SYD Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1b4332', fontWeight: 600 }}>SYD BV</th>
            </tr>
          </thead>
          <tbody>
            {sl.map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface)' }}>
                <td style={{ padding: '0.4rem 0.75rem', color: 'var(--color-text-muted)' }}>Yr {i + 1}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1e3a5f' }}>{fmt(sl[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1e3a5f' }}>{fmt(sl[i].bv)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#7c2d12' }}>{fmt(ddb[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#7c2d12' }}>{fmt(ddb[i].bv)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1b4332' }}>{fmt(syd[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1b4332' }}>{fmt(syd[i].bv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Forensic note: </strong>
        DDB charges {fmt(ddb[0].dep)} in Year 1 vs {fmt(sl[0].dep)} under SL — a {((ddb[0].dep / sl[0].dep - 1) * 100).toFixed(0)}% higher charge. Companies that extend useful lives or switch from accelerated to SL boost near-term earnings without any operational change.
      </div>
    </div>
  )
}
```

---

### Task 5: Ch5 Simulation — CovenantStressTester

**Files:**
- Create: `src/components/simulations/CovenantStressTester.tsx`

```tsx
import { useState } from 'react'

export default function CovenantStressTester() {
  const [ebitda, setEbitda] = useState(280)
  const [debt, setDebt] = useState(840)
  const [interest, setInterest] = useState(70)
  const [coverageThreshold, setCoverageThreshold] = useState(3.0)
  const [leverageThreshold, setLeverageThreshold] = useState(4.5)

  const coverage = interest > 0 ? ebitda / interest : Infinity
  const leverage = ebitda > 0 ? debt / ebitda : Infinity
  const coverageBreach = coverage < coverageThreshold
  const leverageBreach = leverage > leverageThreshold

  const coverageHeadroom = (coverage - coverageThreshold).toFixed(2)
  const leverageHeadroom = (leverageThreshold - leverage).toFixed(2)

  const ebitdaForCoverageBreachAt = coverageThreshold * interest
  const ebitdaForLeverageBreachAt = debt / leverageThreshold

  return (
    <div>
      {/* Covenant thresholds */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Coverage Covenant (min)', val: coverageThreshold, set: setCoverageThreshold, min: 1.5, max: 5, step: 0.25, fmt: (v: number) => `${v.toFixed(2)}x` },
          { label: 'Leverage Covenant (max)', val: leverageThreshold, set: setLeverageThreshold, min: 2, max: 8, step: 0.25, fmt: (v: number) => `${v.toFixed(2)}x` },
        ].map(({ label, val, set, min, max, step, fmt }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#d97706' }}>{fmt(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: '#d97706' }} />
          </div>
        ))}
      </div>

      {/* Company inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'EBITDA ($M) — drag to stress test', val: ebitda, set: setEbitda, min: 10, max: 500, step: 5, color: 'var(--color-accent)' },
          { label: 'Total Debt ($M)', val: debt, set: setDebt, min: 100, max: 3000, step: 50, color: '#1e3a5f' },
          { label: 'Interest Expense ($M)', val: interest, set: setInterest, min: 5, max: 200, step: 5, color: '#7c2d12' },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color }}>${val}M</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: color }} />
          </div>
        ))}
      </div>

      {/* Covenant status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[
          {
            label: 'Interest Coverage', formula: 'EBITDA / Interest',
            current: coverage.toFixed(2) + 'x', threshold: `Min ${coverageThreshold.toFixed(2)}x`,
            breach: coverageBreach, headroom: coverageHeadroom,
            breachAt: `EBITDA < $${ebitdaForCoverageBreachAt.toFixed(0)}M triggers breach`,
          },
          {
            label: 'Leverage Ratio', formula: 'Debt / EBITDA',
            current: leverage.toFixed(2) + 'x', threshold: `Max ${leverageThreshold.toFixed(2)}x`,
            breach: leverageBreach, headroom: leverageHeadroom,
            breachAt: `EBITDA < $${ebitdaForLeverageBreachAt.toFixed(0)}M triggers breach`,
          },
        ].map(({ label, formula, current, threshold, breach, headroom, breachAt }) => (
          <div key={label} style={{ padding: '1rem', background: breach ? '#dc262608' : '#1b433208', border: `2px solid ${breach ? '#dc2626' : '#1b4332'}`, borderRadius: '0.625rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{formula}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: breach ? '#dc2626' : '#1b4332', marginBottom: '0.25rem' }}>{current}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Covenant: {threshold}</div>
            <div style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', background: breach ? '#dc262618' : '#1b433218', display: 'inline-block' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: breach ? '#dc2626' : '#1b4332' }}>
                {breach ? '⚠ COVENANT BREACH' : `✓ Headroom: ${Number(headroom) > 0 ? headroom + 'x' : 'tight'}`}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{breachAt}</div>
          </div>
        ))}
      </div>

      {(coverageBreach || leverageBreach) && (
        <div style={{ padding: '0.75rem 1rem', background: '#dc262612', border: '1px solid #dc262630', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>
          ⚠ <strong>Covenant breach detected.</strong> In a real credit agreement, the lender could demand immediate repayment, block further draws, impose higher rates, or place the company in technical default — even if it continues making scheduled payments.
        </div>
      )}
    </div>
  )
}
```

---

### Task 6: Ch6 Simulation — EPSDilutionCalculator

**Files:**
- Create: `src/components/simulations/EPSDilutionCalculator.tsx`

```tsx
import { useState } from 'react'

export default function EPSDilutionCalculator() {
  const [netIncome, setNetIncome] = useState(500)
  const [basicShares, setBasicShares] = useState(200)
  const [options, setOptions] = useState(10)
  const [strikePrice, setStrikePrice] = useState(20)
  const [marketPrice, setMarketPrice] = useState(30)
  const [rsus, setRsus] = useState(3)
  const [convertFace, setConvertFace] = useState(0)
  const [convertCoupon, setConvertCoupon] = useState(0.04)
  const [convertRatio, setConvertRatio] = useState(50)
  const [taxRate, setTaxRate] = useState(0.25)

  const basicEPS = netIncome / basicShares

  // Treasury stock method for options
  const optionDilutiveShares = marketPrice > strikePrice
    ? options - Math.floor((options * strikePrice) / marketPrice)
    : 0

  // RSUs: always dilutive (granted, not purchased)
  const rsuDilutiveShares = rsus

  // If-converted method for converts
  const convertInterestAddback = convertFace > 0 ? convertFace * convertCoupon * (1 - taxRate) : 0
  const convertShares = convertFace > 0 ? convertRatio : 0

  const dilutedIncome = netIncome + convertInterestAddback
  const dilutedShares = basicShares + optionDilutiveShares + rsuDilutiveShares + convertShares
  const dilutedEPS = dilutedShares > 0 ? dilutedIncome / dilutedShares : 0

  const dilutionPct = basicEPS > 0 ? ((basicEPS - dilutedEPS) / basicEPS * 100) : 0

  const fmt2 = (n: number) => n.toFixed(2)

  return (
    <div>
      {/* Base inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Net Income ($M)', val: netIncome, set: setNetIncome, min: 10, max: 5000, step: 10 },
          { label: 'Basic Shares Outstanding (M)', val: basicShares, set: setBasicShares, min: 10, max: 2000, step: 10 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>

      {/* Dilutive instruments */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Dilutive Instruments</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Options Outstanding (M)', val: options, set: setOptions, min: 0, max: 50, step: 1 },
          { label: 'Option Strike Price ($)', val: strikePrice, set: setStrikePrice, min: 5, max: 100, step: 1 },
          { label: 'Current Market Price ($)', val: marketPrice, set: setMarketPrice, min: 5, max: 200, step: 1 },
          { label: 'RSUs Unvested (M)', val: rsus, set: setRsus, min: 0, max: 30, step: 1 },
          { label: 'Convertible Face Value ($M, 0 = none)', val: convertFace, set: setConvertFace, min: 0, max: 2000, step: 100 },
          { label: 'Shares per $1K Convert (conversion ratio)', val: convertRatio, set: setConvertRatio, min: 10, max: 200, step: 5 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#6366f1' }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
        ))}
      </div>

      {/* Bridge */}
      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Basic → Diluted EPS Bridge</div>
        {[
          { label: 'Basic EPS', shares: basicShares, income: netIncome, eps: basicEPS, color: '#1e3a5f' },
          { label: `+ Options (TSM: +${optionDilutiveShares.toFixed(1)}M shares)`, shares: optionDilutiveShares, income: 0, eps: null, color: marketPrice > strikePrice ? '#dc2626' : '#1b4332', note: marketPrice <= strikePrice ? 'anti-dilutive (OTM)' : '' },
          { label: `+ RSUs (+${rsuDilutiveShares}M shares)`, shares: rsuDilutiveShares, income: 0, eps: null, color: '#dc2626', note: '' },
          { label: `+ Converts (+${convertShares}M shares, +$${convertInterestAddback.toFixed(1)}M NI)`, shares: convertShares, income: convertInterestAddback, eps: null, color: convertFace > 0 ? '#dc2626' : '#1b4332', note: convertFace === 0 ? 'none' : '' },
          { label: 'Diluted EPS', shares: dilutedShares, income: dilutedIncome, eps: dilutedEPS, color: 'var(--color-accent)' },
        ].map(({ label, shares, income, eps, color, note }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderTop: eps === basicEPS ? 'none' : eps !== null ? `2px solid var(--color-border)` : 'none' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{label}{note ? ` (${note})` : ''}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: eps !== null ? '0.95rem' : '0.78rem', fontWeight: eps !== null ? 700 : 400, color }}>
              {eps !== null ? `$${fmt2(eps)}` : ''}
            </span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: dilutionPct > 5 ? '#dc262612' : '#1b433212', border: `1px solid ${dilutionPct > 5 ? '#dc262630' : '#1b433230'}`, borderRadius: '0.5rem', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 700, color: dilutionPct > 5 ? '#dc2626' : '#1b4332' }}>
          {dilutionPct.toFixed(1)}% dilution
        </span>
        <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
          Basic EPS ${fmt2(basicEPS)} → Diluted EPS ${fmt2(dilutedEPS)}. {dilutionPct > 10 ? 'Significant dilution — the gap between basic and diluted EPS is material.' : 'Dilution is modest.'}
        </span>
      </div>
    </div>
  )
}
```

---

### Task 7: Ch7 Simulation — CFOBridgeBuilder

**Files:**
- Create: `src/components/simulations/CFOBridgeBuilder.tsx`

```tsx
import { useState } from 'react'

interface Adjustment { label: string; key: string; value: number; direction: 1 | -1; color: string; hint: string }

export default function CFOBridgeBuilder() {
  const [netIncome, setNetIncome] = useState(150)
  const [da, setDa] = useState(45)
  const [sbc, setSbc] = useState(20)
  const [impairment, setImpairment] = useState(0)
  const [arChange, setArChange] = useState(15)   // increase = use of cash (negative)
  const [apChange, setApChange] = useState(10)   // increase = source (positive)
  const [invChange, setInvChange] = useState(8)  // increase = use (negative)
  const [defRevChange, setDefRevChange] = useState(5) // increase = source (positive)

  const cfo = netIncome + da + sbc + impairment - arChange + apChange - invChange + defRevChange
  const ratio = netIncome > 0 ? cfo / netIncome : 0
  const suspicious = ratio < 0.7 && netIncome > 0

  const items: Adjustment[] = [
    { label: `Net Income`, key: 'ni', value: netIncome, direction: 1, color: '#1e3a5f', hint: 'Starting point' },
    { label: `+ Depreciation & Amortization`, key: 'da', value: da, direction: 1, color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: `+ Stock-Based Compensation`, key: 'sbc', value: sbc, direction: 1, color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: `+ Impairment`, key: 'imp', value: impairment, direction: 1, color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: `− Increase in AR`, key: 'ar', value: arChange, direction: -1, color: '#dc2626', hint: 'Revenue recognized but not collected' },
    { label: `+ Increase in AP`, key: 'ap', value: apChange, direction: 1, color: '#1b4332', hint: 'Expenses incurred, not yet paid' },
    { label: `− Increase in Inventory`, key: 'inv', value: invChange, direction: -1, color: '#dc2626', hint: 'Cash paid for goods not yet sold' },
    { label: `+ Increase in Deferred Revenue`, key: 'dr', value: defRevChange, direction: 1, color: '#1b4332', hint: 'Cash received, revenue not yet earned' },
  ]

  const setters: Record<string, (v: number) => void> = { ni: setNetIncome, da: setDa, sbc: setSbc, imp: setImpairment, ar: setArChange, ap: setApChange, inv: setInvChange, dr: setDefRevChange }

  let running = 0
  const rows = items.map(item => {
    running += item.direction * item.value
    return { ...item, running }
  })

  return (
    <div>
      {/* Input sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Net Income ($M)', val: netIncome, set: setNetIncome, min: 0, max: 1000, step: 5 },
          { label: 'D&A ($M)', val: da, set: setDa, min: 0, max: 300, step: 5 },
          { label: 'SBC ($M)', val: sbc, set: setSbc, min: 0, max: 200, step: 5 },
          { label: 'Impairment ($M)', val: impairment, set: setImpairment, min: 0, max: 500, step: 10 },
          { label: 'AR Increase ($M)', val: arChange, set: setArChange, min: -100, max: 200, step: 5 },
          { label: 'AP Increase ($M)', val: apChange, set: setApChange, min: -100, max: 200, step: 5 },
          { label: 'Inventory Increase ($M)', val: invChange, set: setInvChange, min: -100, max: 200, step: 5 },
          { label: 'Deferred Revenue Increase ($M)', val: defRevChange, set: setDefRevChange, min: -50, max: 150, step: 5 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ padding: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)' }}>${val}M</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>

      {/* Bridge waterfall */}
      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Indirect Method CFO Bridge</div>
        {rows.map(({ label, value, direction, color, running: r, hint }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0', borderTop: label.startsWith('Net') ? 'none' : '1px solid var(--color-border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', color, fontWeight: label.startsWith('Net') ? 700 : 400 }}>{label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{hint}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color, minWidth: '70px', textAlign: 'right' }}>
              {direction > 0 ? '+' : '−'}${value}M
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-muted)', minWidth: '70px', textAlign: 'right' }}>
              = ${r}M
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid var(--color-border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>Cash from Operations (CFO)</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>${cfo}M</span>
        </div>
      </div>

      <div style={{ padding: '0.875rem 1.125rem', background: suspicious ? '#dc262612' : '#1b433212', border: `1px solid ${suspicious ? '#dc262630' : '#1b433230'}`, borderRadius: '0.5rem', fontSize: '0.82rem' }}>
        <div style={{ fontWeight: 700, color: suspicious ? '#dc2626' : '#1b4332', marginBottom: '0.25rem' }}>
          {suspicious ? '⚠ CFO/NI Ratio Below 0.7 — Primary Beneish Fraud Signal' : '✓ CFO/NI Ratio Healthy'}
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>
          CFO/NI = ${cfo}M / ${netIncome}M = {ratio.toFixed(2)}x.{' '}
          {suspicious ? 'Earnings are growing faster than cash. Accruals are building. This is the single most reliable indicator of earnings manipulation.' : 'Cash conversion is strong — earnings are backed by real cash flow.'}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Type-check all 7 components**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add src/components/simulations/
git commit -m "feat: add 7 chapter-specific simulation components (ch1-7)"
```

---

### Task 8: Extract ch8–10 Zone2 content + Wire all Zone2 files

**Files:**
- Create: `src/components/simulations/DuPontExplorer.tsx`
- Create: `src/components/simulations/PPACalculator.tsx`
- Create: `src/components/simulations/BenfordDetector.tsx`
- Modify: `src/zones/ch1/Zone2.tsx` through `src/zones/ch10/Zone2.tsx`

**Step 1: Create DuPontExplorer.tsx**

Move everything from ch8/Zone2.tsx *inside* the SimulationWrapper into this file (no SimulationWrapper, no import from zones):

```tsx
import { useState } from 'react'
import DuPontChart from '../analysis/DuPontChart'

const PRESETS = [
  { label: 'Apple FY2023',   netMargin: 0.251, assetTurnover: 1.12, equityMultiplier: 6.25, color: '#6366f1' },
  { label: 'Walmart FY2023', netMargin: 0.025, assetTurnover: 2.42, equityMultiplier: 5.18, color: '#0891b2' },
  { label: 'Bank (Typical)', netMargin: 0.21,  assetTurnover: 0.07, equityMultiplier: 11.5, color: '#d97706' },
  { label: 'Enron 1999',     netMargin: 0.02,  assetTurnover: 1.4,  equityMultiplier: 5.2,  color: '#dc2626' },
]

export default function DuPontExplorer() {
  const [netMargin, setNetMargin] = useState(0.12)
  const [assetTurnover, setAssetTurnover] = useState(1.2)
  const [equityMultiplier, setEquityMultiplier] = useState(2.5)
  const roe = netMargin * assetTurnover * equityMultiplier

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setNetMargin(p.netMargin); setAssetTurnover(p.assetTurnover); setEquityMultiplier(p.equityMultiplier) }}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: `1px solid ${p.color}40`, background: `${p.color}12`, color: p.color, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <DuPontChart dupont={{ netMargin, assetTurnover, equityMultiplier }} roe={roe} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { label: 'Net Margin', value: netMargin, set: setNetMargin, min: 0.001, max: 0.5, step: 0.001, fmt: (v: number) => (v * 100).toFixed(1) + '%' },
          { label: 'Asset Turnover', value: assetTurnover, set: setAssetTurnover, min: 0.01, max: 5, step: 0.01, fmt: (v: number) => v.toFixed(2) + 'x' },
          { label: 'Equity Multiplier', value: equityMultiplier, set: setEquityMultiplier, min: 1, max: 20, step: 0.1, fmt: (v: number) => v.toFixed(1) + 'x' },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label} style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>
      <div style={{ padding: '0.875rem 1.125rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>ROE = {(roe * 100).toFixed(1)}%</strong> from {(netMargin * 100).toFixed(1)}% margin × {assetTurnover.toFixed(2)}x turnover × {equityMultiplier.toFixed(1)}x leverage.
        {equityMultiplier > 8 && <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>⚠ High leverage — ROE is financially engineered, not operationally earned.</span>}
      </div>
    </div>
  )
}
```

**Step 2: Create PPACalculator.tsx**

Move all inner content from ch9/Zone2.tsx (inside the SimulationWrapper JSX) into this file:

```tsx
import { useState } from 'react'

export default function PPACalculator() {
  const [purchasePrice, setPurchasePrice] = useState(500)
  const [bookValue, setBookValue] = useState(200)
  const [fvAdjustments, setFvAdjustments] = useState(100)
  const [identifiedIntangibles, setIdentifiedIntangibles] = useState(50)

  const netIdentifiableAssets = bookValue + fvAdjustments + identifiedIntangibles
  const goodwill = Math.max(0, purchasePrice - netIdentifiableAssets)
  const goodwillPct = ((goodwill / purchasePrice) * 100).toFixed(1)
  const premium = ((purchasePrice / bookValue - 1) * 100).toFixed(1)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Purchase Price ($M)', value: purchasePrice, set: setPurchasePrice, min: 50, max: 2000, step: 10 },
          { label: 'Target Book Value ($M)', value: bookValue, set: setBookValue, min: 10, max: 1000, step: 10 },
          { label: 'FV Step-Ups ($M)', value: fvAdjustments, set: setFvAdjustments, min: 0, max: 500, step: 5, hint: 'Increase in asset fair values above book' },
          { label: 'Identified Intangibles ($M)', value: identifiedIntangibles, set: setIdentifiedIntangibles, min: 0, max: 400, step: 5, hint: 'Customer lists, patents, trade names, technology' },
        ].map(({ label, value, set, min, max, step, hint }) => (
          <div key={label} style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>${value}M</span>
            </div>
            {hint && <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>{hint}</div>}
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Purchase Price', value: `$${purchasePrice}M`, color: '#4A0A12' },
          { label: 'Net Identifiable Assets', value: `$${netIdentifiableAssets}M`, color: '#1e3a5f' },
          { label: 'Goodwill', value: `$${goodwill}M`, color: goodwill > purchasePrice * 0.4 ? '#dc2626' : '#1b4332' },
          { label: 'Goodwill % of Price', value: `${goodwillPct}%`, color: Number(goodwillPct) > 40 ? '#dc2626' : '#1b4332' },
          { label: 'Book Value Premium', value: `${premium}%`, color: '#d97706' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: `1px solid ${color}30`, borderRadius: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
      {Number(goodwillPct) > 40 && (
        <div style={{ padding: '0.75rem 1rem', background: '#dc262612', border: '1px solid #dc262630', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>
          ⚠ <strong>High goodwill concentration ({goodwillPct}%)</strong> — ${goodwill}M of goodwill must survive annual impairment tests. If synergies fail to materialize, this flows directly through the income statement.
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create BenfordDetector.tsx**

Move inner content from ch10/Zone2.tsx into this file (same pattern — no SimulationWrapper):

```tsx
import { useState, useMemo } from 'react'

const BENFORD_EXPECTED = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]

const DATASETS = {
  legitimate: { label: 'Legitimate Revenue Data (1,000 invoices)', description: 'Distribution closely follows Benford\'s Law — leading 1s appear ~30% of the time.', data: [302, 178, 124, 96, 80, 68, 58, 52, 42] },
  fabricated: { label: 'Fabricated Expense Data (1,000 entries)', description: 'Human-generated numbers cluster around middle digits (4–7) — a classic fraud signal.', data: [182, 145, 128, 148, 142, 135, 58, 40, 22] },
  roundNumbers: { label: 'Round-Number Journal Entries (1,000 entries)', description: 'Entries ending in 000 show unusual 1s and 5s — suggesting management override.', data: [285, 45, 35, 40, 148, 35, 198, 38, 176] },
}
type DatasetKey = keyof typeof DATASETS

export default function BenfordDetector() {
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>('legitimate')
  const dataset = DATASETS[selectedDataset]
  const total = dataset.data.reduce((a, b) => a + b, 0)

  const chiSquared = useMemo(() => dataset.data.reduce((sum, observed, i) => {
    const expected = (BENFORD_EXPECTED[i] / 100) * total
    return sum + Math.pow(observed - expected, 2) / expected
  }, 0), [dataset, total])

  const isSuspicious = chiSquared > 15.51

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(Object.keys(DATASETS) as DatasetKey[]).map(key => (
          <button key={key} onClick={() => setSelectedDataset(key)}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: selectedDataset === key ? 'var(--color-accent)' : 'var(--color-surface)', color: selectedDataset === key ? '#fff' : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', cursor: 'pointer' }}>
            {DATASETS[key].label.split(' (')[0]}
          </button>
        ))}
      </div>
      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {dataset.description}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.375rem', marginBottom: '1.25rem', alignItems: 'end' }}>
        {dataset.data.map((observed, i) => {
          const expectedPct = BENFORD_EXPECTED[i]
          const observedPct = (observed / total) * 100
          const deviation = observedPct - expectedPct
          const barColor = Math.abs(deviation) > 5 ? '#dc2626' : 'var(--color-accent)'
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: Math.abs(deviation) > 5 ? '#dc2626' : 'var(--color-text-muted)', marginBottom: '2px' }}>
                {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
              </div>
              <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px' }}>
                <div style={{ width: '12px', background: '#1e3a5f40', height: `${(expectedPct / 35) * 100}%`, borderRadius: '2px 2px 0 0' }} />
                <div style={{ width: '12px', background: barColor, height: `${(observedPct / 35) * 100}%`, borderRadius: '2px 2px 0 0' }} />
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)', marginTop: '4px', fontWeight: 700 }}>{i + 1}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{observedPct.toFixed(0)}%</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>■ <span style={{ color: '#1e3a5f' }}>Expected (Benford)</span></span>
        <span>■ <span style={{ color: 'var(--color-accent)' }}>Observed</span></span>
        <span>■ <span style={{ color: '#dc2626' }}>Suspicious (&gt;5%)</span></span>
      </div>
      <div style={{ padding: '0.875rem 1.125rem', background: isSuspicious ? '#dc262612' : '#1b433212', border: `1px solid ${isSuspicious ? '#dc262630' : '#1b433230'}`, borderRadius: '0.5rem', fontSize: '0.82rem' }}>
        <div style={{ fontWeight: 700, color: isSuspicious ? '#dc2626' : '#1b4332', marginBottom: '0.25rem' }}>
          {isSuspicious ? '⚠ Statistically Suspicious' : "✓ Consistent with Benford's Law"}
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>
          χ² = {chiSquared.toFixed(2)} (critical value at α=0.05: 15.51).{' '}
          {isSuspicious ? "Distribution deviates significantly from Benford's Law — warrants forensic investigation." : 'Statistically consistent with naturally occurring financial data.'}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Rewrite all Zone2 files (ch1–10)**

Use bash to write all 10 zone files. Each is a minimal wrapper around the new component:

```bash
# ch1
cat > src/zones/ch1/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import AccountingEquationBalancer from '../../components/simulations/AccountingEquationBalancer'
export default function Zone2() {
  return (
    <SimulationWrapper title="Accounting Equation Balancer" description="Post journal entries and watch Assets = Liabilities + Equity hold in real time. Every properly formed double-entry preserves the equation — this is the bedrock of all financial reporting.">
      <AccountingEquationBalancer />
    </SimulationWrapper>
  )
}
EOF

# ch2
cat > src/zones/ch2/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import RevenueRecognitionTimer from '../../components/simulations/RevenueRecognitionTimer'
export default function Zone2() {
  return (
    <SimulationWrapper title="Revenue Recognition Timer" description="Choose a contract type and advance through time. See exactly when revenue is recognized vs when cash arrives — and how Deferred Revenue acts as the bridge between the two.">
      <RevenueRecognitionTimer />
    </SimulationWrapper>
  )
}
EOF

# ch3
cat > src/zones/ch3/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import InventoryCostComparator from '../../components/simulations/InventoryCostComparator'
export default function Zone2() {
  return (
    <SimulationWrapper title="Inventory Cost Flow Comparator" description="Enter purchase lots and units sold to see FIFO, LIFO, and Weighted Average Cost methods side by side. See how cost flow assumptions change COGS, gross profit, and ending inventory — with identical underlying economics.">
      <InventoryCostComparator />
    </SimulationWrapper>
  )
}
EOF

# ch4
cat > src/zones/ch4/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import DepreciationScheduleBuilder from '../../components/simulations/DepreciationScheduleBuilder'
export default function Zone2() {
  return (
    <SimulationWrapper title="Depreciation Schedule Builder" description="Enter asset cost, salvage value, and useful life. Compare Straight-Line, Double-Declining Balance, and Sum-of-Years Digits year by year. See how management's method and life assumptions directly drive reported earnings.">
      <DepreciationScheduleBuilder />
    </SimulationWrapper>
  )
}
EOF

# ch5
cat > src/zones/ch5/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import CovenantStressTester from '../../components/simulations/CovenantStressTester'
export default function Zone2() {
  return (
    <SimulationWrapper title="Covenant Stress Tester" description="Set your debt structure and covenant thresholds, then drag EBITDA down to see when interest coverage and leverage covenants breach. This is how credit analysts model downside scenarios.">
      <CovenantStressTester />
    </SimulationWrapper>
  )
}
EOF

# ch6
cat > src/zones/ch6/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import EPSDilutionCalculator from '../../components/simulations/EPSDilutionCalculator'
export default function Zone2() {
  return (
    <SimulationWrapper title="EPS Dilution Calculator" description="Layer in options, RSUs, and convertible debt to see the treasury stock method in action. Watch basic EPS decay into diluted EPS — and understand why the gap matters for valuation.">
      <EPSDilutionCalculator />
    </SimulationWrapper>
  )
}
EOF

# ch7
cat > src/zones/ch7/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import CFOBridgeBuilder from '../../components/simulations/CFOBridgeBuilder'
export default function Zone2() {
  return (
    <SimulationWrapper title="CFO Bridge Builder" description="Start from Net Income and toggle non-cash add-backs and working capital changes to build the indirect-method cash flow statement from scratch. Watch the CFO/NI ratio — the Beneish fraud signal — update in real time.">
      <CFOBridgeBuilder />
    </SimulationWrapper>
  )
}
EOF

# ch8
cat > src/zones/ch8/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import DuPontExplorer from '../../components/simulations/DuPontExplorer'
export default function Zone2() {
  return (
    <SimulationWrapper title="DuPont Analysis Explorer" description="Decompose Return on Equity into its three drivers. Adjust the sliders to see how margin, efficiency, and leverage each contribute — and use the presets to explore real companies.">
      <DuPontExplorer />
    </SimulationWrapper>
  )
}
EOF

# ch9
cat > src/zones/ch9/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import PPACalculator from '../../components/simulations/PPACalculator'
export default function Zone2() {
  return (
    <SimulationWrapper title="Acquisition Accounting Calculator" description="Walk through a purchase price allocation (PPA). Adjust deal parameters to see how goodwill is calculated — and what percentage becomes an intangible that must survive annual impairment tests.">
      <PPACalculator />
    </SimulationWrapper>
  )
}
EOF

# ch10
cat > src/zones/ch10/Zone2.tsx << 'EOF'
import SimulationWrapper from '../../components/shared/SimulationWrapper'
import BenfordDetector from '../../components/simulations/BenfordDetector'
export default function Zone2() {
  return (
    <SimulationWrapper title="Benford's Law Fraud Detector" description="Compare first-digit distributions against Benford's Law. Fabricated financial data deviates from the expected distribution — the chi-squared test quantifies how suspicious the numbers are.">
      <BenfordDetector />
    </SimulationWrapper>
  )
}
EOF
```

**Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 6: Build**

Run: `npm run build`
Expected: `✓ built in N ms`, no errors

**Step 7: Commit**

```bash
git add src/components/simulations/ src/zones/
git commit -m "feat: extract ch8-10 sims into components, wire all Zone2 ch1-10"
```

---

### Task 9: AppendixPage — A1 (All Sims), A2 (All Cases), A3 (Statements)

**Files:**
- Create: `src/pages/AppendixPage.tsx`

```tsx
import { useParams, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { FRAUD_CASES } from '../data/fraudCases'
import { CHAPTERS } from '../data/toc'

// Simulation components
import AccountingEquationBalancer from '../components/simulations/AccountingEquationBalancer'
import RevenueRecognitionTimer from '../components/simulations/RevenueRecognitionTimer'
import InventoryCostComparator from '../components/simulations/InventoryCostComparator'
import DepreciationScheduleBuilder from '../components/simulations/DepreciationScheduleBuilder'
import CovenantStressTester from '../components/simulations/CovenantStressTester'
import EPSDilutionCalculator from '../components/simulations/EPSDilutionCalculator'
import CFOBridgeBuilder from '../components/simulations/CFOBridgeBuilder'
import DuPontExplorer from '../components/simulations/DuPontExplorer'
import PPACalculator from '../components/simulations/PPACalculator'
import BenfordDetector from '../components/simulations/BenfordDetector'

const StatementsPage = lazy(() => import('./StatementsPage'))

const SIM_CHAPTERS = [
  { id: 1, title: 'Accounting Equation', component: <AccountingEquationBalancer /> },
  { id: 2, title: 'Revenue Recognition', component: <RevenueRecognitionTimer /> },
  { id: 3, title: 'Inventory', component: <InventoryCostComparator /> },
  { id: 4, title: 'Fixed Assets', component: <DepreciationScheduleBuilder /> },
  { id: 5, title: 'Liabilities', component: <CovenantStressTester /> },
  { id: 6, title: 'Equity & EPS', component: <EPSDilutionCalculator /> },
  { id: 7, title: 'Cash Flow', component: <CFOBridgeBuilder /> },
  { id: 8, title: 'Ratio Analysis', component: <DuPontExplorer /> },
  { id: 9, title: 'M&A Accounting', component: <PPACalculator /> },
  { id: 10, title: 'Fraud Detection', component: <BenfordDetector /> },
]

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>{label}</div>
      <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>
    </div>
  )
}

function AppendixNav({ current }: { current: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      {[
        { id: '1', label: 'A1 · All Simulations' },
        { id: '2', label: 'A2 · Case Library' },
        { id: '3', label: 'A3 · Statements Simulator' },
      ].map(({ id, label }) => (
        <Link key={id} to={`/appendix/${id}`}
          style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: current === id ? 'var(--color-accent)' : 'var(--color-surface)', color: current === id ? '#fff' : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textDecoration: 'none', fontWeight: 600 }}>
          {label}
        </Link>
      ))}
    </div>
  )
}

function A1Simulations() {
  return (
    <div>
      <SectionHeader label="Appendix 1" title="All Simulations" subtitle="Every chapter's interactive simulation on one page — use as a reference tool during case analysis." />
      {SIM_CHAPTERS.map(({ id, title, component }) => {
        const ch = CHAPTERS.find(c => c.id === id)
        return (
          <div key={id} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ch{id}</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: ch?.color ?? 'var(--color-accent)' }}>{title}</h3>
              <Link to={`/chapter/${id}/zone/2`} style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                Open in chapter →
              </Link>
            </div>
            {component}
          </div>
        )
      })}
    </div>
  )
}

function A2Cases() {
  return (
    <div>
      <SectionHeader label="Appendix 2" title="Case Library" subtitle="All 30 fraud cases from every chapter. Each case illustrates how accounting concepts were weaponized — and how they were eventually uncovered." />
      {CHAPTERS.map(ch => {
        const cases = FRAUD_CASES[ch.id] ?? []
        if (cases.length === 0) return null
        return (
          <div key={ch.id} style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: ch.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 700 }}>
              Ch{ch.id} · {ch.title}
            </div>
            {cases.map((c, i) => (
              <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'var(--color-surface)', border: `1px solid ${ch.color}20`, borderLeft: `3px solid ${ch.color}`, borderRadius: '0 0.625rem 0.625rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{c.company}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{c.year}</span>
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.65 }}>{c.what}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Concept Abused', val: c.conceptAbused, color: '#dc2626' },
                    { label: 'Red Flag', val: c.redFlag, color: '#d97706' },
                    { label: 'Consequence', val: c.consequence, color: '#1b4332' },
                    { label: 'Auditor Failure', val: c.auditorFailure, color: '#6366f1' },
                  ].filter(x => x.val).map(({ label, val, color }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem', fontWeight: 700 }}>{label}</div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function A3Statements() {
  return (
    <div>
      <SectionHeader label="Appendix 3" title="Financial Statements Simulator" subtitle="The full interconnected statements simulator — enter transactions and watch them trace through the Income Statement, Balance Sheet, Cash Flow, and Equity Statement simultaneously." />
      <Suspense fallback={<div style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading simulator…</div>}>
        <StatementsPage />
      </Suspense>
    </div>
  )
}

export default function AppendixPage() {
  const { id = '1' } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen pl-0 pt-12" style={{ background: 'var(--color-base)' }}>
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
          EMBA · Financial Accounting
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 1.5rem' }}>
          Appendix
        </h1>
        <AppendixNav current={id} />
        {id === '1' && <A1Simulations />}
        {id === '2' && <A2Cases />}
        {id === '3' && <A3Statements />}
      </div>
    </div>
  )
}
```

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add src/pages/AppendixPage.tsx
git commit -m "feat: add AppendixPage (A1 all sims, A2 case library, A3 statements simulator)"
```

---

### Task 10: App.tsx route + footer, NavDrawer appendix section, Home attribution

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/shell/NavDrawer.tsx`
- Modify: `src/pages/Home.tsx`

**Step 1: Update App.tsx**

Add the `/appendix/:id` route and a global footer. The full updated file:

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavDrawer from './components/shell/NavDrawer'
import ChapterLayout from './components/shell/ChapterLayout'

const Home = lazy(() => import('./pages/Home'))
const ChapterPage = lazy(() => import('./pages/ChapterPage'))
const Progress = lazy(() => import('./pages/Progress'))
const StatementsPage = lazy(() => import('./pages/StatementsPage'))
const MAWorkbenchPage = lazy(() => import('./pages/MAWorkbenchPage'))
const AppendixPage = lazy(() => import('./pages/AppendixPage'))

function Loading() {
  return <div className="p-8" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</div>
}

function Footer() {
  return (
    <footer style={{
      textAlign: 'center', padding: '1.25rem 1rem',
      borderTop: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
      color: 'var(--color-text-muted)', marginTop: '3rem',
      letterSpacing: '0.04em',
    }}>
      Designed by Imran Dar · Financial Accounting EMBA Platform
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
        <NavDrawer />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/progress" element={<Progress />} />

            <Route path="/chapter/:id" element={<ChapterLayout />}>
              <Route index element={<Navigate to="zone/1" replace />} />
              <Route path="zone/:zone" element={<ChapterPage />} />
            </Route>

            <Route path="/appendix/:id" element={<AppendixPage />} />

            {/* Legacy simulator routes */}
            <Route path="/simulator" element={<StatementsPage />} />
            <Route path="/ma" element={<MAWorkbenchPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
```

**Step 2: Update NavDrawer.tsx**

Add an "Appendix" section after the chapter list. Insert this block after the closing `</div>` of the chapter list and before the closing `</div>` of `className="px-3 py-3"`:

```tsx
{/* Appendix section */}
<div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 12px 6px', textTransform: 'uppercase' }}>
    Appendix
  </div>
  {[
    { id: '1', label: 'All Simulations' },
    { id: '2', label: 'Case Library' },
    { id: '3', label: 'Statements Simulator' },
  ].map(({ id, label }) => (
    <NavLink
      key={id}
      to={`/appendix/${id}`}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-base)]"
      style={({ isActive }) => ({
        background: isActive ? 'var(--color-base)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
      })}
    >
      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: '2rem' }}>A{id}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>
    </NavLink>
  ))}
</div>
```

**Step 3: Update Home.tsx**

Insert the attribution line immediately after the closing `</h1>` tag of the main heading (the one that says "Learn Accounting Through Real Failures"):

```tsx
<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0 0 12px', letterSpacing: '0.04em' }}>
  Designed by Imran Dar
</p>
```

**Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 5: Build**

Run: `npm run build`
Expected: `✓ built in N ms`, no errors, 0 errors from tsc

**Step 6: Commit + push**

```bash
git add src/App.tsx src/components/shell/NavDrawer.tsx src/pages/Home.tsx
git commit -m "feat: add appendix routes, global footer, NavDrawer appendix section, Home attribution"
git push origin main
```

---

## Summary

| Task | Files | What |
|------|-------|------|
| 1–7 | `src/components/simulations/*.tsx` | 7 dedicated chapter simulations |
| 8 | Extract ch8-10 + rewrite Zone2 ch1-10 | All Zone2 use named components |
| 9 | `src/pages/AppendixPage.tsx` | A1/A2/A3 appendix views |
| 10 | App.tsx, NavDrawer, Home | Route, footer, nav, attribution |
