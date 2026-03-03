import { useState } from 'react'

type ScenarioKey = 'product' | 'subscription' | 'milestone'

const SCENARIOS: Record<ScenarioKey, { label: string; description: string; periods: number; periodLabel: string }> = {
  product: {
    label: 'Product Sale (Point-in-Time)',
    description: 'Customer pays upfront ($100K), product ships in period 2. Revenue recognized at delivery — one discrete moment (ASC 606 point-in-time).',
    periods: 2,
    periodLabel: 'Period',
  },
  subscription: {
    label: 'SaaS License (Over-Time)',
    description: 'Customer pays $120K upfront for 12-month SaaS license. Revenue recognized $10K/month as performance obligation is satisfied continuously (ASC 606 over-time).',
    periods: 12,
    periodLabel: 'Month',
  },
  milestone: {
    label: 'Software Contract (Milestone)',
    description: '$9M fixed-price software contract with 3 discrete milestones: Design sign-off (Month 4, $3M), Beta delivery (Month 8, $3M), Go-live (Month 12, $3M). Zero revenue between milestones — lump-sum recognition only when each milestone is contractually achieved (ASC 606 milestone method).',
    periods: 12,
    periodLabel: 'Month',
  },
}

// Milestone periods (1-indexed) and amounts
const MILESTONES = [
  { period: 4, amount: 3000000, label: 'Design Sign-off' },
  { period: 8, amount: 3000000, label: 'Beta Delivery' },
  { period: 12, amount: 3000000, label: 'Go-live' },
]
const MILESTONE_TOTAL = MILESTONES.reduce((s, m) => s + m.amount, 0)

function getState(scenario: ScenarioKey, period: number) {
  if (scenario === 'product') {
    return { cash: 100000, revenue: period >= 2 ? 100000 : 0, deferred: period < 2 ? 100000 : 0 }
  }
  if (scenario === 'subscription') {
    return { cash: 120000, revenue: period * 10000, deferred: 120000 - period * 10000 }
  }
  // Milestone: revenue recognized only at milestone periods (cumulative lump-sum)
  const milestonesHit = MILESTONES.filter(m => m.period <= period)
  const revenue = milestonesHit.reduce((s, m) => s + m.amount, 0)
  // Cash: 10% upfront + equal billing at each milestone hit
  const upfront = MILESTONE_TOTAL * 0.1
  const cash = Math.min(MILESTONE_TOTAL, upfront + milestonesHit.length * (MILESTONE_TOTAL / 3))
  return { cash, revenue, deferred: 0 }
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
  const maxVal = scenario === 'milestone' ? MILESTONE_TOTAL : scenario === 'subscription' ? 120000 : 100000

  const handleScenarioChange = (k: ScenarioKey) => { setScenario(k); setPeriod(1) }

  // For milestone scenario: show which milestones have been hit
  const milestoneStatus = scenario === 'milestone'
    ? MILESTONES.map(m => ({ ...m, hit: period >= m.period }))
    : null

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
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

        {milestoneStatus && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            {milestoneStatus.map(m => (
              <div key={m.period} style={{
                flex: 1, padding: '0.4rem 0.5rem', borderRadius: '0.375rem', textAlign: 'center',
                background: m.hit ? '#1b433218' : 'var(--color-base)',
                border: `1px solid ${m.hit ? '#1b4332' : 'var(--color-border)'}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: m.hit ? '#1b4332' : 'var(--color-text-muted)', fontWeight: 700 }}>
                  {m.hit ? '✓' : '○'} Mo.{m.period}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: m.hit ? '#1b4332' : 'var(--color-text-muted)', fontWeight: 700 }}>
                  {m.hit ? '+$3M' : '$0'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <Bar label="Cash Received" value={st.cash} max={maxVal} color="#1e3a5f" />
        <Bar label="Revenue Recognized (P&L)" value={st.revenue} max={maxVal} color="#1b4332" />
        <Bar label="Deferred Revenue (Liability)" value={st.deferred} max={maxVal} color="#7c2d12" />
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Key insight: </strong>
        {scenario === 'milestone'
          ? milestoneStatus && milestoneStatus.filter(m => m.hit).length === 0
            ? 'No milestone has been achieved yet — $0 revenue recognized even if work is ongoing. Milestone method: no partial credit until contractual gates are met.'
            : `${milestoneStatus!.filter(m => m.hit).length} of 3 milestones achieved. Revenue recognized in discrete lump sums ($3M each). Between milestones, revenue is $0 regardless of project progress — this is ASC 606 milestone recognition.`
          : st.deferred > 0
            ? `$${(st.deferred / 1000).toFixed(0)}K of cash received has NOT yet been earned — it sits on the balance sheet as Deferred Revenue (a liability).`
            : `All cash received has been earned and recognized as revenue. The P&L matches economic reality.`}
      </div>
    </div>
  )
}
