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
          { label: 'Purchase Price ($M)', value: purchasePrice, set: setPurchasePrice, min: 50, max: 2000, step: 10, hint: undefined },
          { label: 'Target Book Value ($M)', value: bookValue, set: setBookValue, min: 10, max: 1000, step: 10, hint: undefined },
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
