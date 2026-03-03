import { useState } from 'react'

type LineItem = {
  id: string
  label: string
  sign: '+' | '-'
  color: string
  hint: string
  defaultAmount: number
}

const LINE_ITEMS: LineItem[] = [
  { id: 'da',       label: '+ Depreciation & Amortization', sign: '+', color: '#1b4332', hint: 'Non-cash charge added back',              defaultAmount: 45  },
  { id: 'sbc',      label: '+ Stock-Based Compensation',    sign: '+', color: '#1b4332', hint: 'Non-cash charge added back',              defaultAmount: 20  },
  { id: 'imp',      label: '+ Impairment',                  sign: '+', color: '#1b4332', hint: 'Non-cash charge added back',              defaultAmount: 30  },
  { id: 'ar',       label: '− Increase in AR',              sign: '-', color: '#dc2626', hint: 'Revenue recognized but not collected',    defaultAmount: 15  },
  { id: 'ap',       label: '+ Increase in AP',              sign: '+', color: '#1b4332', hint: 'Expenses incurred, not yet paid',         defaultAmount: 10  },
  { id: 'inv',      label: '− Increase in Inventory',       sign: '-', color: '#dc2626', hint: 'Cash paid for goods not yet sold',        defaultAmount: 8   },
  { id: 'defrev',   label: '+ Increase in Deferred Revenue',sign: '+', color: '#1b4332', hint: 'Cash received, revenue not yet earned',   defaultAmount: 5   },
]

type ItemState = { enabled: boolean; amount: number }

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--color-accent)' : '#d1d5db',
        position: 'relative', transition: 'background 0.2s',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '2px',
        left: on ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        display: 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function CFOBridgeBuilder() {
  const [netIncome, setNetIncome] = useState(150)
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(LINE_ITEMS.map(item => [item.id, { enabled: true, amount: item.defaultAmount }]))
  )

  const toggle = (id: string) =>
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }))

  const setAmount = (id: string, amount: number) =>
    setItemStates(prev => ({ ...prev, [id]: { ...prev[id], amount } }))

  // Build CFO: Net Income + all enabled adjustments
  let cfo = netIncome
  LINE_ITEMS.forEach(item => {
    const st = itemStates[item.id]
    if (st.enabled) {
      cfo += item.sign === '+' ? st.amount : -st.amount
    }
  })

  const ratio = netIncome > 0 ? cfo / netIncome : 0
  const suspicious = ratio < 0.7 && netIncome > 0

  // Build running total for the bridge display
  const bridgeRows: { label: string; sign: '+' | '-'; amount: number; running: number; color: string; hint: string; enabled: boolean }[] = []
  let running = netIncome
  LINE_ITEMS.forEach(item => {
    const st = itemStates[item.id]
    const contrib = st.enabled ? (item.sign === '+' ? st.amount : -st.amount) : 0
    running += contrib
    bridgeRows.push({ label: item.label, sign: item.sign, amount: st.amount, running, color: item.color, hint: item.hint, enabled: st.enabled })
  })

  return (
    <div>
      {/* Net Income input */}
      <div style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Net Income ($M) — starting point</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f' }}>${netIncome}M</span>
        </div>
        <input type="range" min={0} max={1000} step={5} value={netIncome}
          onChange={e => setNetIncome(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#1e3a5f' }} />
      </div>

      {/* Toggle rows for each adjustment */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Add-backs &amp; Working Capital Adjustments — toggle to include/exclude
        </div>
        {LINE_ITEMS.map(item => {
          const st = itemStates[item.id]
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              marginBottom: '0.375rem',
              background: st.enabled ? 'var(--color-surface)' : 'var(--color-base)',
              border: `1px solid ${st.enabled ? 'var(--color-border)' : 'transparent'}`,
              borderRadius: '0.5rem',
              opacity: st.enabled ? 1 : 0.55,
              transition: 'all 0.15s',
            }}>
              <Toggle on={st.enabled} onToggle={() => toggle(item.id)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', color: st.enabled ? item.color : 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{item.hint}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>$</span>
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={5}
                  value={st.amount}
                  onChange={e => setAmount(item.id, Math.max(0, Number(e.target.value)))}
                  disabled={!st.enabled}
                  style={{
                    width: '64px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700,
                    color: st.enabled ? item.color : 'var(--color-text-muted)',
                    background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '0.25rem',
                    padding: '0.125rem 0.25rem', textAlign: 'right',
                    cursor: st.enabled ? 'text' : 'default',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>M</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* CFO Bridge waterfall */}
      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Indirect Method CFO Bridge
        </div>

        {/* Net Income row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0', marginBottom: '0.25rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: '#1e3a5f', fontWeight: 700 }}>Net Income</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Starting point</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#1e3a5f', minWidth: '70px', textAlign: 'right' }}>+${netIncome}M</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-muted)', minWidth: '70px', textAlign: 'right' }}>= ${netIncome}M</span>
        </div>

        {bridgeRows.map(({ label, sign, amount, running: r, color, hint, enabled }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.35rem 0',
            borderTop: '1px solid var(--color-border)',
            opacity: enabled ? 1 : 0.4,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', color: enabled ? color : 'var(--color-text-muted)', fontWeight: 400 }}>
                {label}{!enabled && ' (excluded)'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{hint}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: enabled ? color : 'var(--color-text-muted)', minWidth: '70px', textAlign: 'right' }}>
              {enabled ? `${sign === '+' ? '+' : '−'}$${amount}M` : '—'}
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
          {suspicious ? 'Earnings are growing faster than cash. This is the single most reliable indicator of earnings manipulation.' : 'Cash conversion is strong — earnings are backed by real cash flow.'}
        </div>
      </div>
    </div>
  )
}
