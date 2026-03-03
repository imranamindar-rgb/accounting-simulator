import { useState, useMemo } from 'react'

const BENFORD_EXPECTED = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]

const DATASETS = {
  legitimate: { label: 'Legitimate Revenue Data (1,000 invoices)', description: "Distribution closely follows Benford's Law — leading 1s appear ~30% of the time.", data: [302, 178, 124, 96, 80, 68, 58, 52, 42] },
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
        <span>■ <span style={{ color: '#dc2626' }}>Suspicious (&gt;5% deviation)</span></span>
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
