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
    return { cash: 100000, revenue: period >= 2 ? 100000 : 0, deferred: period < 2 ? 100000 : 0 }
  }
  if (scenario === 'subscription') {
    return { cash: 120000, revenue: period * 10000, deferred: 120000 - period * 10000 }
  }
  const pcts = [0.3, 0.8, 1.0]
  const revenue = 15000000 * pcts[Math.min(period - 1, 2)]
  const billedCumulative = [5000000, 11000000, 15000000][Math.min(period - 1, 2)]
  return { cash: billedCumulative, revenue, deferred: 0 }
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

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.periodLabel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>{period} of {s.periods}</span>
        </div>
        <input type="range" min={1} max={s.periods} value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
      </div>

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
