import { useState } from 'react'

export default function CFOBridgeBuilder() {
  const [netIncome, setNetIncome] = useState(150)
  const [da, setDa] = useState(45)
  const [sbc, setSbc] = useState(20)
  const [impairment, setImpairment] = useState(0)
  const [arChange, setArChange] = useState(15)
  const [apChange, setApChange] = useState(10)
  const [invChange, setInvChange] = useState(8)
  const [defRevChange, setDefRevChange] = useState(5)

  const cfo = netIncome + da + sbc + impairment - arChange + apChange - invChange + defRevChange
  const ratio = netIncome > 0 ? cfo / netIncome : 0
  const suspicious = ratio < 0.7 && netIncome > 0

  const items = [
    { label: 'Net Income', value: netIncome, sign: '+', color: '#1e3a5f', hint: 'Starting point' },
    { label: '+ Depreciation & Amortization', value: da, sign: '+', color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: '+ Stock-Based Compensation', value: sbc, sign: '+', color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: '+ Impairment', value: impairment, sign: '+', color: '#1b4332', hint: 'Non-cash charge added back' },
    { label: '− Increase in AR', value: arChange, sign: '-', color: '#dc2626', hint: 'Revenue recognized but not collected' },
    { label: '+ Increase in AP', value: apChange, sign: '+', color: '#1b4332', hint: 'Expenses incurred, not yet paid' },
    { label: '− Increase in Inventory', value: invChange, sign: '-', color: '#dc2626', hint: 'Cash paid for goods not yet sold' },
    { label: '+ Increase in Deferred Revenue', value: defRevChange, sign: '+', color: '#1b4332', hint: 'Cash received, revenue not yet earned' },
  ]

  const setters: ((v: number) => void)[] = [setNetIncome, setDa, setSbc, setImpairment, setArChange, setApChange, setInvChange, setDefRevChange]

  let running = 0
  const rows = items.map((item, i) => {
    running += item.sign === '+' ? item.value : -item.value
    return { ...item, running, setter: setters[i] }
  })

  return (
    <div>
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

      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Indirect Method CFO Bridge</div>
        {rows.map(({ label, value, sign, color, running: r, hint }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', color, fontWeight: i === 0 ? 700 : 400 }}>{label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{hint}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color, minWidth: '70px', textAlign: 'right' }}>
              {sign === '+' ? '+' : '−'}${value}M
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
