import { useState, useEffect, useRef } from 'react'

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

  const ebitdaForCoverageBreachAt = coverageThreshold * interest
  const ebitdaForLeverageBreachAt = debt / leverageThreshold

  // Track breach keys to re-trigger the animation when breach state changes to true
  const prevCoverageBreach = useRef(coverageBreach)
  const prevLeverageBreach = useRef(leverageBreach)
  const [coverageBreachKey, setCoverageBreachKey] = useState(0)
  const [leverageBreachKey, setLeverageBreachKey] = useState(0)

  useEffect(() => {
    if (coverageBreach && !prevCoverageBreach.current) {
      setCoverageBreachKey(k => k + 1)
    }
    prevCoverageBreach.current = coverageBreach
  }, [coverageBreach])

  useEffect(() => {
    if (leverageBreach && !prevLeverageBreach.current) {
      setLeverageBreachKey(k => k + 1)
    }
    prevLeverageBreach.current = leverageBreach
  }, [leverageBreach])

  const covenants = [
    {
      label: 'Interest Coverage', formula: 'EBITDA / Interest',
      current: coverage.toFixed(2) + 'x', threshold: `Min ${coverageThreshold.toFixed(2)}x`,
      breach: coverageBreach,
      breachAt: `EBITDA < $${ebitdaForCoverageBreachAt.toFixed(0)}M triggers breach`,
      animKey: coverageBreachKey,
    },
    {
      label: 'Leverage Ratio', formula: 'Debt / EBITDA',
      current: leverage.toFixed(2) + 'x', threshold: `Max ${leverageThreshold.toFixed(2)}x`,
      breach: leverageBreach,
      breachAt: `EBITDA < $${ebitdaForLeverageBreachAt.toFixed(0)}M triggers breach`,
      animKey: leverageBreachKey,
    },
  ]

  return (
    <div>
      <style>{`
        @keyframes covenant-flash {
          0%   { background-color: #fee2e2; }
          25%  { background-color: #fca5a5; }
          50%  { background-color: #fee2e2; }
          75%  { background-color: #fca5a5; }
          100% { background-color: #dc262608; }
        }
        .covenant-breach {
          animation: covenant-flash 0.6s ease-in-out 3;
        }
      `}</style>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {covenants.map(({ label, formula, current, threshold, breach, breachAt, animKey }) => (
          <div
            key={`${label}-${animKey}`}
            className={breach ? 'covenant-breach' : undefined}
            style={{
              padding: '1rem',
              background: breach ? '#dc262608' : '#1b433208',
              border: `2px solid ${breach ? '#dc2626' : '#1b4332'}`,
              borderRadius: '0.625rem',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{formula}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: breach ? '#dc2626' : '#1b4332', marginBottom: '0.25rem' }}>{current}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Covenant: {threshold}</div>
            <div style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', background: breach ? '#dc262618' : '#1b433218', display: 'inline-block' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: breach ? '#dc2626' : '#1b4332' }}>
                {breach ? '⚠ COVENANT BREACH' : '✓ In compliance'}
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
