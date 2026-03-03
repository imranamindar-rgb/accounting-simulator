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
