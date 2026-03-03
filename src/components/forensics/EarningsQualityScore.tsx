import { useState } from 'react'

interface Metric {
  id: string
  label: string
  question: string
  chapter: number
  weight: number // 1-3 (higher = more impactful)
  goodValue: string
  badValue: string
  type: 'ratio' | 'trend' | 'boolean'
  options?: { label: string; value: number; description: string }[]
}

const METRICS: Metric[] = [
  {
    id: 'cfo_ni',
    label: 'CFO / Net Income Ratio',
    question: 'Cash from Operations relative to Net Income (3-year average)',
    chapter: 7,
    weight: 3,
    goodValue: '> 1.0×',
    badValue: '< 0.5×',
    type: 'ratio',
    options: [
      { label: '> 1.2× (Strong cash conversion)', value: 100, description: 'CFO consistently exceeds NI — accruals are conservative' },
      { label: '0.8–1.2× (Acceptable)', value: 70, description: 'Normal range for most businesses with reasonable accruals' },
      { label: '0.5–0.8× (Elevated concern)', value: 40, description: 'Earnings outpacing cash — watch for widening gap over time' },
      { label: '< 0.5× (Red flag)', value: 10, description: 'Major quality concern — significant portion of earnings is accrual-based' },
    ],
  },
  {
    id: 'dso_trend',
    label: 'DSO Trend (3-Year)',
    question: 'Days Sales Outstanding trend over 3 years',
    chapter: 2,
    weight: 2,
    goodValue: 'Stable or declining',
    badValue: 'Rising > 10 days/year',
    type: 'trend',
    options: [
      { label: 'Declining or stable (< 5 days change)', value: 100, description: 'Improving or stable cash collection efficiency' },
      { label: 'Rising 5–15 days over 3 years', value: 60, description: 'Moderate concern — investigate credit terms and customer quality' },
      { label: 'Rising > 15 days over 3 years', value: 20, description: 'Significant concern — possible premature recognition or channel stuffing' },
    ],
  },
  {
    id: 'rev_recognition',
    label: 'Revenue Recognition Consistency',
    question: 'Has the company changed revenue recognition policy or estimates in the past 2 years?',
    chapter: 2,
    weight: 2,
    goodValue: 'No changes',
    badValue: 'Multiple changes',
    type: 'boolean',
    options: [
      { label: 'No policy or estimate changes', value: 100, description: 'Consistent treatment — reduces manipulation risk' },
      { label: 'One change with clear business rationale', value: 65, description: 'Acceptable if well-disclosed and justified' },
      { label: 'Multiple changes or unclear rationale', value: 15, description: 'High risk — changes near guidance deadlines or covenant tests are suspect' },
    ],
  },
  {
    id: 'inventory_trend',
    label: 'Inventory vs Revenue Growth',
    question: 'How has inventory grown relative to revenue over 3 years?',
    chapter: 3,
    weight: 2,
    goodValue: 'In-line with revenue',
    badValue: 'Growing 2× faster than revenue',
    type: 'trend',
    options: [
      { label: 'Inventory growing in-line or slower than revenue', value: 100, description: 'Efficient inventory management — no accumulation concern' },
      { label: 'Inventory growing 10–50% faster than revenue', value: 65, description: 'Monitor — may reflect demand softening or build-ahead strategy' },
      { label: 'Inventory growing > 50% faster than revenue', value: 20, description: 'Red flag — demand weakness, write-down risk, or phantom inventory' },
    ],
  },
  {
    id: 'capex_quality',
    label: 'Capex Consistency',
    question: 'How does capex as % of revenue compare to industry peers and prior years?',
    chapter: 4,
    weight: 2,
    goodValue: 'In-line with peers',
    badValue: 'Significantly above peers without explanation',
    type: 'trend',
    options: [
      { label: 'In-line with industry and stable over time', value: 100, description: 'Normal capital intensity — no manipulation signal' },
      { label: 'Moderately above peers with reasonable explanation', value: 70, description: 'Acceptable if capex reflects genuine growth investment' },
      { label: 'Significantly above peers without clear explanation', value: 25, description: 'Risk of expense capitalization fraud (WorldCom pattern)' },
    ],
  },
  {
    id: 'goodwill_pct',
    label: 'Goodwill Concentration',
    question: 'Goodwill as % of Total Assets',
    chapter: 9,
    weight: 2,
    goodValue: '< 20%',
    badValue: '> 50%',
    type: 'ratio',
    options: [
      { label: '< 20% of Total Assets', value: 100, description: 'Modest acquisition footprint — goodwill impairment risk limited' },
      { label: '20–40% of Total Assets', value: 70, description: 'Moderate concentration — monitor acquisition integration performance' },
      { label: '> 40% of Total Assets', value: 30, description: 'High concentration — acquisitions must deliver synergies to justify carried goodwill' },
    ],
  },
  {
    id: 'non_gaap_gap',
    label: 'GAAP vs Non-GAAP EPS Gap',
    question: 'How much does management\'s "adjusted" EPS exceed reported GAAP EPS?',
    chapter: 6,
    weight: 2,
    goodValue: '< 10% gap',
    badValue: '> 30% gap',
    type: 'ratio',
    options: [
      { label: '< 10% gap (GAAP and adjusted nearly equal)', value: 100, description: 'Adjustments are minimal — reported earnings are reliable' },
      { label: '10–25% gap', value: 65, description: 'Moderate — investigate which items are excluded and whether they recur' },
      { label: '> 25% gap (adjustments significantly inflate metrics)', value: 25, description: 'Large adjustments reduce reliability of "adjusted" earnings as a quality metric' },
    ],
  },
  {
    id: 'governance',
    label: 'Corporate Governance Quality',
    question: 'Governance assessment: board independence, audit committee quality, auditor tenure',
    chapter: 10,
    weight: 3,
    goodValue: 'Strong independence',
    badValue: 'Multiple governance concerns',
    type: 'boolean',
    options: [
      { label: 'Strong: independent board majority, expert audit committee, <10yr auditor', value: 100, description: 'Robust oversight structure reduces manipulation opportunity' },
      { label: 'Adequate: some concerns but no major red flags', value: 65, description: 'Monitor for specific governance events (director departures, audit changes)' },
      { label: 'Weak: dominant CEO, non-expert audit committee, or stale auditor relationship', value: 20, description: 'High opportunity element of fraud triangle — management can dominate financial reporting' },
    ],
  },
  {
    id: 'fraud_triangle',
    label: 'Fraud Pressure Assessment',
    question: 'What is the overall Fraud Triangle pressure level?',
    chapter: 10,
    weight: 3,
    goodValue: 'Low pressure',
    badValue: 'Multiple pressure factors active',
    type: 'boolean',
    options: [
      { label: 'Low pressure: no covenant concerns, compensation not overly tied to EPS', value: 100, description: 'Minimal motivation to manipulate — fraud triangle incomplete' },
      { label: 'Moderate pressure: some guidance pressure or EPS-linked comp', value: 55, description: 'Watch for earnings management as pressures intensify' },
      { label: 'High pressure: approaching covenants, heavy EPS comp, financial distress', value: 15, description: 'All fraud triangle elements active — maximum skepticism required' },
    ],
  },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#1b4332' : score >= 50 ? '#d97706' : score >= 30 ? '#7c2d12' : '#dc2626'
  const label = score >= 75 ? 'High Quality' : score >= 50 ? 'Adequate' : score >= 30 ? 'Below Average' : 'Low Quality'
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem', background: `${color}10`, border: `2px solid ${color}40`, borderRadius: '0.75rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
        Earnings Quality Score
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color, lineHeight: 1 }}>
        {score}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color, fontWeight: 600, marginTop: '0.25rem' }}>
        / 100 · {label}
      </div>
    </div>
  )
}

export default function EarningsQualityScore() {
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const totalWeight = METRICS.reduce((s, m) => s + m.weight, 0)
  const answeredMetrics = METRICS.filter(m => answers[m.id] !== undefined)
  const weightedScore = answeredMetrics.length === 0 ? 0
    : Math.round(
        answeredMetrics.reduce((sum, m) => sum + (answers[m.id] ?? 0) * m.weight, 0) /
        answeredMetrics.reduce((sum, m) => sum + m.weight, 0)
      )

  const completionPct = Math.round((answeredMetrics.length / METRICS.length) * 100)

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
          Capstone Tool
        </div>
        <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          Earnings Quality Score
        </h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Evaluate any public company across 9 dimensions spanning all 10 chapters. Weighted by forensic importance. Assess each metric and receive a composite earnings quality score (0–100).
        </p>
      </div>

      {/* Score + completion */}
      {answeredMetrics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <ScoreBadge score={weightedScore} />
          <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Assessment Progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <span>Metrics assessed</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{answeredMetrics.length} / {METRICS.length}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: 'var(--color-accent)', width: `${completionPct}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Score weight used: {Math.round(answeredMetrics.reduce((s, m) => s + m.weight, 0) / totalWeight * 100)}% of total
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {METRICS.map(metric => {
          const selected = answers[metric.id]
          return (
            <div key={metric.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
              {/* Metric header */}
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(74,10,18,0.04)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>{metric.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', padding: '1px 6px', borderRadius: '9999px', border: '1px solid var(--color-border)', background: 'var(--color-base)' }}>
                      Ch{metric.chapter}
                    </span>
                    {'★'.repeat(metric.weight)} <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>weight</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{metric.question}</div>
                </div>
                {selected !== undefined && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px',
                    color: selected >= 75 ? '#1b4332' : selected >= 50 ? '#d97706' : '#dc2626',
                    background: selected >= 75 ? '#1b433218' : selected >= 50 ? '#d9770618' : '#dc262618',
                  }}>
                    {selected}
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {metric.options!.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, [metric.id]: opt.value }))}
                    style={{
                      textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid',
                      borderColor: selected === opt.value ? (opt.value >= 75 ? '#1b4332' : opt.value >= 50 ? '#d97706' : '#dc2626') : 'var(--color-border)',
                      background: selected === opt.value ? (opt.value >= 75 ? '#1b433212' : opt.value >= 50 ? '#d9770612' : '#dc262612') : 'transparent',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: selected === opt.value ? 600 : 400, color: 'var(--color-text)' }}>{opt.label}</div>
                    {selected === opt.value && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={() => setAnswers({})} style={{ marginTop: '1rem', padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
        Reset Assessment
      </button>
    </div>
  )
}
